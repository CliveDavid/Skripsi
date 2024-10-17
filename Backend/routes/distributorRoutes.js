const express = require('express');
const router = express.Router();
const { sequelize, Distributor, DistributorAddress, OTP } = require('../models');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const { sendMail } = require('../utils/email'); 

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);


// Distributor Login
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const distributor = await Distributor.findOne({ where: { email } });

    if (!distributor) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, distributor.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set session data
    req.session.distributor = {
        distributor_id: distributor.distributor_id,
        email: distributor.email,
    };

    res.json({
        message: 'Logged in successfully',
        distributor_id: distributor.distributor_id,
        email: distributor.email,
    });
}));

// Distributor Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get all distributors
router.post('/get-all', asyncHandler(async (req, res) => {
    const distributors = await Distributor.findAll({
        attributes: {
            exclude: ['password']
        }
    });
    res.json(distributors);
}));

// Search
router.post('/search', asyncHandler(async (req, res) => {
    const { term } = req.body;
    
    if (!term) {
        return res.json([]);
    }

    const distributors = await Distributor.findAll({
        where: {
            [Op.and]: [
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('name')),
                    'LIKE',
                    '%' + term.toLowerCase() + '%'
                ),
                { is_active: true } 
            ]
        },
        attributes: [
            'distributor_id',
            [
                Sequelize.literal(`
                    CASE 
                        WHEN (SELECT COUNT(*) FROM distributor d WHERE LOWER(d.name) = LOWER(distributor.name)) > 1 
                        THEN CONCAT(distributor.name, ' (', distributor.distributor_id, ')') 
                        ELSE distributor.name 
                    END
                `), 
                'name' 
            ]
        ],
        limit: 10
    });
    
    res.json(distributors);
}));

// Get distributor by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const {
        id
    } = req.body;
    const distributor = await Distributor.findByPk(id, {
        attributes: {
            exclude: ['password']
        }
    });
    if (!distributor) {
        return res.status(404).json({
            message: 'Distributor not found'
        });
    }
    res.json(distributor);
}));

// Create new distributor
router.post('/create', asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        address,
        addr_details,
        city,
        province,
        zipcode,
        district,
        subdistrict,
        is_active
    } = req.body;
        
    const existingDistributor = await Distributor.findOne({ where: { email } });
    if (existingDistributor) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const result = await sequelize.transaction(async (t) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newDistributor = await Distributor.create({
            name,
            email,
            password: hashedPassword,
            is_active
        }, { transaction: t });

        await DistributorAddress.create({
            distributor_id: newDistributor.distributor_id,
            address,
            addr_details,
            city,
            province,
            zipcode,
            district,
            subdistrict,
            phone
        }, { transaction: t });

        return newDistributor;
    });

    const { password: _, ...distributorWithoutPassword } = result.toJSON();
    res.status(201).json(distributorWithoutPassword);
}));

// Update distributor
router.post('/update', asyncHandler(async (req, res) => {
    const {
        distributor_id,
        name,
        email,
        password,
        phone,
        address,
        addr_details,
        city,
        province,
        zipcode,
        district,
        subdistrict,
        is_active
    } = req.body;

    const result = await sequelize.transaction(async (t) => {
        const distributor = await Distributor.findByPk(distributor_id, { transaction: t });
        if (!distributor) {
            throw new Error('Distributor not found');
        }

        const updates = { name, email, is_active };
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        await distributor.update(updates, { transaction: t });

        await DistributorAddress.update(
            { address, addr_details, city, province, zipcode, district, subdistrict, phone },
            { where: { distributor_id }, transaction: t }
        );

        return distributor;
    });

    const { password: _, ...updatedDistributorWithoutPassword } = result.toJSON();
    res.json(updatedDistributorWithoutPassword);
}));

// Register
router.post('/register', asyncHandler(async (req, res) => {
    const {
        name, email, password, phone,
        address, addr_details, city, province, zipcode, district, subdistrict
    } = req.body;
        
    const existingDistributor = await Distributor.findOne({ where: { email } });
    if (existingDistributor) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const result = await sequelize.transaction(async (t) => {
        const newDistributor = await Distributor.create({
            name, email, password: hashedPassword, is_active: false
        }, { transaction: t });

        await DistributorAddress.create({
            distributor_id: newDistributor.distributor_id,
            address, addr_details, city, province, zipcode, district, subdistrict, phone
        }, { transaction: t });

        await OTP.create({
            distributor_id: newDistributor.distributor_id,
            otp, otp_expires_at: otpExpiresAt
        }, { transaction: t });

        return newDistributor;
    });

    // Send OTP via email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - OTP Code',
        text: `Dear ${name},\n\nPlease verify your email by entering this OTP: ${otp}\n\nThe OTP will expire in 15 minutes.\n\nBest regards,\nPT Sadang Jaya`
    };

    await sendMail(mailOptions);

    res.status(201).json({ message: 'Registration successful. Please check your email for the OTP.' });    
}));

