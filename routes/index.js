const express = require('express');
const router = express.Router();
const fibonacciController = require('../controllers/ctr_fibonacci');

router.get('/fibonacci', fibonacciController.getFibonacci);

module.exports = router;