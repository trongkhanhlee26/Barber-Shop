const express = require('express');
const router = express.Router();
const Service = require('../model/service');

router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.render("service", { services });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
