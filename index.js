const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// ========== SESSION (مبسط) ==========
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'ai-builder-netlify-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 // 24 ساعة
    }
}));

// ========== TEMPLATE ENGINE ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== ROUTES ==========

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.render('index', {
        title: 'بناء مواقع الويب بالذكاء الاصطناعي',
        user: req.session.user,
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`
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

// ========== API ROUTES ==========

// API للذكاء الاصطناعي
app.post('/api/generate', async (req, res) => {
    try {
        const { description, style, type } = req.body;
        
        // استجابة تجريبية (يمكن إضافة Gemini AI لاحقاً)
        const response = {
            success: true,
            message: 'تم إنشاء الموقع بنجاح',
            projectId: `project_${Date.now()}`,
            html: generateHTML(description, type),
            css: generateCSS(style),
            js: generateJS(),
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الإنشاء',
            error: error.message
        });
    }
});

// تسجيل الدخول
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // مصادقة تجريبية
    if (email && password) {
        req.session.user = {
            id: Date.now().toString(),
            email: email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
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

// تحميل الملفات
app.post('/api/upload', (req, res) => {
    // رفع ملفات تجريبي
    res.json({
        success: true,
        message: 'تم رفع الملف بنجاح',
        filename: `file_${Date.now()}.txt`,
        url: '#'
    });
});

// صفحة 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'الصفحة غير موجودة',
        user: req.session.user
    });
});

// ========== HELPER FUNCTIONS ==========
function generateHTML(description, type) {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>موقعي الإلكتروني</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h1>${description || 'موقعي الجديد'}</h1>
        <p>تم إنشاء هذا الموقع باستخدام الذكاء الاصطناعي</p>
        <p>نوع الموقع: ${type || 'عام'}</p>
        <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>
</body>
</html>`;
}

function generateCSS(style) {
    return `/* CSS مولد تلقائياً */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    background: #f5f5f5;
    color: #333;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
}

h1 {
    color: #4f46e5;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #666;
}`;
}

function generateJS() {
    return `// JavaScript مولد تلقائياً
console.log('الموقع يعمل بنجاح!');

// إضافة تفاعلية بسيطة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
    
    // تأثير بسيط عند التمرير
    window.addEventListener('scroll', function() {
        const header = document.querySelector('h1');
        if (window.scrollY > 100) {
            header.style.opacity = '0.9';
        } else {
            header.style.opacity = '1';
        }
    });
});`;
}

// ========== START SERVER ==========
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🌐 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
    });
}

module.exports = app;
