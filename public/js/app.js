// JavaScript للـ SPA
class AIWebsiteBuilder {
    constructor() {
        this.currentPath = window.location.pathname;
        this.init();
    }
    
    async init() {
        // إخفاء شاشة التحميل
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        }, 500);
        
        // تحميل الصفحة الحالية
        await this.loadPage(this.currentPath);
        
        // إضافة event listeners
        this.addEventListeners();
    }
    
    async loadPage(path) {
        try {
            let apiPath = '/api';
            
            if (path === '/' || path === '') {
                apiPath = '/api';
            } else if (path === '/dashboard') {
                apiPath = '/api/dashboard';
            } else if (path === '/ai-builder') {
                apiPath = '/api/ai-builder';
            }
            
            const response = await fetch(apiPath);
            
            if (!response.ok) {
                throw new Error('Failed to load page');
            }
            
            const data = await response.json();
            
            // تحديث العنوان
            document.title = data.title;
            
            // تحديث المحتوى
            document.getElementById('app').innerHTML = data.content;
            
            // إضافة CSS
            this.addStyles();
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.showError(error.message);
        }
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #app {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .hero {
                text-align: center;
                padding: 4rem 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 20px;
                margin: 2rem 0;
            }
            
            .hero h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .hero p {
                font-size: 1.2rem;
                opacity: 0.9;
                margin-bottom: 2rem;
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin: 3rem 0;
            }
            
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem;
                border-radius: 15px;
                text-align: center;
            }
            
            .feature i {
                font-size: 2.5rem;
                color: #00d4ff;
                margin-bottom: 1rem;
            }
            
            .actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin: 2rem 0;
            }
            
            .btn {
                padding: 1rem 2rem;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .btn-primary {
                background: #00d4ff;
                color: white;
            }
            
            .btn-secondary {
                background: transparent;
                border: 2px solid white;
                color: white;
            }
            
            .dashboard-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin: 2rem 0;
            }
            
            .card {
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                text-align: center;
            }
            
            .ai-builder {
                padding: 2rem;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            textarea, select {
                width: 100%;
                padding: 1rem;
                margin: 1rem 0;
                border: 2px solid #ddd;
                border-radius: 10px;
                font-family: inherit;
            }
            
            button {
                background: #4f46e5;
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 10px;
                font-size: 1rem;
                cursor: pointer;
            }
            
            .result {
                margin-top: 2rem;
                padding: 2rem;
                background: #f5f5f5;
                border-radius: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    addEventListeners() {
        // التنقل بين الصفحات
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.href) {
                const href = e.target.getAttribute('href');
                
                if (href.startsWith('/') && !href.startsWith('http')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });
        
        // زر الرجوع
        window.addEventListener('popstate', () => {
            this.loadPage(window.location.pathname);
        });
    }
    
    async navigate(path) {
        window.history.pushState({}, '', path);
        await this.loadPage(path);
    }
    
    showError(message) {
        document.getElementById('app').innerHTML = `
            <div class="error">
                <h2>حدث خطأ</h2>
                <p>${message}</p>
                <button onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }
}

// بدء التطبيق
window.addEventListener('DOMContentLoaded', () => {
    window.app = new AIWebsiteBuilder();
});

// دالة لإنشاء المواقع
window.generateSite = async function() {
    const description = document.getElementById('description').value;
    const type = document.getElementById('type').value;
    
    if (!description.trim()) {
        alert('يرجى إدخال وصف للموقع');
        return;
    }
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<p>جاري إنشاء الموقع...</p>';
    
    try {
        const response = await fetch('/api/generate-site', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, type })
        });
        
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `
                <h3>✅ تم إنشاء الموقع بنجاح!</h3>
                <p>معرف المشروع: ${data.projectId}</p>
                <button onclick="previewSite()">معاينة الموقع</button>
                <button onclick="downloadCode()">تحميل الكود</button>
            `;
            
            // حفظ البيانات
            window.currentProject = data;
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">خطأ: ${error.message}</p>`;
    }
};

window.previewSite = function() {
    if (window.currentProject) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>${window.currentProject.css}</style>
            </head>
            <body>${window.currentProject.html}</body>
            <script>${window.currentProject.js}</script>
            </html>
        `);
    }
};

window.downloadCode = function() {
    if (window.currentProject) {
        const content = `
HTML:
${window.currentProject.html}

CSS:
${window.currentProject.css}

JavaScript:
${window.currentProject.js}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website-code.txt';
        a.click();
    }
};
