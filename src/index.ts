import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import imageRoutes from './routes/imageRoutes';
import { globalErrorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

app.use(cors({
    origin: config.allowedOrigins.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// to parse json requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route for health check i added
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// Rate limiting configurations
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 uploads per hour
    message: {
        error: 'Upload limit exceeded, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Apply specific rate limiters to routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/images', uploadLimiter, imageRoutes);

// Global error handler (must be last middleware)
app.use(globalErrorHandler);

// want to add the server startup logic
const startServer = async () => {
    try {
        // let me conect to db fezz
        await connectDatabase();

        // then let me start the server
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`Health check: http://localhost:${config.port}/health`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
