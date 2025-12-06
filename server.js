const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-website-builder', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB Error:', err));

// ========== DATABASE MODELS ==========
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    description: String,
    html: String,
    css: String,
    js: String,
    files: [{
        filename: String,
        originalname: String,
        path: String,
        size: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Project = mongoose.model('Project', ProjectSchema);

// ========== FILE UPLOAD CONFIG ==========
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ========== GEMINI AI SETUP ==========
let genAI;
try {
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✅ Gemini AI Initialized');
    } else {
        console.log('⚠️  Gemini API Key not found, using mock AI');
    }
} catch (error) {
    console.log('⚠️  Gemini AI setup failed:', error.message);
}

// ========== AUTHENTICATION ROUTES ==========

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'البريد الإلكتروني مستخدم بالفعل' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
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
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: error.message 
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
            });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
            });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: error.message 
        });
    }
});

// ========== AI WEBSITE GENERATION ==========

app.post('/api/ai/generate', async (req, res) => {
    try {
        const { description, style, type } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        
        let user = null;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                user = await User.findById(decoded.userId);
            } catch (error) {
                console.log('Token verification failed:', error.message);
            }
        }
        
        // Generate website with AI
        let html, css, js;
        
        if (genAI && process.env.GEMINI_API_KEY) {
            // Use real Gemini AI
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            
            const prompt = `أنت مطور ويب محترف. قم بإنشاء كود HTML و CSS و JavaScript كامل لموقع ويب باللغة العربية مع التالي:
            
            وصف الموقع: ${description}
            النمط التصميمي: ${style}
            نوع الموقع: ${type}
            
            المتطلبات:
            1. استخدم HTML5 و CSS3 و JavaScript حديث
            2. تصميم مستجيب (Responsive)
            3. أضف تأثيرات تفاعلية
            4. الكود نظيف وسهل القراءة
            5. استخدم الخطوط العربية المناسبة
            6. أضف تعليقات باللغة العربية
            
            أرجو تقديم الكود الكامل فقط.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const generatedCode = response.text();
            
            // Extract code parts
            html = extractHTML(generatedCode);
            css = extractCSS(generatedCode);
            js = extractJS(generatedCode);
            
        } else {
            // Use template if AI not available
            const template = getWebsiteTemplate(description, style, type);
            html = template.html;
            css = template.css;
            js = template.js;
        }
        
        // Create project in database
        const project = new Project({
            userId: user ? user._id : null,
            name: `موقع ${type} - ${new Date().toLocaleDateString('ar-SA')}`,
            description,
            html,
            css,
            js,
            files: []
        });
        
        await project.save();
        
        res.json({
            success: true,
            message: 'تم إنشاء الموقع بنجاح',
            project: {
                id: project._id,
                name: project.name,
                html,
                css,
                js
            }
        });
        
    } catch (error) {
        console.error('AI Generation Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في إنشاء الموقع',
            error: error.message 
        });
    }
});

// ========== FILE UPLOAD ==========

app.post('/api/upload', upload.array('files', 10), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { projectId } = req.body;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'غير مصرح به' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'غير مصرح به' 
            });
        }
        
        const files = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: file.path,
            size: file.size,
            url: `/uploads/${file.filename}`
        }));
        
        // Update project with files
        if (projectId) {
            await Project.findByIdAndUpdate(projectId, {
                $push: { files: { $each: files } }
            });
        }
        
        res.json({
            success: true,
            message: 'تم رفع الملفات بنجاح',
            files
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في رفع الملفات',
            error: error.message 
        });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== PROJECT MANAGEMENT ==========

// Get user projects
app.get('/api/projects', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'غير مصرح به' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const projects = await Project.find({ userId: decoded.userId })
            .sort({ createdAt: -1 })
            .select('name description createdAt');
        
        res.json({
            success: true,
            projects
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في جلب المشاريع',
            error: error.message 
        });
    }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const projectId = req.params.id;
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'غير مصرح به' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const project = await Project.findOne({ 
            _id: projectId, 
            userId: decoded.userId 
        });
        
        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'المشروع غير موجود' 
            });
        }
        
        res.json({
            success: true,
            project
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في جلب المشروع',
            error: error.message 
        });
    }
});

// ========== HELPER FUNCTIONS ==========

function extractHTML(code) {
    const match = code.match(/<html[\s\S]*<\/html>/i);
    return match ? match[0] : getDefaultHTML();
}

function extractCSS(code) {
    const match = code.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/i);
    return match ? match[1] : getDefaultCSS();
}

function extractJS(code) {
    const match = code.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
    return match ? match[1] : getDefaultJS();
}

function getWebsiteTemplate(description, style, type) {
    return {
        html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description || 'موقعي الجديد'}</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="logo">موقع ${type}</div>
            <ul class="nav-links">
                <li><a href="#home">الرئيسية</a></li>
                <li><a href="#about">من نحن</a></li>
                <li><a href="#services">الخدمات</a></li>
                <li><a href="#contact">اتصل بنا</a></li>
            </ul>
        </nav>
    </header>
    
    <main class="main">
        <section class="hero" id="home">
            <h1>${description || 'مرحباً بكم في موقعنا'}</h1>
            <p>تم إنشاء هذا الموقع باستخدام الذكاء الاصطناعي</p>
            <a href="#contact" class="cta-button">ابدأ الآن</a>
        </section>
        
        <section class="features">
            <h2>مميزاتنا</h2>
            <div class="feature-grid">
                <div class="feature">
                    <h3>تصميم ${style}</h3>
                    <p>نقدم أفضل الحلول التقنية</p>
                </div>
                <div class="feature">
                    <h3>دعم فني</h3>
                    <p>فريق دعم متاح 24/7</p>
                </div>
            </div>
        </section>
    </main>
    
    <footer class="footer">
        <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`,
        
        css: `/* ${style} style for ${type} website */
:root {
    --primary: #4f46e5;
    --secondary: #7c3aed;
    --accent: #06b6d4;
    --text: #1f2937;
    --light: #f9fafb;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    color: var(--text);
    background: var(--light);
    line-height: 1.6;
}

.header {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 1rem 2rem;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: var(--text);
    font-weight: 600;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: var(--primary);
}

.hero {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    text-align: center;
    padding: 4rem 2rem;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.cta-button {
    background: var(--accent);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 2rem;
    display: inline-block;
    transition: transform 0.3s;
}

.cta-button:hover {
    transform: translateY(-3px);
}

.features {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.feature {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.footer {
    background: var(--text);
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}

@media (max-width: 768px) {
    .nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .hero h1 {
        font-size: 2rem;
    }
}`,
        
        js: `// JavaScript for ${type} website
console.log('Website loaded successfully!');

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Add interactive effects
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('mouseenter', () => {
        ctaButton.style.boxShadow = '0 10px 20px rgba(6, 182, 212, 0.3)';
    });
    
    ctaButton.addEventListener('mouseleave', () => {
        ctaButton.style.boxShadow = 'none';
    });
}

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.padding = '0.5rem 2rem';
    } else {
        header.style.padding = '1rem 2rem';
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('${type} website ready!');
});`
    };
}

function getDefaultHTML() {
    return `<!DOCTYPE html>
<html>
<head><title>موقع جديد</title></head>
<body><h1>مرحباً بك</h1></body>
</html>`;
}

function getDefaultCSS() {
    return `body { font-family: Arial; margin: 0; padding: 20px; }`;
}

function getDefaultJS() {
    return `console.log('Default script loaded');`;
}

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        ai: genAI ? 'available' : 'unavailable'
    });
});

// ========== SERVE FRONTEND (for Next.js) ==========
app.get('*', (req, res) => {
    res.json({
        message: 'AI Website Builder API Server',
        endpoints: {
            auth: ['/api/auth/register', '/api/auth/login'],
            ai: ['/api/ai/generate'],
            projects: ['/api/projects', '/api/projects/:id'],
            upload: ['/api/upload'],
            health: ['/api/health']
        },
        note: 'This is the backend API. Frontend should be served separately.'
    });
});

// ========== START SERVER ==========
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 API endpoints:`);
        console.log(`   POST /api/auth/register`);
        console.log(`   POST /api/auth/login`);
        console.log(`   POST /api/ai/generate`);
        console.log(`   GET  /api/health`);
    });
}

module.exports = app;
