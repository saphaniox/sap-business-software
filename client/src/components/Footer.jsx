import React from 'react'
import { Layout, Space } from 'antd'
import { PhoneOutlined, MailOutlined, WhatsAppOutlined } from '@ant-design/icons'

const { Footer: AntFooter } = Layout

function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <AntFooter style={{ textAlign: 'center', background: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '20px 24px', fontSize: '14px', color: '#666' }}>
      {/* Contact Information */}
      <div style={{ marginBottom: '16px' }}>
        <Space size="large" wrap style={{ justifyContent: 'center' }}>
          <a 
            href="tel:+256706564628" 
            style={{ color: '#1890ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PhoneOutlined /> +256 706 564 628
          </a>
          <a 
            href="mailto:saptechnologies256@gmail.com" 
            style={{ color: '#1890ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MailOutlined /> saptechnologies256@gmail.com
          </a>
          <a 
            href="https://wa.me/256706564628" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}
          >
            <WhatsAppOutlined /> Chat on WhatsApp
          </a>
        </Space>
      </div>

      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
        © {currentYear} SAP Business Management Software. All rights reserved.
      </p>
      <p style={{ margin: 0 }}>
        Designed and powered by{' '}
        <a
          href="https://www.sap-technologies.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1890ff', fontWeight: '600', textDecoration: 'none', transition: 'color 0.3s ease' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#40a9ff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#1890ff'}
        >
          SAP Technologies Uganda
        </a>
      </p>
    </AntFooter>
  )
}

export default Footer
