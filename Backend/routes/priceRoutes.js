const express = require('express');
const router = express.Router();
const { Product, Price } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get', asyncHandler(async (req, res) => {
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

router.post('/get-all', asyncHandler(async (req, res) => {
  const prices = await Price.findAll();
  res.json(prices);
}));

router.post('/create', asyncHandler(async (req, res) => {
  const { box_type_code, prod_type_code, price } = req.body;
  const priceEntry = await Price.create({
      box_type_code,
      prod_type_code,
      price
  });
  res.status(201).json(priceEntry);
}));

router.post('/update', asyncHandler(async (req, res) => {
  const { price_id, box_type_code, prod_type_code, price } = req.body;
  const priceEntry = await Price.findByPk(price_id);
  if (!priceEntry) {
      return res.status(404).json({ message: 'Price entry not found' });
  }
  await priceEntry.update({ box_type_code, prod_type_code, price });
  res.json(priceEntry);
}));

router.post('/delete', asyncHandler(async (req, res) => {
  const { price_id } = req.body;
  const priceEntry = await Price.findByPk(price_id);
  if (!priceEntry) {
      return res.status(404).json({ message: 'Price entry not found' });
  }
  await priceEntry.destroy();
  res.status(204).send();
}));

module.exports = router;