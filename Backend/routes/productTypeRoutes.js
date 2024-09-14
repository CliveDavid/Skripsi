const express = require('express');
const router = express.Router();
const { ProductType } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get-product-type-kvp', asyncHandler(async (req, res) => {
    const productTypes = await ProductType.findAll({
        attributes: ['prod_type_code', 'descr']
    });
    const kvp = productTypes.map(pt => ({ value: pt.prod_type_code, label: pt.descr }));
    res.json(kvp);
}));

module.exports = router;