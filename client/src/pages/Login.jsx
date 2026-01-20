import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography, Space, Modal, Alert } from 'antd'
import { UserOutlined, LockOutlined, ShopOutlined, PhoneOutlined, MailOutlined, WhatsAppOutlined, ArrowLeftOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { authAPI, superAdminAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import BackToTop from '../components/BackToTop'
import SAPAIChatbot from '../components/SAPAIChatbot'
import logo from '../assets/logo.png'
import '../styles/auth.css'

const { Title, Text } = Typography

function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // Check if this is a super admin login (specific super admin email)
      const isSuperAdminEmail = values.username === 'superadmin@saptech.com' || 
                                 values.username.toLowerCase().includes('superadmin')
      
      if (isSuperAdminEmail) {
        // Super admin login
        const response = await superAdminAPI.login({
          email: values.username,
          password: values.password
        })
        
        if (response.data.success) {
          const superAdminUser = {
            id: response.data.admin.id,
            username: response.data.admin.name || 'Super Admin',
            name: response.data.admin.name,
            email: response.data.admin.email,
            role: 'superadmin',
            isSuperAdmin: true,
            permissions: response.data.admin.permissions,
            company: { name: 'System Administration', id: 'superadmin' }
          }
          
          // Log successful super admin login
          console.log('Super Admin logged in successfully:', {
            name: superAdminUser.name,
            email: superAdminUser.email,
            role: superAdminUser.role,
            isSuperAdmin: superAdminUser.isSuperAdmin
          });
          
          // Set authentication
          setAuth(superAdminUser, response.data.token)
          
          // Verify storage
          const storedUser = JSON.parse(localStorage.getItem('user'));
          const storedToken = localStorage.getItem('token');
          console.log('Verified localStorage:', {
            userStored: !!storedUser,
            tokenStored: !!storedToken,
            isSuperAdmin: storedUser?.isSuperAdmin
          });
          
          message.success(`Welcome back, ${response.data.admin.name}!`)
          navigate('/dashboard', { replace: true })
        }
      } else {
        // Regular user/admin login (supports both username and email)
        const response = await authAPI.login(values)
        
        setAuth({
          ...response.data.user,
          company: response.data.company
        }, response.data.token)
        message.success(`Welcome back to ${response.data.company.name}!`)
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Check if account is pending approval
      if (error.response?.data?.error === 'pending_approval') {
        message.warning('Your account is pending admin approval')
        navigate('/pending-approval', { 
          state: { 
            company: error.response.data.company,
            user: error.response.data.user
          } 
        })
        return
      }

      // Check if account was rejected
      if (error.response?.data?.error === 'account_rejected') {
        message.error(error.response.data.message || 'Your registration was not approved')
        Modal.error({
          title: 'Registration Rejected',
          content: (
            <div>
              <p>{error.response.data.message}</p>
              {error.response.data.reason && (
                <p><strong>Reason:</strong> {error.response.data.reason}</p>
              )}
              <p>Please contact support for more information.</p>
            </div>
          )
        })
        return
      }

      // Check if account is blocked
      if (error.response?.data?.error === 'account_blocked') {
        Modal.error({
          title: 'Account Blocked',
          content: (
            <div>
              <p>{error.response.data.message}</p>
              <p><strong>Reason:</strong> {error.response.data.reason}</p>
              <p>{error.response.data.contact}</p>
            </div>
          )
        })
        return
      }

      // Check if account is suspended
      if (error.response?.data?.error === 'account_suspended') {
        const suspendedUntil = error.response.data.suspended_until 
          ? new Date(error.response.data.suspended_until).toLocaleDateString()
          : 'indefinitely'
        
        Modal.warning({
          title: 'Account Suspended',
          content: (
            <div>
              <p>{error.response.data.message}</p>
              <p><strong>Reason:</strong> {error.response.data.reason}</p>
              <p><strong>Suspended until:</strong> {suspendedUntil}</p>
              <p>{error.response.data.contact}</p>
            </div>
          )
        })
        return
      }

      // Check if account is banned
      if (error.response?.data?.error === 'account_banned') {
        Modal.error({
          title: 'Account Permanently Banned',
          content: (
            <div>
              <p>{error.response.data.message}</p>
              <p><strong>Reason:</strong> {error.response.data.reason}</p>
              <p>{error.response.data.contact}</p>
            </div>
          )
        })
        return
      }

      // Check if account is inactive
      if (error.response?.data?.error === 'account_inactive') {
        Modal.warning({
          title: 'Account Inactive',
          content: (
            <div>
              <p>{error.response.data.message}</p>
              <p>Your business account is not active yet. This may be due to:</p>
              <ul style={{ textAlign: 'left', marginTop: '10px' }}>
                <li>Account pending approval from system administrator</li>
                <li>Account temporarily deactivated</li>
                <li>Payment or subscription issues</li>
              </ul>
              <p style={{ marginTop: '15px' }}>
                <strong>Need help?</strong><br />
                Contact: saptechnologies256@gmail.com<br />
                WhatsApp: +256 706 564 628
              </p>
            </div>
          )
        })
        return
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          'Unable to log in. Please check your credentials and try again.'
      
      message.error(errorMessage)
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
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img 
              src={logo} 
              alt="SAP Business Management Software" 
              style={{ 
                height: '80px', 
                width: 'auto',
                maxWidth: '100%',
                marginBottom: '16px',
                objectFit: 'contain'
              }} 
            />
            <Title level={2} style={{ margin: '0 0 8px 0', fontSize: 'clamp(20px, 5vw, 28px)' }}>
              SAP Business Management Software
            </Title>
            <Text type="secondary" style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
              Professional Business Management Software
            </Text>
            
            {/* Test Credentials Alert */}
            <Alert
              message="🚀 Try Test Account"
              description={
                <div>
                  <p style={{ margin: '8px 0' }}>Experience all features with our sample electronics business:</p>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text copyable strong style={{ fontSize: '14px' }}>test@sbms.com</Text>
                    <Text copyable strong style={{ fontSize: '14px' }}>sbms@2026</Text>
                  </Space>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: '16px', textAlign: 'left' }}
            />
          </div>
          
          <div className="login-form-container">
            <Form
              name="login"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Business Name (Optional)"
                name="companyName"
                tooltip="If you have multiple accounts, specify your business name for faster login"
              >
                <Input 
                  prefix={<ShopOutlined />} 
                  placeholder="Your business name" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Username or Email"
                name="username"
                rules={[{ required: true, message: 'Please enter your username or email' }]}
                tooltip="You can use either your username or email address to log in"
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Enter username or email" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Password" 
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
                  Login
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="auth-link-container">
            <p>
              Don't have an account?{' '}
              <Link to="/company-register">Register your company or business</Link>
            </p>
            <p style={{ marginTop: '8px' }}>
              <QuestionCircleOutlined style={{ marginRight: '4px' }} />
              Need help? <Link to="/help">Visit Help & Docs</Link>
            </p>
          </div>
        </Card>
      </div>

      <footer className="auth-footer" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ marginBottom: '16px' }}>
          <Space size="large" wrap style={{ justifyContent: 'center', fontSize: '13px' }}>
            <a href="tel:+256706564628" style={{ color: '#1890ff', textDecoration: 'none', cursor: 'pointer' }}>
              <PhoneOutlined /> +256 706 564 628
            </a>
            <a href="mailto:saptechnologies256@gmail.com" style={{ color: '#1890ff', textDecoration: 'none', cursor: 'pointer' }}>
              <MailOutlined /> saptechnologies256@gmail.com
            </a>
            <a href="https://wa.me/256706564628?text=Hello%2C%20I%20need%20help%20with%20logging%20into%20SAP%20Business%20Management%20Software." target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              <WhatsAppOutlined /> Chat on WhatsApp
            </a>
          </Space>
        </div>
        <p className="auth-footer-text">
          © 2026 SAP Business Management Software. All rights reserved.
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
          Designed and powered by{' '}
          <a href="https://www.sap-technologies.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', fontWeight: '600' }}>
            SAP Technologies Uganda
          </a>
        </p>
      </footer>
      <BackToTop />
      <SAPAIChatbot position="login" />
    </div>
  )
}

export default Login
