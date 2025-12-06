// إدارة المودال
const modal = document.getElementById('authModal');
let currentTab = 'login';

function showRegister() {
    modal.style.display = 'block';
    switchTab('register');
}

function closeModal() {
    modal.style.display = 'none';
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // تحديث أزرار التبويب
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tabName === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
    
    // تبديل النماذج
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById(tabName + 'Form').classList.add('active');
    
    // مسح الرسائل
    document.getElementById('loginMessage').textContent = '';
    document.getElementById('registerMessage').textContent = '';
}

// إغلاق المودال عند النقر خارج المحتوى
window.onclick = function(event) {
    if (event.target === modal) {
        closeModal();
    }
}

// تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // إعادة تحميل الصفحة للانتقال إلى لوحة التحكم
            window.location.href = '/dashboard';
        } else {
            document.getElementById('loginMessage').textContent = data.message || 'حدث خطأ في تسجيل الدخول';
        }
    } catch (error) {
        document.getElementById('loginMessage').textContent = 'حدث خطأ في الاتصال بالخادم';
    }
});

// إنشاء حساب
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // إعادة تحميل الصفحة للانتقال إلى لوحة التحكم
            window.location.href = '/dashboard';
        } else {
            document.getElementById('registerMessage').textContent = data.message || 'حدث خطأ في إنشاء الحساب';
        }
    } catch (error) {
        document.getElementById('registerMessage').textContent = 'حدث خطأ في الاتصال بالخادم';
    }
});

// تفعيل التنقل السلس للروابط الداخلية
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
