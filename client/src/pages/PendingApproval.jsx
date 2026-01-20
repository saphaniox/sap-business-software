import React from 'react';
import { Result, Card, Button, Space, Typography, Divider, Tag } from 'antd';
import { ClockCircleOutlined, MailOutlined, PhoneOutlined, WhatsAppOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import BackToTop from '../components/BackToTop';
import logo from '../assets/logo.png';

const { Title, Text, Paragraph } = Typography;

function PendingApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const { company, user } = location.state || {};

  const supportEmail = 'saptechnologies256@gmail.com';
  const supportPhone = '+256 706 564 628';
  const whatsappNumber = '256706564628';
  const whatsappMessage = encodeURIComponent(
    `Hello, I have registered my business and would like to request approval for access to SAP Business Management Software. Please review my registration at your earliest convenience. Thank you.`
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card 
        style={{ 
          maxWidth: '700px', 
          width: '100%',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src={logo} 
            alt="SAP Business Management Software" 
            style={{ height: '70px', marginBottom: '16px' }}
          />
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            SAP Business Management Software
          </Title>
        </div>

        {/* Status Result */}
        <Result
          icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          title="Account Pending Approval"
          subTitle={
            <div>
              <Paragraph style={{ fontSize: '15px', marginBottom: '8px' }}>
                Thank you for registering <strong>{company?.name || 'your business'}</strong>!
              </Paragraph>
              <Paragraph style={{ fontSize: '14px', color: '#666' }}>
                Your account has been created successfully and is currently awaiting administrator approval. 
                You'll receive access once our team reviews and approves your registration.
              </Paragraph>
            </div>
          }
          extra={
            <div style={{ marginTop: '24px' }}>
              {/* Account Details */}
              <Card 
                size="small" 
                style={{ 
                  background: '#f5f5f5', 
                  marginBottom: '24px',
                  textAlign: 'left'
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Business Name:</Text>{' '}
                  <Text>{company?.name || 'N/A'}</Text>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Username:</Text>{' '}
                  <Text>{user?.username || 'N/A'}</Text>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Email:</Text>{' '}
                  <Text>{user?.email || 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Status:</Text>{' '}
                  <Tag color="orange" icon={<ClockCircleOutlined />}>
                    Pending Approval
                  </Tag>
                </div>
              </Card>

              <Divider>Contact Support for Faster Approval</Divider>

              {/* Contact Options */}
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Email */}
                <Button 
                  type="primary"
                  size="large"
                  block
                  icon={<MailOutlined />}
                  href={`mailto:${supportEmail}?subject=Business Approval Request&body=Hello,%0D%0A%0D%0AI have registered my business and would like to request approval for access to SAP Business Management Software.%0D%0A%0D%0ABusiness Name: ${company?.name || 'N/A'}%0D%0AUsername: ${user?.username || 'N/A'}%0D%0AEmail: ${user?.email || 'N/A'}%0D%0A%0D%0APlease review my registration at your earliest convenience.%0D%0A%0D%0AThank you!`}
                  style={{ height: '50px' }}
                >
                  Email Support: {supportEmail}
                </Button>

                {/* WhatsApp */}
                <Button 
                  type="default"
                  size="large"
                  block
                  icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  style={{ 
                    height: '50px',
                    borderColor: '#25D366',
                    color: '#25D366'
                  }}
                >
                  WhatsApp: {supportPhone}
                </Button>

                {/* Phone */}
                <Button 
                  size="large"
                  block
                  icon={<PhoneOutlined />}
                  href={`tel:${supportPhone}`}
                  style={{ height: '50px' }}
                >
                  Call: {supportPhone}
                </Button>
              </Space>

              <Divider />

              {/* Action Buttons */}
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button 
                  icon={<HomeOutlined />}
                  onClick={() => navigate('/')}
                  size="large"
                >
                  Back to Home
                </Button>
              </Space>

              {/* Information */}
              <div style={{ 
                marginTop: '32px', 
                padding: '16px', 
                background: '#e6f7ff', 
                borderRadius: '8px',
                textAlign: 'left'
              }}>
                <Paragraph style={{ margin: 0, fontSize: '13px', color: '#0050b3' }}>
                  <strong>⏱️ What happens next?</strong>
                </Paragraph>
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#0050b3' }}>
                  • Our admin team will review your registration<br />
                  • You'll receive an email notification once approved<br />
                  • Approval typically takes 24-48 hours<br />
                  • Contact us above to expedite the process
                </Paragraph>
              </div>
            </div>
          }
        />
      </Card>
      <BackToTop />
    </div>
  );
}

export default PendingApproval;
