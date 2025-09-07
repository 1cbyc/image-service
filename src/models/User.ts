import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface UserDocument extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>; // i added this to compare the password with the hashed password in the database
}

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // i added this to ensure the password is at least 6 characters long
    },
}, { timestamps: true }); // i added this to automatically add createdAt and updatedAt fields to the schema so timestamp is added for the user

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    // i added this to ensure the password is hashed before it is saved to the database
    this.password = await bcrypt.hash(this.password, 12); // i added this to ensure the password is hashed with 12 rounds of salt
    next();
}); // this is the pasword hashing middleware i added now too

userSchema.methods.comparePassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
}; // this is the method to compare the password with the hashed password in the database

const User = mongoose.model<UserDocument>('User', userSchema);

export default mongoose.model<UserDocument>('User', userSchema); // this is the export of the user model using mongoose.model