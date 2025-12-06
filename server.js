const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-website-builder', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Project Schema
const ProjectSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    html: String,
    css: String,
    js: String,
    createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', ProjectSchema);

// ========== API Routes ==========

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Website with AI
app.post('/api/generate-website', async (req, res) => {
    try {
        const { description, style, type } = req.body;
        
        // In production, use Gemini AI API here
        const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description || 'موقع جديد'}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4f46e5;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${description || 'مرحباً بك في موقعك الجديد'}</h1>
        <p>تم إنشاء هذا الموقع باستخدام الذكاء الاصطناعي</p>
        <p>النوع: ${type}</p>
        <p>النمط: ${style}</p>
    </div>
</body>
</html>`;

        const css = `/* CSS مخصص */
.container {
    animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}`;

        const js = `// JavaScript
console.log('الموقع جاهز!');
document.addEventListener('DOMContentLoaded', function() {
    alert('مرحباً بك في موقعك الذي تم إنشاؤه بالذكاء الاصطناعي');
});`;

        res.json({
            success: true,
            message: 'تم إنشاء الموقع بنجاح',
            projectId: `project_${Date.now()}`,
            html,
            css,
            js
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save Project
app.post('/api/save-project', async (req, res) => {
    try {
        const { userId, name, description, html, css, js } = req.body;
        
        const project = new Project({
            userId,
            name,
            description,
            html,
            css,
            js
        });
        
        await project.save();
        
        res.json({
            success: true,
            message: 'Project saved successfully',
            projectId: project._id
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve Next.js as API
app.use('/api/next', (req, res) => {
    res.json({ 
        message: 'Next.js API endpoint',
        note: 'This is a placeholder for Next.js API routes'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
