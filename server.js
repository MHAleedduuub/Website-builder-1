const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Session
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'netlify-ai-builder',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== API ENDPOINTS ==========

// الصفحة الرئيسية (API)
app.get('/api', (req, res) => {
    res.json({
        title: 'بناء مواقع الويب بالذكاء الاصطناعي',
        content: `
            <div class="hero">
                <h1><i class="fas fa-robot"></i> بناء مواقع الويب بالذكاء الاصطناعي</h1>
                <p>أنشئ موقعك الإلكتروني في دقائق باستخدام الذكاء الاصطناعي - مجاناً تماماً!</p>
                
                <div class="features">
                    <div class="feature">
                        <i class="fas fa-magic"></i>
                        <h3>إنشاء بالذكاء الاصطناعي</h3>
                        <p>أوصف موقعك وسننشئه لك تلقائياً</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-upload"></i>
                        <h3>رفع الملفات</h3>
                        <p>ارفع صورك وملفاتك بسهولة</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-edit"></i>
                        <h3>محرر كود مدمج</h3>
                        <p>عدل كود موقعك مباشرة من المتصفح</p>
                    </div>
                </div>
                
                <div class="actions">
                    <a href="/dashboard" class="btn btn-primary">
                        <i class="fas fa-rocket"></i> ابدأ الآن
                    </a>
                    <a href="/ai-builder" class="btn btn-secondary">
                        <i class="fas fa-magic"></i> جرب المنشئ الذكي
                    </a>
                </div>
            </div>
        `,
        user: req.session.user
    });
});

// لوحة التحكم (API)
app.get('/api/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'غير مسموح' });
    }
    
    res.json({
        title: 'لوحة التحكم',
        content: `
            <div class="dashboard">
                <h1>مرحباً، ${req.session.user.name || 'مستخدم'}</h1>
                <div class="dashboard-cards">
                    <div class="card">
                        <i class="fas fa-plus"></i>
                        <h3>إنشاء موقع جديد</h3>
                        <a href="/ai-builder">ابدأ الآن</a>
                    </div>
                    <div class="card">
                        <i class="fas fa-folder"></i>
                        <h3>مشاريعك</h3>
                        <p>0 مشروع</p>
                    </div>
                    <div class="card">
                        <i class="fas fa-cog"></i>
                        <h3>الإعدادات</h3>
                        <a href="#">تعديل</a>
                    </div>
                </div>
            </div>
        `,
        user: req.session.user
    });
});

// منشئ الذكاء الاصطناعي (API)
app.get('/api/ai-builder', (req, res) => {
    res.json({
        title: 'مُنشئ الذكاء الاصطناعي',
        content: `
            <div class="ai-builder">
                <h1><i class="fas fa-wand-magic-sparkle"></i> منشئ الذكاء الاصطناعي</h1>
                <p>أوصف موقعك ودع الذكاء الاصطناعي ينشئه لك</p>
                
                <div class="builder-form">
                    <textarea id="description" placeholder="صِف موقعك الذي تريده..."></textarea>
                    <select id="type">
                        <option value="business">موقع أعمال</option>
                        <option value="portfolio">موقع شخصي</option>
                        <option value="ecommerce">متجر إلكتروني</option>
                        <option value="blog">مدونة</option>
                    </select>
                    <button onclick="generateSite()">إنشاء الموقع</button>
                </div>
                
                <div id="result" class="result"></div>
            </div>
        `,
        user: req.session.user
    });
});

// إنشاء موقع (API)
app.post('/api/generate-site', async (req, res) => {
    try {
        const { description, type } = req.body;
        
        const templates = {
            business: generateBusinessSite(description),
            portfolio: generatePortfolioSite(description),
            ecommerce: generateEcommerceSite(description),
            blog: generateBlogSite(description)
        };
        
        const result = templates[type] || templates.business;
        
        res.json({
            success: true,
            message: 'تم إنشاء الموقع بنجاح',
            projectId: `project_${Date.now()}`,
            html: result.html,
            css: result.css,
            js: result.js
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== HELPER FUNCTIONS ==========
function generateBusinessSite(description) {
    return {
        html: `<!DOCTYPE html><html><body><h1>${description}</h1></body></html>`,
        css: 'body { font-family: Arial; }',
        js: 'console.log("Business site");'
    };
}

function generatePortfolioSite(description) {
    return {
        html: `<!DOCTYPE html><html><body><h1>${description}</h1></body></html>`,
        css: 'body { font-family: Tahoma; }',
        js: 'console.log("Portfolio site");'
    };
}

// ========== SPA SUPPORT ==========
// إرجاع index.html لجميع المسارات (لـ SPA)
app.get('*', (req, res) => {
    // إذا كان الطلب لـ API، لا تعيد index.html
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // إرجاع index.html لجميع المسارات الأخرى
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== START SERVER ==========
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;