// Resend OTP
router.post('/resend-otp', asyncHandler(async (req, res) => {
    const { email } = req.body;

    const distributor = await Distributor.findOne({ where: { email } });

    if (!distributor) {
        return res.status(404).json({ message: 'Distributor not found' });
    }

    // Check if the distributor is already verified
    if (distributor.is_active) {
        return res.status(400).json({ message: 'Account is already verified' });
    }

    // Generate new OTP and set new expiration time
    const newOtp = generateOTP();
    const newOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // New OTP expires in 15 minutes

    // Update or create OTP record
    await OTP.upsert({
        distributor_id: distributor.distributor_id,
        otp: newOtp,
        otp_expires_at: newOtpExpiresAt
    });

    // Send new OTP via email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'New OTP Code for Email Verification',
        text: `Dear ${distributor.name},\n\nYou have requested a new OTP. Please verify your email by entering this new OTP: ${newOtp}\n\nThe OTP will expire in 15 minutes.\n\nBest regards,\nPT Sadang Jaya`
    };

    await sendMail(mailOptions);

    res.status(200).json({ message: 'New OTP sent successfully. Please check your email.' });
}));

router.post('/verify-otp', asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const distributor = await Distributor.findOne({ where: { email } });

    if (!distributor) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otpRecord = await OTP.findOne({
        where: { 
            distributor_id: distributor.distributor_id,
            otp: otp,
            otp_expires_at: { [Op.gt]: new Date() }
        }
    });

    if (otpRecord) {
        await Distributor.update({ is_active: true }, { where: { distributor_id: distributor.distributor_id } });
        await OTP.destroy({ where: { distributor_id: distributor.distributor_id } });

        return res.status(200).json({ success: true, message: 'Account verified successfully' });
    } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
}));

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

// Get distributor full address
router.post('/get-distributor-full-address', asyncHandler(async (req, res) => {
    const { distributor_id } = req.body;

    if (!distributor_id) {
        return res.status(400).json({ message: 'Distributor ID is required' });
    }

    const distributor = await Distributor.findByPk(distributor_id, {
        include: [{
            model: DistributorAddress,
            attributes: ['address', 'addr_details', 'city', 'province', 'zipcode', 'district', 'subdistrict']
        }]
    });

    if (!distributor || !distributor.distributor_address) {
        return res.status(404).json({ message: 'Distributor or address not found' });
    }

    const addr = distributor.distributor_address;
    const fullAddress = `${addr.address}${addr.addr_details ? ', ' + addr.addr_details : ''}, ${addr.subdistrict}, ${addr.district}, ${addr.city}, ${addr.province} ${addr.zipcode}`;

    res.json({ address: fullAddress });
}));

// distributor get address
router.post('/get-address', async (req, res) => {
    try {
        const { distributor_id } = req.body;
        const address = await DistributorAddress.findOne({
            where: { distributor_id }
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json(address);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get personal information for edit
router.post('/get-personal-info', async (req, res) => {
    try {
        const { distributor_id } = req.body;
        const distributor = await Distributor.findByPk(distributor_id, {
            attributes: ['name', 'email']
        });

        if (!distributor) {
            return res.status(404).json({ message: 'Distributor not found' });
        }

        const [firstName, ...lastNameParts] = distributor.name.split(' ');
        const lastName = lastNameParts.join(' ');

        res.json({
            firstName,
            lastName,
            email: distributor.email
        });
    } catch (error) {
        console.error('Error fetching personal info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update personal information
router.post('/update-personal-info', async (req, res) => {
    try {
        const { distributor_id, firstName, lastName, email, currentPassword, newPassword } = req.body;
        const distributor = await Distributor.findByPk(distributor_id);

        if (!distributor) {
            return res.status(404).json({ message: 'Distributor not found' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, distributor.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update distributor information
        distributor.name = `${firstName} ${lastName}`.trim();
        distributor.email = email;

        if (newPassword) {
            distributor.password = await bcrypt.hash(newPassword, 10);
        }

        await distributor.save();

        res.json({ message: 'Personal information updated successfully' });
    } catch (error) {
        console.error('Error updating personal info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update address information
router.post('/update-address', async (req, res) => {
    try {
        const { distributor_id, addr_details, city, province, zipcode, district, subdistrict, phone } = req.body;
        const [address, created] = await DistributorAddress.findOrCreate({
            where: { distributor_id },
            defaults: { distributor_id }
        });

        address.address = `${subdistrict}, ${district}, ${city}, ${province}, ${zipcode}`;
        address.addr_details = addr_details;
        address.city = city;
        address.province = province;
        address.zipcode = zipcode;
        address.district = district;
        address.subdistrict = subdistrict;
        address.phone = phone;

        await address.save();

        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


  


module.exports = router;