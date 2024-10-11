const express = require('express');
const router = express.Router();
const { Distributor } = require('../models');
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

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

module.exports = router;