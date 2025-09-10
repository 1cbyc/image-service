import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const globalErrorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // to handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(error.errors).map((err: any) => err.message).join(', ');
    }

    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    if (error.code === 11000) {
        statusCode = 400;
        const field = Object.keys(error.keyValue)[0];
        message = `${field} already exists`;
    }

    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // to log error in dev
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};