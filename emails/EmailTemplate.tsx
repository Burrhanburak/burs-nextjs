import React from 'react';

interface EmailTemplateProps {
  title: string;
  content: React.ReactNode;
}

export function EmailTemplate({ title, content }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        textAlign: 'center',
        borderBottom: '2px solid #dee2e6'
      }}>
        <h1 style={{ 
          color: '#212529', 
          margin: 0,
          fontSize: '24px'
        }}>
          {title}
        </h1>
      </div>
      
      <div style={{ 
        padding: '20px',
        backgroundColor: '#ffffff'
      }}>
        {content}
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        textAlign: 'center',
        borderTop: '2px solid #dee2e6',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
        </p>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Bursiyer Yönetim Sistemi
        </p>
      </div>
    </div>
  );
} 