const express = require('express');
const router = express.Router();
const {
    Admin
} = require('../models');
const bcrypt = require('bcrypt');

// Get all admins
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.findAll();
        res.json(admins);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Create a new admin
router.post('/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const admin = await Admin.create({
            ...req.body,
            password_hash: hashedPassword
        });
        res.status(201).json(admin);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Update an admin
router.put('/:id', async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);
        if (admin) {
            if (req.body.password) {
                req.body.password_hash = await bcrypt.hash(req.body.password, 10);
            }
            await admin.update(req.body);
            res.json(admin);
        } else {
            res.status(404).json({
                error: 'Admin not found'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

module.exports = router;