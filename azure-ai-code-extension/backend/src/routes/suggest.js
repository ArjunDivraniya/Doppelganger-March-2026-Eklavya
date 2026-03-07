const express = require('express');
const router = express.Router();
const suggestController = require('../controllers/suggestController');

// POST /suggest — receive code context, return AI suggestion
router.post('/', suggestController.handleSuggest);

module.exports = router;
