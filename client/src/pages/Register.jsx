import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message, Alert, Typography, Space, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, ShopOutlined, PhoneOutlined, WhatsAppOutlined, ArrowLeftOutlined, QuestionCircleOutlined, SafetyOutlined, DatabaseOutlined, CloudServerOutlined } from '@ant-design/icons'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import BackToTop from '../components/BackToTop'
import SAPAIChatbot from '../components/SAPAIChatbot'
import logo from '../assets/logo.png'
import '../styles/auth.css'

const { Text, Title, Paragraph } = Typography

function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords don\'t match. Please make sure both passwords are the same.')
      return
    }

    if (!values.company_id) {
      message.error('Company ID is required. Please get this from your company administrator.')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.register({
        username: values.username,
        email: values.email,
        password: values.password,
        company_id: values.company_id
      })
      setAuth({
        ...response.data.user,
        company: response.data.company
      }, response.data.token)
      message.success('🎉 Account created successfully! Welcome aboard!')
      navigate('/dashboard')
    } catch (error) {
      message.error(error.response?.data?.error || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="login-container">
        <Card className="login-box">
          <div style={{ marginBottom: '20px' }}>
            <Button 
              type="link" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
              style={{ padding: 0, fontSize: '14px' }}
            >
              Back to Home
            </Button>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img 
              src={logo} 
              alt="SAP Business Management Software" 
              style={{ 
                height: '70px', 
                width: 'auto',
                maxWidth: '100%',
                marginBottom: '16px',
                objectFit: 'contain'
              }} 
            />
            <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>SAP Business Management Software</h1>
            <h3 style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#666', margin: 0, fontWeight: '400' }}>Create User Account</h3>
          </div>

          <Alert
            message="Note for New Users"
            description={
              <Text>
                This form is for adding users to an existing business. 
                If you need to register a new business, please{' '}
                <Link to="/company-register"><strong>click here</strong></Link>.
              </Text>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Alert
            message="🚀 Want to Explore First?"
            description={
              <div>
                <p style={{ margin: '8px 0 4px 0' }}>Try our test account instead of creating a new user:</p>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text copyable strong style={{ fontSize: '14px' }}>test@sbms.com</Text>
                  <Text copyable strong style={{ fontSize: '14px' }}>sbms@2026</Text>
                </Space>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>Experience all features with sample electronics business data.</p>
              </div>
            }
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
          
          <div className="login-form-container">
            <Form
              name="register"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Business ID"
                name="company_id"
                rules={[{ required: true, message: 'Please enter your Business ID' }]}
                extra="Get this ID from your business administrator. This ensures you join the correct business account."
              >
                <Input 
                  prefix={<ShopOutlined />} 
                  placeholder="Business ID (e.g., 507f1f77bcf86cd799439011)" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please choose a username' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Username" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please create a password (at least 8 characters)' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Password" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[{ required: true, message: 'Please confirm your password' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirm Password" 
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  size="large"
                >
                  Register
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="auth-link-container">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
            <p style={{ marginTop: '8px' }}>
              <QuestionCircleOutlined style={{ marginRight: '4px' }} />
              Need help getting started? <Link to="/help">Visit Help & Docs</Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Comprehensive Footer */}
      <div style={{ backgroundColor: '#001529', color: '#fff', padding: '60px 20px 20px', marginTop: '40px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]} style={{ marginBottom: '40px' }}>
            {/* Company Info */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                SAP Business
              </Title>
              <Paragraph style={{ color: '#8c8c8c', marginBottom: '16px' }}>
                Professional business management software for enterprises worldwide. Secure, reliable, and easy to use.
              </Paragraph>
              <Space direction="vertical" size="small">
                <a href="tel:+256706564628" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  <PhoneOutlined /> +256 706 564 628
                </a>
                <a href="mailto:saptechnologies256@gmail.com" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  <MailOutlined /> saptechnologies256@gmail.com
                </a>
              </Space>
            </Col>

            {/* Quick Links */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Quick Links
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <a onClick={() => navigate('/company-register')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Register Your Company / Business
                </a>
                <a onClick={() => navigate('/login')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Login to Account
                </a>
                <a onClick={() => navigate('/')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Home
                </a>
                <a onClick={() => navigate('/help')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Help & Documentation
                </a>
              </Space>
            </Col>

            {/* Support */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Support
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <a href="https://wa.me/256706564628" target="_blank" rel="noopener noreferrer" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  <WhatsAppOutlined /> WhatsApp Support
                </a>
                <a href="mailto:saptechnologies256@gmail.com" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Email Support
                </a>
                <a href="tel:+256706564628" style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block' }}>
                  Phone Support
                </a>
                <a onClick={() => navigate('/help')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Help Center
                </a>
              </Space>
            </Col>

            {/* Legal */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                Legal
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <a onClick={() => navigate('/privacy-policy')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Privacy Policy
                </a>
                <a onClick={() => navigate('/terms-conditions')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Terms & Conditions
                </a>
                <a onClick={() => navigate('/cookie-policy')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Cookie Policy
                </a>
                <a onClick={() => navigate('/refund-policy')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Refund Policy
                </a>
                <a onClick={() => navigate('/data-protection')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Data Protection
                </a>
                <a onClick={() => navigate('/acceptable-use')} style={{ color: '#8c8c8c', textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
                  Acceptable Use Policy
                </a>
              </Space>
            </Col>
          </Row>

          {/* Bottom Footer */}
          <div style={{ borderTop: '1px solid #303030', paddingTop: '24px', textAlign: 'center' }}>
            <Row gutter={[16, 16]} justify="center" align="middle">
              <Col xs={24} md={12} style={{ textAlign: 'center', order: 2 }}>
                <Paragraph style={{ margin: 0, color: '#8c8c8c', fontSize: '14px' }}>
                  © 2026 SAP Business Management Software. All rights reserved.
                </Paragraph>
              </Col>
              <Col xs={24} md={12} style={{ textAlign: 'center', order: 1 }}>
                <Paragraph style={{ margin: 0, color: '#8c8c8c', fontSize: '14px' }}>
                  Designed and powered by{' '}
                  <a href="https://www.sap-technologies.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', fontWeight: '600', textDecoration: 'none' }}>
                    SAP Technologies Uganda
                  </a>
                </Paragraph>
              </Col>
            </Row>

            {/* Legal Links */}
            <div style={{ marginTop: '16px' }}>
              <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                <a onClick={() => navigate('/privacy-policy')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Privacy
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/terms-conditions')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Terms
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/cookie-policy')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Cookies
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/data-protection')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Data Protection
                </a>
                <span style={{ color: '#303030' }}>|</span>
                <a onClick={() => navigate('/')} style={{ color: '#8c8c8c', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}>
                  Sitemap
                </a>
              </Space>
            </div>

            {/* Compliance & Security Badges */}
            <div style={{ marginTop: '20px' }}>
              <Space size="large" wrap style={{ justifyContent: 'center' }}>
                <span style={{ padding: '4px 12px', backgroundColor: '#1f1f1f', borderRadius: '4px', fontSize: '12px', color: '#52c41a' }}>
                  <SafetyOutlined /> Secure Platform
                </span>
                <span style={{ padding: '4px 12px', backgroundColor: '#1f1f1f', borderRadius: '4px', fontSize: '12px', color: '#1890ff' }}>
                  <DatabaseOutlined /> Data Protected
                </span>
                <span style={{ padding: '4px 12px', backgroundColor: '#1f1f1f', borderRadius: '4px', fontSize: '12px', color: '#faad14' }}>
                  <CloudServerOutlined /> Cloud Backup
                </span>
              </Space>
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
      <SAPAIChatbot position="register" />
    </div>
  )
}

export default Register
