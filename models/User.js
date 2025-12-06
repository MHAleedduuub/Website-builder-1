const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    projects: [{
        name: String,
        description: String,
        createdAt: Date,
        updatedAt: Date
    }]
});

module.exports = mongoose.model('User', userSchema);
