import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // هنا يمكن جلب مشاريع المستخدم من API
    } else {
      window.location.href = '/login';
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  return (
    <div style={styles.container}>
      <Head>
        <title>لوحة التحكم</title>
      </Head>
      
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1>📊 لوحة التحكم</h1>
          <p>مرحباً، {user?.username}</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            تسجيل الخروج
          </button>
        </div>
      </header>
      
      <main style={styles.main}>
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <h3>المشاريع</h3>
            <p style={styles.statNumber}>{projects.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3>تم الإنشاء</h3>
            <p style={styles.statNumber}>{projects.filter(p => p.html).length}</p>
          </div>
        </div>
        
        <div style={styles.actions}>
          <a href="/ai-builder" style={styles.primaryAction}>
            🚀 إنشاء موقع جديد
          </a>
        </div>
        
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>لا توجد مشاريع بعد</h3>
            <p>ابدأ بإنشاء أول موقع لك</p>
            <a href="/ai-builder" style={styles.emptyStateButton}>
              ابدأ الإنشاء
            </a>
          </div>
        ) : (
          <div style={styles.projectsList}>
            <h3>مشاريعك</h3>
            {/* هنا قائمة المشاريع */}
          </div>
        )}
      </main>
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
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  headerRight: {
    display: 'flex',
    gap: '10px',
  },
  logoutButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  main: {
    padding: '40px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#4f46e5',
    margin: '10px 0 0 0',
  },
  actions: {
    marginBottom: '40px',
  },
  primaryAction: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '15px 30px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '18px',
    display: 'inline-block',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#f9fafb',
    borderRadius: '15px',
  },
  emptyStateButton: {
    background: '#4f46e5',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '5px',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '20px',
  },
};
