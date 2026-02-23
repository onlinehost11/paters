import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import firebaseApp from './config/firebase.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import groupRoutes from './routes/groups.js';
import rhapsodyRoutes from './routes/rhapsody.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/rhapsody', rhapsodyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});