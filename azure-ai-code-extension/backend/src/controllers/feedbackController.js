const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const { suggestion, rating, sdkType, intent, language } = req.body;

        if (!suggestion || !rating) {
            return res.status(400).json({
                error: 'Missing required fields: "suggestion" and "rating" are required.',
            });
        }

        if (!['positive', 'negative'].includes(rating)) {
            return res.status(400).json({
                error: 'Invalid rating. Use "positive" or "negative".',
            });
        }

        const feedback = new Feedback({
            suggestion,
            rating,
            sdkType,
            intent,
            language,
        });

        await feedback.save();

        console.log(
            `[feedback] ${rating} rating received for sdk=${sdkType || 'unknown'} intent=${intent || 'unknown'}`
        );

        return res.json({
            message: 'Feedback stored successfully',
        });
    } catch (error) {
        console.error(`[feedback] Failed to store feedback: ${error.message}`);
        return res.status(500).json({
            error: 'Failed to store feedback',
        });
    }
};

exports.getFeedbackStats = async () => {
    const [positive, negative] = await Promise.all([
        Feedback.countDocuments({ rating: 'positive' }),
        Feedback.countDocuments({ rating: 'negative' }),
    ]);

    return {
        positive,
        negative,
    };
};
