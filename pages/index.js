import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <div style={styles.container}>
      <Head>
        <title>بناء مواقع بالذكاء الاصطناعي</title>
        <meta name="description" content="أنشئ موقعك بالذكاء الاصطناعي" />
      </Head>
      
      <header style={styles.header}>
        <h1 style={styles.logo}>🧠 AI Website Builder</h1>
        <nav>
          {user ? (
            <div style={styles.userMenu}>
              <span>مرحباً، {user.username}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>تسجيل الخروج</button>
              <a href="/dashboard" style={styles.dashboardBtn}>لوحة التحكم</a>
            </div>
          ) : (
            <div>
              <a href="/login" style={styles.loginBtn}>تسجيل الدخول</a>
              <a href="/register" style={styles.registerBtn}>إنشاء حساب</a>
            </div>
          )}
        </nav>
      </header>
      
      <main style={styles.main}>
        <div style={styles.hero}>
          <h2 style={styles.heroTitle}>أنشئ موقعك بالذكاء الاصطناعي في دقائق</h2>
          <p style={styles.heroSubtitle}>أوصف موقعك، ودع الذكاء الاصطناعي يصممه لك</p>
          <a href="/ai-builder" style={styles.ctaButton}>🚀 ابدأ الآن</a>
        </div>
        
        <div style={styles.features}>
          <div style={styles.featureCard}>
            <h3>🤖 ذكاء اصطناعي</h3>
            <p>أوصف موقعك ببضع كلمات</p>
          </div>
          <div style={styles.featureCard}>
            <h3>⚡ سريع</h3>
            <p>إنشاء مواقع في دقائق</p>
          </div>
          <div style={styles.featureCard}>
            <h3>📱 متجاوب</h3>
            <p>يعمل على جميع الأجهزة</p>
          </div>
        </div>
      </main>
      
      <footer style={styles.footer}>
        <p>© 2024 AI Website Builder - كل الحقوق محفوظة</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl',
    margin: 0,
    padding: 0,
  },
  header: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoutBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  dashboardBtn: {
    background: '#10b981',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '5px',
    textDecoration: 'none',
  },
  loginBtn: {
    color: 'white',
    marginRight: '15px',
    textDecoration: 'none',
  },
  registerBtn: {
    background: 'white',
    color: '#4f46e5',
    padding: '8px 16px',
    borderRadius: '5px',
    textDecoration: 'none',
  },
  main: {
    padding: '40px',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '15px',
    marginBottom: '40px',
  },
  heroTitle: {
    fontSize: '36px',
    marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '18px',
    marginBottom: '30px',
    opacity: 0.9,
  },
  ctaButton: {
    background: '#00d4ff',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '18px',
    display: 'inline-block',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    background: '#f5f5f5',
    marginTop: '40px',
  },
};
