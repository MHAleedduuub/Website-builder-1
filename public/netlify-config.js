// إعدادات Netlify
window.NETLIFY_CONFIG = {
    baseUrl: window.location.origin,
    apiUrl: window.location.origin + '/api',
    isNetlify: true
};

// تعديل روابط API للعمل مع Netlify Functions
document.addEventListener('DOMContentLoaded', function() {
    // تعديل جميع طلبات API
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.startsWith('/api/')) {
            url = window.NETLIFY_CONFIG.apiUrl + url.substring(4);
        }
        return originalFetch(url, options);
    };
    
    // إضافة معلومات Netlify
    if (window.NETLIFY_CONFIG.isNetlify) {
        const netlifyBadge = document.createElement('div');
        netlifyBadge.innerHTML = `
            <div style="
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: #00AD9F;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 5px;
            ">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="white">
                    <path d="M23.2 13.4c0-2.7-2.2-4.9-4.9-4.9s-4.9 2.2-4.9 4.9c0 .8.2 1.5.5 2.2l-4.5 5.1c-.8-.5-1.7-.8-2.6-.8-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9 4.9-2.2 4.9-4.9c0-.8-.2-1.5-.5-2.2l4.5-5.1c.8.5 1.7.8 2.6.8 2.7 0 4.9-2.2 4.9-4.9z"/>
                </svg>
                مستضاف على Netlify
            </div>
        `;
        document.body.appendChild(netlifyBadge);
    }
});
