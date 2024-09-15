const express = require('express');
const router = express.Router();
const { ShipmentMethod } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get-shipment-method-kvp', asyncHandler(async (req, res) => {
    const shipmentMethods = await ShipmentMethod.findAll({
        attributes: ['shipment_code', 'shipment_name']
    });
    const kvp = shipmentMethods.map(sm => ({ 
        value: sm.shipment_code, 
        label: sm.shipment_name 
    }));
    res.json(kvp);
}));

module.exports = router;