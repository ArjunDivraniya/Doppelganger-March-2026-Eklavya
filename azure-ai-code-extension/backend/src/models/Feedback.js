const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        suggestion: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: String,
            required: true,
            enum: ['positive', 'negative'],
        },
        sdkType: {
            type: String,
            default: '',
            trim: true,
        },
        intent: {
            type: String,
            default: '',
            trim: true,
        },
        language: {
            type: String,
            default: '',
            trim: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'feedback',
    }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
