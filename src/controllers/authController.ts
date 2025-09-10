import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        // i added this to check if the user exists with email or username
        const existingUser = await User.findOne({ $or: [{ email }, {username}] });

        // need to check if the user exists with email or username
        if (existingUser) {
            // if the user exists, return a 400 error
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
    
        // generate a token for the new user
        const token = generateToken({ userId: newUser._id });

        // return user data and token
        const userResponse = {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            token
        });
    } catch (error) {
        // i added this to handle errors
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // find the user with email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // compare the password with the hashed password in the database
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // generate a token for the user
        const token = generateToken({ userId: user._id });

        // return user data and token
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};