import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export const generateToken = (payload: any) => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, config.jwtSecret);
};