const express = require('express');
const router = express.Router();
const {
    Admin
} = require('../models'); // Adjust the path as needed
const bcrypt = require('bcrypt');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all admins
router.post('/get-all', asyncHandler(async (req, res) => {
    const admins = await Admin.findAll({
        attributes: ['admin_id', 'username', 'is_active']
    });
    res.json(admins);
}));

// Get admin by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const {
        admin_id
    } = req.body;
    const admin = await Admin.findByPk(admin_id, {
        attributes: ['admin_id', 'username', 'is_active']
    });
    if (!admin) {
        return res.status(404).json({
            message: 'Admin not found'
        });
    }
    res.json(admin);
}));

// Create new admin
router.post('/create', asyncHandler(async (req, res) => {
    const {
        username,
        password,
        is_active
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
        username,
        password: hashedPassword,
        is_active
    });
    res.status(201).json({
        admin_id: newAdmin.admin_id,
        username: newAdmin.username,
        is_active: newAdmin.is_active
    });
}));

// Update admin
router.post('/update', asyncHandler(async (req, res) => {
    const {
        admin_id,
        username,
        password,
        is_active
    } = req.body;
    const admin = await Admin.findByPk(admin_id);
    if (!admin) {
        return res.status(404).json({
            message: 'Admin not found'
        });
    }

    const updates = {};
    if (username) updates.username = username;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (is_active !== undefined) updates.is_active = is_active;

    await admin.update(updates);
    res.json({
        admin_id: admin.admin_id,
        username: admin.username,
        is_active: admin.is_active
    });
}));

module.exports = router;