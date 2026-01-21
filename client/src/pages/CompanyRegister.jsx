import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography, Space, Select, Row, Col } from 'antd'
import { 
  ShopOutlined, 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
  AppstoreOutlined,
  WhatsAppOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  CloudServerOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import BackToTop from '../components/BackToTop'
import SAPAIChatbot from '../components/SAPAIChatbot'
import logo from '../assets/logo.png'
import '../styles/auth.css'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const API_URL = import.meta.env.VITE_API_URL || 'https://sap-business-management-software.koyeb.app'

function CompanyRegister() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState(null)
  const [industryFeatures, setIndustryFeatures] = useState(null)
  const [form] = Form.useForm()
  const { setAuth } = useAuthStore()

  const handleIndustryChange = async (value) => {
    setSelectedIndustry(value)
    try {
      const response = await axios.get(`${API_URL}/company/industry-features?businessType=${value}`)
      setIndustryFeatures(response.data.features)
    } catch (error) {
      console.error('Error fetching industry features:', error)
    }
  }

  const onFinish = async (values) => {
    if (values.adminPassword !== values.confirmPassword) {
      message.error('Passwords don\'t match. Please make sure both passwords are the same.')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/company/register`, {
        companyName: values.companyName,
        businessType: values.businessType,
        currency: values.currency || 'UGX',
        email: values.email,
        phone: values.phone,
        adminUsername: values.adminUsername,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword
      })

      const { user, company, token, status } = response.data
      
      // Check if registration is pending approval
      if (status === 'pending_approval') {
        message.success(`${company.company_name} registered successfully! Pending admin approval.`)
        navigate('/pending-approval', { 
          state: { 
            company: company,
            user: user
          } 
        })
        return
      }
      
      // Set auth state for approved accounts
      setAuth({...user, company}, token)
      
      message.success(`🎉 ${company.company_name} registered successfully! Welcome aboard!`)
      navigate('/dashboard')
    } catch (error) {
      message.error(
        error.response?.data?.error || 
        'Unable to register company. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="login-container">
        <Card className="login-box register-box">
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
                height: '70px', 
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
              Register Your Company or Business
            </Text>
            <Paragraph style={{ marginTop: '16px', color: '#666' }}>
              Create your company/business account and start managing your operations efficiently.
              Your data is completely isolated and secure - no other company or business can access it.
            </Paragraph>
          </div>
          
          <Form
            form={form}
            name="company_register"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Company Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                Company / Business Information
              </Title>

              <Form.Item
                label="Company / Business Name"
                name="companyName"
                rules={[{ 
                  required: true, 
                  message: 'Please enter your company or business name' 
                }]}
                extra="Your unique company/business identifier - only you will have access to your data"
              >
                <Input 
                  prefix={<ShopOutlined />} 
                  placeholder="e.g., TechHub Solutions, Elite Plumbing Services, Crystal Water Systems" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Business Type / Industry"
                name="businessType"
                rules={[{ 
                  required: true, 
                  message: 'Please select your business type' 
                }]}
                extra="Select your industry to get tailored features and product categories"
              >
                <Select 
                  placeholder="Select your business type"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleIndustryChange}
                >
                  <Option value="electronics">Electronics & Appliances</Option>
                  <Option value="fashion">Fashion & Clothing</Option>
                  <Option value="pharmacy">Pharmacy & Healthcare</Option>
                  <Option value="grocery">Grocery & Supermarket</Option>
                  <Option value="hardware">Hardware & Construction</Option>
                  <Option value="furniture">Furniture & Home Decor</Option>
                  <Option value="automotive">Automotive & Parts</Option>
                  <Option value="restaurant">Restaurant & Food Service</Option>
                  <Option value="beauty">Beauty & Cosmetics</Option>
                  <Option value="bookstore">Books & Stationery</Option>
                  <Option value="sports">Sports & Fitness</Option>
                  <Option value="jewelry">Jewelry & Accessories</Option>
                  <Option value="technology">Technology & IT Services</Option>
                  <Option value="wholesale">Wholesale & Distribution</Option>
                  <Option value="plumbing">Plumbing Services</Option>
                  <Option value="water">Water Supply & Treatment</Option>
                  <Option value="electrical">Electrical Services</Option>
                  <Option value="cleaning">Cleaning Services</Option>
                  <Option value="security">Security Services</Option>
                  <Option value="transport">Transport & Logistics</Option>
                  <Option value="agriculture">Agriculture & Farming</Option>
                  <Option value="education">Education & Training</Option>
                  <Option value="hospitality">Hotel & Hospitality</Option>
                  <Option value="real-estate">Real Estate</Option>
                  <Option value="general">General Retail</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>

              {industryFeatures && (
                <Card 
                  size="small" 
                  style={{ 
                    marginTop: '16px', 
                    marginBottom: '16px',
                    background: '#f0f5ff', 
                    borderColor: '#1890ff' 
                  }}
                >
                  <Title level={5} style={{ marginTop: 0, color: '#1890ff' }}>
                    <AppstoreOutlined /> Features for Your Industry
                  </Title>
                  <Paragraph style={{ marginBottom: '12px', fontSize: '13px' }}>
                    Your business will include these tailored features:
                  </Paragraph>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <Text strong style={{ fontSize: '13px' }}>Product Categories:</Text>
                    <div style={{ marginTop: '4px' }}>
                      {industryFeatures.categories.slice(0, 6).map((cat, idx) => (
                        <span 
                          key={idx}
                          style={{ 
                            display: 'inline-block',
                            padding: '2px 8px',
                            margin: '2px',
                            background: '#fff',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {cat}
                        </span>
                      ))}
                      {industryFeatures.categories.length > 6 && (
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>
                          +{industryFeatures.categories.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <Text strong style={{ fontSize: '13px' }}>Product Attributes:</Text>
                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                      {industryFeatures.attributes.join(', ')}
                    </div>
                  </div>

                  <div>
                    <Text strong style={{ fontSize: '13px' }}>Special Features:</Text>
                    <ul style={{ marginTop: '4px', marginBottom: 0, paddingLeft: '20px' }}>
                      {industryFeatures.features.map((feature, idx) => (
                        <li key={idx} style={{ fontSize: '12px', color: '#666' }}>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}

              <Form.Item
                label="Company Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="contact@yourcompany.com" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Company Phone"
                name="phone"
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="+256 700 000 000" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Local Currency"
                name="currency"
                initialValue="UGX"
                rules={[{ 
                  required: true, 
                  message: 'Please select your local currency' 
                }]}
                extra="This currency will be used throughout your system for all transactions"
              >
                <Select 
                  placeholder="Select your local currency"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                >
                  <Option value="UGX">🇺🇬 UGX - Ugandan Shilling</Option>
                  <Option value="USD">🇺🇸 USD - US Dollar</Option>
                  <Option value="EUR">🇪🇺 EUR - Euro</Option>
                  <Option value="GBP">🇬🇧 GBP - British Pound</Option>
                  <Option value="KES">🇰🇪 KES - Kenyan Shilling</Option>
                  <Option value="TZS">🇹🇿 TZS - Tanzanian Shilling</Option>
                  <Option value="RWF">🇷🇼 RWF - Rwandan Franc</Option>
                  <Option value="ZAR">🇿🇦 ZAR - South African Rand</Option>
                  <Option value="NGN">🇳🇬 NGN - Nigerian Naira</Option>
                  <Option value="GHS">🇬🇭 GHS - Ghanaian Cedi</Option>
                  <Option value="INR">🇮🇳 INR - Indian Rupee</Option>
                  <Option value="AED">🇦🇪 AED - UAE Dirham</Option>
                  <Option value="SAR">🇸🇦 SAR - Saudi Riyal</Option>
                  <Option value="CNY">🇨🇳 CNY - Chinese Yuan</Option>
                  <Option value="JPY">🇯🇵 JPY - Japanese Yen</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Admin User Section */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                Administrator Account
              </Title>

              <Form.Item
                label="Admin Username"
                name="adminUsername"
                rules={[{ 
                  required: true, 
                  message: 'Please choose an admin username' 
                }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="admin" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Admin Email"
                name="adminEmail"
                rules={[
                  { required: true, message: 'Please enter admin email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="admin@yourcompany.com" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Admin Password"
                name="adminPassword"
                rules={[{ 
                  required: true, 
                  message: 'Please create a password (at least 8 characters)' 
                }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Min. 8 characters" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[{ 
                  required: true, 
                  message: 'Please confirm your password' 
                }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Re-enter password" 
                  size="large"
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                size="large"
              >
                Register Business
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text>
                Already have an account?{' '}
                <Link to="/login" style={{ fontWeight: '500' }}>
                  Login here
                </Link>
              </Text>
            </div>
          </Form>
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
                <a onClick={() => navigate('/register')} style={{ color: '#8c8c8c', textDecoration: 'none', cursor: 'pointer', display: 'block' }}>
                  Register as User
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
      <SAPAIChatbot position="company-register" />
    </div>
  )
}

export default CompanyRegister
