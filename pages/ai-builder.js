import { useState } from 'react';
import Head from 'next/head';

export default function AIBuilder() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [type, setType] = useState('business');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('يرجى إدخال وصف للموقع');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          description,
          style,
          type
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        alert(data.error || 'حدث خطأ في الإنشاء');
      }
    } catch (error) {
      alert('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };
  
  const previewSite = () => {
    if (!result) return;
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(result.html);
    newWindow.document.write(`<style>${result.css}</style>`);
    newWindow.document.write(`<script>${result.js}</script>`);
  };
  
  return (
    <div style={styles.container}>
      <Head>
        <title>منشئ الذكاء الاصطناعي</title>
      </Head>
      
      <header style={styles.header}>
        <a href="/" style={styles.backButton}>← الرجوع</a>
        <h1>🧠 منشئ الذكاء الاصطناعي</h1>
      </header>
      
      <main style={styles.main}>
        <div style={styles.formSection}>
          <h2>صف موقعك الذي تريده</h2>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: أريد موقع أعمال احترافي مع قسم للخدمات، فريق العمل، ونموذج اتصل بنا..."
            style={styles.textarea}
            rows={5}
          />
          
          <div style={styles.options}>
            <div style={styles.optionGroup}>
              <label>النمط التصميمي:</label>
              <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                style={styles.select}
              >
                <option value="modern">حديث وعصري</option>
                <option value="minimal">بسيط وأنيق</option>
                <option value="bold">جريء ومبتكر</option>
                <option value="classic">تقليدي واحترافي</option>
              </select>
            </div>
            
            <div style={styles.optionGroup}>
              <label>نوع الموقع:</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={styles.select}
              >
                <option value="business">موقع أعمال</option>
                <option value="portfolio">موقع شخصي</option>
                <option value="ecommerce">متجر إلكتروني</option>
                <option value="blog">مدونة</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={styles.generateButton}
          >
            {loading ? 'جاري الإنشاء...' : '🚀 أنشئ موقعي'}
          </button>
        </div>
        
        {result && (
          <div style={styles.resultSection}>
            <h3>✅ تم إنشاء موقعك بنجاح!</h3>
            <p>معرف المشروع: {result.projectId}</p>
            
            <div style={styles.resultActions}>
              <button onClick={previewSite} style={styles.actionButton}>
                👁️ معاينة الموقع
              </button>
              <button 
                onClick={() => {
                  const content = `HTML:\n${result.html}\n\nCSS:\n${result.css}\n\nJavaScript:\n${result.js}`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'website-code.txt';
                  a.click();
                }}
                style={styles.actionButton}
              >
                💾 تحميل الكود
              </button>
            </div>
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
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '20px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backButton: {
    color: 'white',
    textDecoration: 'none',
  },
  main: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  formSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  textarea: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '20px',
    fontFamily: 'inherit',
  },
  options: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px',
  },
  optionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  select: {
    padding: '10px',
    border: '2px solid #e5e7eb',
    borderRadius: '5px',
    fontSize: '16px',
  },
  generateButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '50px',
    fontSize: '18px',
    cursor: 'pointer',
    width: '100%',
  },
  resultSection: {
    background: '#f0f9ff',
    padding: '30px',
    borderRadius: '10px',
    border: '2px solid #bae6fd',
  },
  resultActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  actionButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};
