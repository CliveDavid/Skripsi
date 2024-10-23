const express = require('express');
const router = express.Router();
const { BoxType  } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get-all', asyncHandler(async (req, res) => {
    const boxTypes = await BoxType.findAll();
    res.json(boxTypes);
}));

router.post('/get-kvp', asyncHandler(async (req, res) => {
    const boxTypes = await BoxType.findAll({
        attributes: ['box_type_code', 'box_capacity']
    });
    const kvp = boxTypes.map(bt => ({ 
        value: bt.box_type_code, 
        label: `${bt.box_type_code} (Capacity: ${bt.box_capacity})`
    }));
    res.json(kvp);
}));

router.post('/create', asyncHandler(async (req, res) => {
    const { box_type_code, box_capacity } = req.body;
    const boxType = await BoxType.create({
        box_type_code,
        box_capacity
    });
    res.status(201).json(boxType);
}));

router.post('/update', asyncHandler(async (req, res) => {
    const { box_type_id, box_type_code, box_capacity } = req.body;
    const boxType = await BoxType.findByPk(box_type_id);
    if (!boxType) {
        return res.status(404).json({ message: 'Box type not found' });
    }
    await boxType.update({ box_type_code, box_capacity });
    res.json(boxType);
}));

router.post('/delete', asyncHandler(async (req, res) => {
    const { box_type_id } = req.body;
    const boxType = await BoxType.findByPk(box_type_id);
    if (!boxType) {
        return res.status(404).json({ message: 'Box type not found' });
    }
    await boxType.destroy();
    res.status(204).send();
}));

module.exports = router;