const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cheerio = require('cheerio');

// إعدادات Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// توليد موقع باستخدام Gemini AI
router.post('/generate-website', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const { description, style, features, pages } = req.body;
    
    try {
        // التحقق من وجود مفتاح API
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                message: 'مفتاح Gemini API غير موجود',
                code: getFallbackTemplate(description)
            });
        }
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `أنت مطور ويب محترف. قم بإنشاء كود HTML و CSS و JavaScript كامل لموقع ويب باللغة العربية مع التالي:
        
        وصف الموقع: ${description}
        النمط التصميمي: ${style}
        الميزات المطلوبة: ${features.join(', ')}
        الصفحات المطلوبة: ${pages.join(', ')}
        
        المتطلبات:
        1. استخدم HTML5 و CSS3 و JavaScript حديث
        2. تصميم مستجيب (Responsive) يعمل على جميع الأجهزة
        3. استخدم CSS Grid و Flexbox للتصميم
        4. أضف تأثيرات تفاعلية باستخدام JavaScript
        5. تأكد من أن الكود نظيف وسهل القراءة
        6. استخدم الخط العربي المناسب
        7. أضف تعليقات في الكود باللغة العربية
        8. تأكد من أن التصميم عصري وجذاب
        
        أرجو تقديم الكود الكامل فقط بدون أي شرح إضافي.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let generatedCode = response.text();
        
        // تنظيف الكود المولد
        generatedCode = cleanGeneratedCode(generatedCode);
        
        // إنشاء مشروع جديد مع الكود المولد
        const projectId = 'ai_project_' + Date.now();
        
        // حفظ الكود في ملف مؤقت
        const fs = require('fs-extra');
        const path = require('path');
        const projectPath = path.join(__dirname, '../uploads', projectId);
        
        await fs.ensureDir(projectPath);
        
        // استخراج أجزاء الكود
        const { html, css, js } = extractCodeParts(generatedCode);
        
        // حفظ الملفات
        await fs.writeFile(path.join(projectPath, 'index.html'), html);
        await fs.writeFile(path.join(projectPath, 'style.css'), css);
        await fs.writeFile(path.join(projectId, 'script.js'), js);
        
        res.json({
            message: 'تم إنشاء الموقع بنجاح باستخدام Gemini AI',
            projectId,
            code: generatedCode,
            files: {
                html: 'index.html',
                css: 'style.css',
                js: 'script.js'
            }
        });
        
    } catch (error) {
        console.error('Gemini AI generation error:', error);
        
        // استخدام قالب احتياطي في حالة الخطأ
        const fallbackCode = getFallbackTemplate(description);
        
        res.json({
            message: 'تم إنشاء الموقع بنجاح (باستخدام القالب الاحتياطي)',
            projectId: 'fallback_project_' + Date.now(),
            code: fallbackCode,
            note: 'تم استخدام القالب الاحتياطي بسبب خطأ في Gemini API'
        });
    }
});

// دالة لتنظيف الكود المولد
function cleanGeneratedCode(code) {
    // إزالة علامات الـ markdown إذا وجدت
    code = code.replace(/```html|```css|```javascript|```/g, '');
    
    // إزالة أي نص خارج نطاق الكود
    const codeMatch = code.match(/<html[\s\S]*<\/html>/i);
    if (codeMatch) {
        code = codeMatch[0];
    }
    
    return code.trim();
}

// دالة لاستخراج أجزاء الكود
function extractCodeParts(fullCode) {
    const $ = cheerio.load(fullCode);
    
    // استخراج CSS من style tags
    let css = '';
    $('style').each((i, elem) => {
        css += $(elem).html() + '\n';
    });
    
    // استخراج JavaScript من script tags
    let js = '';
    $('script').each((i, elem) => {
        if (!$(elem).attr('src')) {
            js += $(elem).html() + '\n';
        }
    });
    
    // HTML بدون CSS و JS الداخليين
    $('style').remove();
    $('script').remove();
    const html = $.html();
    
    return {
        html: html || fullCode,
        css: css || '/* CSS سيتم إضافته هنا */',
        js: js || '// JavaScript سيتم إضافته هنا'
    };
}

// دالة للقالب الاحتياطي
function getFallbackTemplate(description) {
    const template = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>موقعي الإلكتروني</title>
    <style>
        /* إعدادات عامة */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            direction: rtl;
        }
        
        /* الهيدر */
        header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 2rem 1rem;
            text-align: center;
        }
        
        .logo {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        
        nav {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1rem;
        }
        
        nav a {
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.3s;
        }
        
        nav a:hover {
            opacity: 0.8;
        }
        
        /* المحتوى الرئيسي */
        main {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        
        .hero {
            text-align: center;
            padding: 3rem 1rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .hero h1 {
            color: #4f46e5;
            margin-bottom: 1rem;
        }
        
        /* الخدمات */
        .services {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 3rem 0;
        }
        
        .service-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .service-icon {
            font-size: 3rem;
            color: #4f46e5;
            margin-bottom: 1rem;
        }
        
        /* الفوتر */
        footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
        }
        
        /* تصميم متجاوب */
        @media (max-width: 768px) {
            nav {
                flex-direction: column;
                gap: 1rem;
            }
            
            .services {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <header>
        <div class="logo">
            <i class="fas fa-rocket"></i>
            موقعي الإلكتروني
        </div>
        <nav>
            <a href="#home">الرئيسية</a>
            <a href="#services">الخدمات</a>
            <a href="#about">عن الموقع</a>
            <a href="#contact">اتصل بنا</a>
        </nav>
    </header>
    
    <main>
        <section class="hero" id="home">
            <h1>مرحباً بك في موقعي الإلكتروني</h1>
            <p>${description || 'هذا موقع إلكتروني تم إنشاؤه باستخدام الذكاء الاصطناعي'}</p>
            <button onclick="showWelcome()" style="
                background: #4f46e5;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 50px;
                font-size: 1rem;
                cursor: pointer;
                margin-top: 1rem;
                font-family: 'Cairo', sans-serif;
            ">
                ابدأ الرحلة
            </button>
        </section>
        
        <section class="services" id="services">
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <h3>سرعة فائقة</h3>
                <p>موقع سريع التحميل يحسن تجربة المستخدم</p>
            </div>
            
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-mobile-alt"></i>
                </div>
                <h3>تصميم متجاوب</h3>
                <p>يعمل على جميع الأجهزة والشاشات</p>
            </div>
            
            <div class="service-card">
                <div class="service-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>آمن وحماية</h3>
                <p>أفضل معايير الأمان والحماية</p>
            </div>
        </section>
    </main>
    
    <footer id="contact">
        <p>© 2024 جميع الحقوق محفوظة</p>
        <p>تم إنشاء هذا الموقع باستخدام الذكاء الاصطناعي</p>
    </footer>
    
    <script>
        function showWelcome() {
            alert('مرحباً بك! تم إنشاء هذا الموقع باستخدام Gemini AI');
        }
        
        // تأثيرات تفاعلية
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // إضافة تأثير عند التمرير
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.padding = '1rem';
            } else {
                header.style.padding = '2rem 1rem';
            }
        });
    </script>
</body>
</html>`;
    
    return template;
}

