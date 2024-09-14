const express = require('express');
const router = express.Router();
const { BoxType  } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get-box-type-kvp', asyncHandler(async (req, res) => {
    const boxTypes = await BoxType.findAll({
        attributes: ['box_type_code', 'box_capacity']
    });
    const kvp = boxTypes.map(bt => ({ value: bt.box_type_code, label: `${bt.box_type_code} (${bt.box_capacity})` }));
    res.json(kvp);
}));

module.exports = router;