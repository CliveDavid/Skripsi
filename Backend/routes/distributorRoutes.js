const express = require('express');
const router = express.Router();
const { Distributor } = require('../models');
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
        is_active
    } = req.body;
        
    const existingDistributor = await Distributor.findOne({
        where: {
            email
        }
    });
    if (existingDistributor) {
        return res.status(400).json({
            message: 'Email already exists'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDistributor = await Distributor.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        addr_details,
        city,
        province,
        zipcode,
        is_active
    });

    const {
        password: _,
        ...distributorWithoutPassword
    } = newDistributor.toJSON();
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
        is_active
    } = req.body;
    const distributor = await Distributor.findByPk(distributor_id);
    if (!distributor) {
        return res.status(404).json({
            message: 'Distributor not found'
        });
    }

    const updates = {
        name,
        email,
        phone,
        address,
        addr_details,
        city,
        province,
        zipcode,
        is_active
    };

    if (password) {
        updates.password = await bcrypt.hash(password, 10);
    }

    await distributor.update(updates);

    const {
        password: _,
        ...updatedDistributorWithoutPassword
    } = distributor.toJSON();
    res.json(updatedDistributorWithoutPassword);
}));


// Register
router.post('/register', asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        address,
        addr_details,
        city,
        province,
        zipcode
    } = req.body;
        
    // Check if the email already exists
    const existingDistributor = await Distributor.findOne({
        where: { email }
    });
    if (existingDistributor) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and set expiration time (e.g., 15 minutes from now)
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP expires in 15 minutes

    // Create a new distributor 
    const newDistributor = await Distributor.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        addr_details,
        city,
        province,
        zipcode,
        otp,
        otp_expires_at: otpExpiresAt,
        is_active: false
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

    // Find the distributor by email
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

    // Update distributor with new OTP and expiration time
    await distributor.update({
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

    // Find the user by email
    const distributor = await Distributor.findOne({ where: { email } });

    if (!distributor) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if OTP matches and is not expired
    if (distributor.otp === otp && new Date() < distributor.otp_expires_at) {
        distributor.is_active = true;
        distributor.otp = null; // Clear OTP after successful verification
        distributor.otp_expires_at = null; // Clear expiration time
        await distributor.save();

        return res.status(200).json({ success: true, message: 'Account verified successfully' });
    } else {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
}));

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

// Get distributor address
router.post('/get-address', asyncHandler(async (req, res) => {
    const { distributor_id } = req.body;

    if (!distributor_id) {
        return res.status(400).json({ message: 'Distributor ID is required' });
    }

    const distributor = await Distributor.findByPk(distributor_id, {
        attributes: ['address', 'addr_details', 'city', 'province', 'zipcode']
    });

    if (!distributor) {
        return res.status(404).json({ message: 'Distributor not found' });
    }

    const fullAddress = `${distributor.address}${distributor.addr_details ? ', ' + distributor.addr_details : ''}, ${distributor.city}, ${distributor.province} ${distributor.zipcode}`;

    res.json({ address: fullAddress });
}));
  


module.exports = router;