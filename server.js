const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// خدمة الملفات الثابتة من public
app.use(express.static(path.join(__dirname, 'public')));

// ========== SESSION ==========
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'ai-builder-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // 24 ساعة
    }
}));

// ========== EJS ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== ROUTES ==========

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.render('index', {
        title: 'بناء مواقع الويب بالذكاء الاصطناعي',
        user: req.session.user
    });
});

// لوحة التحكم
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('dashboard', {
        title: 'لوحة التحكم',
        user: req.session.user
    });
});

// منشئ الذكاء الاصطناعي
app.get('/ai-builder', (req, res) => {
    res.render('ai-builder', {
        title: 'مُنشئ الذكاء الاصطناعي',
        user: req.session.user
    });
});

// معاينة المشروع
app.get('/preview/:id', (req, res) => {
    res.render('preview', {
        title: 'معاينة الموقع',
        projectId: req.params.id,
        user: req.session.user
    });
});

// ========== API ROUTES ==========

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email && password) {
        req.session.user = {
            id: Date.now().toString(),
            email: email,
            name: email.split('@')[0]
        };
        
        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: req.session.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'بيانات الدخول غير صحيحة'
        });
    }
});

// تسجيل الخروج
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'تم تسجيل الخروج' });
});

// إنشاء موقع
app.post('/api/generate', async (req, res) => {
    try {
        const { description, type, style } = req.body;
        
        // قالب HTML
        const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>موقعي - ${type}</title>
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
        p {
            line-height: 1.6;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${description || 'موقعي الجديد'}</h1>
        <p>تم إنشاء هذا الموقع باستخدام الذكاء الاصطناعي</p>
        <p>النوع: ${type}</p>
        <p>النمط: ${style}</p>
        <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>
</body>
</html>`;

        const css = `/* CSS مخصص */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}`;

        const js = `// JavaScript
console.log('الموقع جاهز!');
alert('مرحباً بك في موقعك الجديد');`;

        res.json({
            success: true,
            message: 'تم إنشاء الموقع بنجاح',
            projectId: `project_${Date.now()}`,
            html: html,
            css: css,
            js: js
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ',
            error: error.message
        });
    }
});

// ========== STATIC FILES FOR NETLIFY ==========
// هذا مهم لـ Netlify
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ========== FALLBACK FOR NETLIFY ==========
// هذا يحل مشكلة Page Not Found
app.get('*', (req, res) => {
    // إذا كان الطلب لملف موجود
    if (req.path.includes('.') && !req.path.endsWith('/')) {
        return res.sendFile(path.join(__dirname, 'public', req.path));
    }
    
    // إذا كان الطلب لصفحة
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== START SERVER ==========
const server = app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
    console.log(`📁 الملفات الثابتة من: ${path.join(__dirname, 'public')}`);
});

// Export for Netlify
module.exports = app;
