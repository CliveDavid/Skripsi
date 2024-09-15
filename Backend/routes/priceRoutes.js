const express = require('express');
const router = express.Router();
const { Product, Price } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Get Price
router.post('/get-price', asyncHandler(async (req, res) => {
    const { productId, boxTypeCode } = req.body;
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
  
    const price = await Price.findOne({
      where: {
        prod_type_code: product.prod_type_code,
        box_type_code: boxTypeCode
      }
    });
  
    if (!price) {
      return res.status(404).json({ message: 'Price not found' });
    }
  
    res.json({ price: price.price });
  }));


module.exports = router;