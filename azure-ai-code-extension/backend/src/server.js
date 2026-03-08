const express = require('express');
const cors = require('cors');
require("dotenv").config(); 

const suggestRoutes = require('./routes/suggest');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ── Routes ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/suggest', suggestRoutes);

// ── Global Error Handler ───────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// ── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`   LLM Provider: Groq API`);
    console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✔ configured' : '✘ missing (mock mode)'}`);
    console.log("Groq Key Loaded:", process.env.GROQ_API_KEY ? "YES" : "NO");
});
