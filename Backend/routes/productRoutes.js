const express = require('express');
const router = express.Router();
const { Product, ProductType } = require('../models');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    }
});

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get all products
router.post('/get-all', asyncHandler(async (req, res) => {
    const products = await Product.findAll({
        include: [{
            model: ProductType,
            attributes: ['descr']
        }],
        attributes: { exclude: ['image'] },
        raw: true, // returns plain object instead of model
        nest: true
    });

    const flattenedProducts = products.map(product => ({
        ...product,
        product_type_descr: product.product_type.descr,
        product_type: undefined
    }));

    res.json(flattenedProducts);
}));

// Get product by ID
router.post('/get-by-id', asyncHandler(async (req, res) => {
    const { id } = req.body;
    const product = await Product.findByPk(id, {
        include: [{
            model: ProductType,
            attributes: ['descr']
        }],
        attributes: { exclude: ['image'] }
    });
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
}));

// Create new product
router.post('/create', asyncHandler(async (req, res) => {
    const { prod_code, prod_name, prod_type_code, descr, is_active, image } = req.body;
    
    const existingProduct = await Product.findOne({ where: { prod_code } });
    if (existingProduct) {
        return res.status(400).json({ message: 'Product code already exists' });
    }

    // Convert base64 to buffer
    let imageBuffer = null;
    if (image) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
    }

    const newProduct = await Product.create({
        prod_code,
        prod_name,
        prod_type_code,
        descr,
        image: imageBuffer,
        is_active
    });

    const { image: _, ...productWithoutImage } = newProduct.get({ plain: true }); // exclude image
    res.status(201).json(productWithoutImage);
}));

// Update product
router.post('/update', asyncHandler(async (req, res) => {
    const { prod_id, prod_code, prod_name, prod_type_code, descr, is_active, image } = req.body;
    
    const product = await Product.findByPk(prod_id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Convert base64 to buffer if new image is provided
    let imageBuffer = undefined;
    if (image) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
    }

    await product.update({
        prod_code,
        prod_name,
        prod_type_code,
        descr,
        image: imageBuffer !== undefined ? imageBuffer : product.image,
        is_active
    });

    const { image: _, ...productWithoutImage } = product.get({ plain: true });
    res.json(productWithoutImage);
}));

// Get Product Image
router.get('/image', asyncHandler(async (req, res) => {
    const { id } = req.query; 
    const product = await Product.findByPk(id, {
        attributes: ['image']
    });
    if (!product || !product.image) {
        return res.status(404).json({ message: 'Image not found' });
    }
    res.contentType('image/jpeg');
    res.send(product.image);
}));

router.post('/get-product-kvp', asyncHandler(async (req, res) => {
    const products = await Product.findAll({
        attributes: ['prod_id', 'prod_name'],
        where: { is_active: true }
    });
    const kvp = products.map(p => ({ 
        value: p.prod_id, 
        label: p.prod_name 
    }));
    res.json(kvp);
}));


module.exports = router;