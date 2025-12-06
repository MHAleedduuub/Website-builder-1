const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// إعدادات الجلسة لـ Netlify
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-website-builder',
        ttl: 24 * 60 * 60 // 1 يوم
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 ساعة
    }
};

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// إعدادات القالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// قاعدة البيانات - استخدام MongoDB Atlas على Netlify
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-website-builder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// استيراد الرواتب
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);

// الصفحات الرئيسية
app.get('/', (req, res) => {
    res.render('index', { 
        user: req.session.user,
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`
    });
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { 
        user: req.session.user,
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`
    });
});

app.get('/editor/:projectId', requireAuth, (req, res) => {
    res.render('editor', { 
        user: req.session.user, 
        projectId: req.params.projectId,
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`
    });
});

app.get('/ai-builder', requireAuth, (req, res) => {
    res.render('ai-builder', { 
        user: req.session.user,
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`
    });
});

// API للصحة
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// معالجة 404
app.use((req, res, next) => {
    res.status(404).render('404', { 
        user: req.session.user,
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`
    });
});

// Middleware للتحقق من المصادقة
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// تشغيل الخادم
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Visit: http://localhost:${PORT}`);
    });
}

module.exports = app;
