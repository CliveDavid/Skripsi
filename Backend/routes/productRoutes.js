const express = require('express');
const router = express.Router();
const { Product, ProductType } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all products
router.post('/get-all', asyncHandler(async (req, res) => {
    const products = await Product.findAll({
        include: [{
            model: ProductType,
            attributes: ['descr']
        }]
    });
    res.json(products);
}));

// Get product by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { id } = req.body;
    const product = await Product.findByPk(id, {
        include: [{
            model: ProductType,
            attributes: ['descr']
        }]
    });
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
}));

// Create new product
router.post('/create', asyncHandler(async (req, res) => {
    const { prod_code, prod_name, prod_type_code, descr, image } = req.body;
    
    const existingProduct = await Product.findOne({ where: { prod_code } });
    if (existingProduct) {
        return res.status(400).json({ message: 'Product code already exists' });
    }

    const newProduct = await Product.create({
        prod_code,
        prod_name,
        prod_type_code,
        descr,
        image
    });

    res.status(201).json(newProduct);
}));

// Update product
router.post('/update', asyncHandler(async (req, res) => {
    const { prod_id, prod_code, prod_name, prod_type_code, descr, image } = req.body;
    const product = await Product.findByPk(prod_id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
        prod_code,
        prod_name,
        prod_type_code,
        descr,
        image
    });

    res.json(product);
}));

module.exports = router;