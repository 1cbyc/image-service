import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// auth validation schemas
export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// transform validation schema
export const transformSchema = Joi.object({
    transformations: Joi.object({
        resize: Joi.object({
            width: Joi.number().integer().min(1).max(4000),
            height: Joi.number().integer().min(1).max(4000),
        }),
        crop: Joi.object({
            width: Joi.number().integer().min(1).required(),
            height: Joi.number().integer().min(1).required(),
            left: Joi.number().integer().min(0).required(),
            top: Joi.number().integer().min(0).required()
        }),
        rotate: Joi.number().integer().min(-360).max(360),
        flip: Joi.boolean(),
        flop: Joi.boolean(),
        format: Joi.string().valid('jpeg', 'png', 'webp'),
        quality: Joi.number().integer().min(1).max(100),
        filters: Joi.object({
            grayscale: Joi.boolean(),
            blur: Joi.number().min(0.3).max(1000)
        })
    }).required(),
});

// pagination validation schema
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
});

// validation middleware function
export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    }
});