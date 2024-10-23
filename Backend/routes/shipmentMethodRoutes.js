const express = require('express');
const router = express.Router();
const { ShipmentMethod } = require('../models');

// Middleware to handle errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/get-all', asyncHandler(async (req, res) => {
    const shipmentMethods = await ShipmentMethod.findAll();
    res.json(shipmentMethods);
}));

router.post('/get-kvp', asyncHandler(async (req, res) => {
    const shipmentMethods = await ShipmentMethod.findAll({
        attributes: ['shipment_code', 'shipment_name']
    });
    const kvp = shipmentMethods.map(sm => ({ 
        value: sm.shipment_code, 
        label: sm.shipment_name 
    }));
    res.json(kvp);
}));

router.post('/create', asyncHandler(async (req, res) => {
    const { shipment_code, shipment_name, capacity } = req.body;
    const shipmentMethod = await ShipmentMethod.create({
        shipment_code,
        shipment_name,
        capacity
    });
    res.status(201).json(shipmentMethod);
}));

router.post('/update', asyncHandler(async (req, res) => {
    const { shipment_id, shipment_code, shipment_name, capacity } = req.body;
    const shipmentMethod = await ShipmentMethod.findByPk(shipment_id);
    if (!shipmentMethod) {
        return res.status(404).json({ message: 'Shipment method not found' });
    }
    await shipmentMethod.update({ shipment_code, shipment_name, capacity });
    res.json(shipmentMethod);
}));

router.post('/delete', asyncHandler(async (req, res) => {
    const { shipment_id } = req.body;
    const shipmentMethod = await ShipmentMethod.findByPk(shipment_id);
    if (!shipmentMethod) {
        return res.status(404).json({ message: 'Shipment method not found' });
    }
    await shipmentMethod.destroy();
    res.status(204).send();
}));

module.exports = router;