// اقتراح تحسينات باستخدام Gemini AI
router.post('/suggest-improvements', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const { currentCode, improvements } = req.body;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `أنا مطور ويب ولدي الكود التالي:
        
        ${currentCode.substring(0, 2000)}...
        
        أود تحسينات في: ${improvements}
        
        يرجى اقتراح تحسينات محددة مع أمثلة كود إن أمكن. ركز على:
        1. تحسين أداء الموقع
        2. تحسين تجربة المستخدم
        3. إصلاح أي مشاكل في الكود
        4. تحسين استجابة التصميم
        
        أرجو الرد باللغة العربية.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const suggestions = response.text();
        
        res.json({ 
            suggestions,
            note: 'تم توليد الاقتراحات باستخدام Gemini AI' 
        });
        
    } catch (error) {
        console.error('Gemini AI suggestions error:', error);
        
        // اقتراحات احتياطية
        const fallbackSuggestions = [
            'تحسين استجابة التصميم للجوال عن طريق إضافة media queries',
            'إضافة تأثيرات تفاعلية باستخدام JavaScript لتحسين تجربة المستخدم',
            'تحسين سرعة تحميل الصفحة عن طريق تحسين الصور واستخدام lazy loading',
            'تحسين ألوان الموقع لزيادة الوضوح وسهولة القراءة',
            'إضافة نظام التنقل السلس بين أقسام الموقع'
        ];
        
        res.json({ 
            suggestions: fallbackSuggestions.join('\n'),
            note: 'اقتراحات احتياطية بسبب خطأ في Gemini API'
        });
    }
});

// توليد محتوى نصي باستخدام Gemini AI
router.post('/generate-content', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }
    
    const { topic, type, length } = req.body;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `اكتب ${type} باللغة العربية حول موضوع: "${topic}"
        الطول المطلوب: ${length}
        
        المتطلبات:
        1. اللغة العربية الفصحى
        2. أسلوب احترافي وجذاب
        3. مناسب للعرض على موقع ويب
        4. تقسيم إلى فقرات منطقية
        5. استخدام عناوين فرعية عند الحاجة`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        
        res.json({ 
            content,
            note: 'تم توليد المحتوى باستخدام Gemini AI' 
        });
        
    } catch (error) {
        console.error('Gemini AI content generation error:', error);
        
        res.json({ 
            content: `# ${topic}\n\nهذا محتوى نموذجي حول "${topic}". يمكنك تعديله ليتناسب مع احتياجات موقعك.`,
            note: 'محتوى احتياطي بسبب خطأ في Gemini API'
        });
    }
});

module.exports = router;
