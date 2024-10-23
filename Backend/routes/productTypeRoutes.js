const express = require('express');
const router = express.Router();
const { ProductType } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get-all', asyncHandler(async (req, res) => {
    const productTypes = await ProductType.findAll();
    res.json(productTypes);
}));

router.post('/get-kvp', asyncHandler(async (req, res) => {
    const productTypes = await ProductType.findAll({
        attributes: ['prod_type_code', 'descr']
    });
    const kvp = productTypes.map(pt => ({ 
        value: pt.prod_type_code, 
        label: pt.descr 
    }));
    res.json(kvp);
}));

router.post('/create', asyncHandler(async (req, res) => {
    const { prod_type_code, descr } = req.body;
    const productType = await ProductType.create({
        prod_type_code,
        descr
    });
    res.status(201).json(productType);
}));

router.post('/update', asyncHandler(async (req, res) => {
    const { prod_type_id, prod_type_code, descr } = req.body;
    const productType = await ProductType.findByPk(prod_type_id);
    if (!productType) {
        return res.status(404).json({ message: 'Product type not found' });
    }
    await productType.update({ prod_type_code, descr });
    res.json(productType);
}));

router.post('/delete', asyncHandler(async (req, res) => {
    const { prod_type_id } = req.body;
    const productType = await ProductType.findByPk(prod_type_id);
    if (!productType) {
        return res.status(404).json({ message: 'Product type not found' });
    }
    await productType.destroy();
    res.status(204).send();
}));

module.exports = router;