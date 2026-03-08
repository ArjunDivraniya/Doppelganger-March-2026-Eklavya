const express = require('express');
const cors = require('cors');
require("dotenv").config(); 

const connectDB = require('./config/db');
const suggestRoutes = require('./routes/suggest');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3005;

// ── Middleware ──────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`>>> Incoming ${req.method} request to ${req.url}`);
    next();
});
app.use(cors()); // Allow all origins during development
app.use(express.json());

// ── Routes ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/suggest', suggestRoutes);
app.use('/feedback', feedbackRoutes);

// ── Global Error Handler ───────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// ── Start Server ───────────────────────────────────────
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on http://localhost:${PORT}`);
            console.log(`   LLM Provider: Groq API`);
            console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✔ configured' : '✘ missing (mock mode)'}`);
            console.log("Groq Key Loaded:", process.env.GROQ_API_KEY ? "YES" : "NO");
        });
    } catch (error) {
        console.error(`[startup] Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

startServer();
