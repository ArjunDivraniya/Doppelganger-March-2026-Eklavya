const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// POST /feedback - store developer feedback
router.post('/', feedbackController.submitFeedback);

module.exports = router;
