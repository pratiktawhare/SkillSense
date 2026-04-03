require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resumes');
const jobRoutes = require('./routes/jobs');
const matchingRoutes = require('./routes/matching');
const applicationRoutes = require('./routes/applications');
const credibilityRoutes = require('./routes/credibility');
const rankingsRoutes = require('./routes/rankings');
const metricsRoutes = require('./routes/metrics');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const exportRoutes = require('./routes/exports');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/match', matchingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/credibility', credibilityRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.get('/', (req, res) => {
    res.send('Welcome to the Job Application Management System API');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
