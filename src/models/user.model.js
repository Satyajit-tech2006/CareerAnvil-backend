import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate usernames
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate emails
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    subscription: {
        type: String,
        enum: ['freemium', 'premium'],
        default: 'freemium',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    atsScore:{
        type: Number,
        default: 0,
    },
    refreshToken: {
        type: String,
    },
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordOtp: {
        type: String,
        required: false
    },
    resetPasswordExpires: { 
        type: Date 
    },
}, { timestamps: true });

// 1. Pre-save hook to hash password
userSchema.pre("save", async function() { // <--- REMOVE 'next' from here
    if (!this.isModified("password")) return;

    // No need for try-catch here; if it fails, Mongoose handles the error automatically
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 2. Method to compare password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// 3. Generate Access Token (Short-lived)
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { 
            _id: this._id, 
            username: this.username, 
            email: this.email, 
            name: this.name // Updated from fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// 4. Generate Refresh Token (Long-lived)
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = model('User', userSchema);