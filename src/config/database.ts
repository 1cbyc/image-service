import mongoose from 'mongoose';

export const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // so it would exit the app if db connection fails
    }
};

// putting this event listener outside the try-catch function so it is always registered:
mongoose.connection.on('disconnected', () => {
    console.log('Database disconnected');
});

mongoose.connection.on('error', (error) => {
    console.error('Database error:', error);
});