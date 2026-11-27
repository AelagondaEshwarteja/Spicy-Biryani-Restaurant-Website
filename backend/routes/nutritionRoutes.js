const express = require('express');
const { analyzeMeal } = require('../controllers/nutritionController');

const router = express.Router();

router.post('/analyze', analyzeMeal);

module.exports = router;
