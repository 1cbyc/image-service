import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import imageRoutes from './routes/imageRoutes';
import { globalErrorHandler } from './middleware/errorHandler';

const app = express();

// the security middleware
app.use(helmet());
app.use(cors());

// to parse json requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route for health check i added
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// rate limiting middleware
// app.use(rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
// }));

app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);

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
