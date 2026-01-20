import React from 'react'
import { Typography, Card, Divider, Button, Table, Switch } from 'antd'
import { ArrowLeftOutlined, FileProtectOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph } = Typography

function CookiePolicy() {
  const navigate = useNavigate()
  const lastUpdated = 'January 11, 2026'

  const cookieTypes = [
    {
      key: '1',
      type: 'Essential Cookies',
      purpose: 'Required for the platform to function properly. Enable core features like authentication and security.',
      duration: 'Session / 8 hours',
      canDisable: 'No'
    },
    {
      key: '2',
      type: 'Performance Cookies',
      purpose: 'Collect information about how you use the platform to help us improve performance and user experience.',
      duration: '1 year',
      canDisable: 'Yes'
    },
    {
      key: '3',
      type: 'Functional Cookies',
      purpose: 'Remember your preferences and settings to provide personalized experience.',
      duration: '1 year',
      canDisable: 'Yes'
    },
    {
      key: '4',
      type: 'Analytics Cookies',
      purpose: 'Help us understand usage patterns, identify popular features, and improve our services.',
      duration: '2 years',
      canDisable: 'Yes'
    }
  ]

  const columns = [
    {
      title: 'Cookie Type',
      dataIndex: 'type',
      key: 'type',
      width: '25%'
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      width: '40%'
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: '20%'
    },
    {
      title: 'Can Disable',
      dataIndex: 'canDisable',
      key: 'canDisable',
      width: '15%',
      render: (text) => (
        <span style={{ color: text === 'Yes' ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
          {text}
        </span>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/')}
          style={{ marginBottom: '20px' }}
        >
          Back to Home
        </Button>

        <Card>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <FileProtectOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={1}>Cookie Policy</Title>
            <Paragraph type="secondary">Last Updated: {lastUpdated}</Paragraph>
          </div>

          <Divider />

          <Title level={2}>1. What Are Cookies?</Title>
          <Paragraph>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
            They are widely used to make websites work more efficiently and provide information to website owners. 
            Cookies help us remember your preferences, understand how you use our platform, and improve your overall experience.
          </Paragraph>

          <Title level={2}>2. How We Use Cookies</Title>
          <Paragraph>
            SAP Business Management Software uses cookies for the following purposes:
          </Paragraph>
          <ul>
            <li><strong>Authentication:</strong> To keep you logged in and verify your identity</li>
            <li><strong>Security:</strong> To protect against unauthorized access and fraudulent activity</li>
            <li><strong>Preferences:</strong> To remember your settings and customize your experience</li>
            <li><strong>Performance:</strong> To analyze how our platform is used and identify areas for improvement</li>
            <li><strong>Functionality:</strong> To enable features like language selection and user interface preferences</li>
            <li><strong>Analytics:</strong> To understand usage patterns and improve our services</li>
          </ul>

          <Title level={2}>3. Types of Cookies We Use</Title>
          <Paragraph style={{ marginBottom: '24px' }}>
            We use different types of cookies, each serving a specific purpose:
          </Paragraph>

          <Table 
            dataSource={cookieTypes} 
            columns={columns} 
            pagination={false}
            bordered
            style={{ marginBottom: '30px' }}
          />

          <Title level={2}>4. Specific Cookies Used</Title>
          
          <Title level={3}>4.1 Essential Cookies</Title>
          <ul>
            <li><strong>auth_token:</strong> JWT authentication token to keep you logged in (8 hours)</li>
            <li><strong>session_id:</strong> Unique session identifier for security purposes</li>
            <li><strong>csrf_token:</strong> Protection against cross-site request forgery attacks</li>
          </ul>

          <Title level={3}>4.2 Functional Cookies</Title>
          <ul>
            <li><strong>user_preferences:</strong> Stores your dashboard layout and display preferences</li>
            <li><strong>language:</strong> Remembers your selected language preference</li>
            <li><strong>theme:</strong> Stores your chosen theme (light/dark mode)</li>
          </ul>

          <Title level={3}>4.3 Analytics Cookies</Title>
          <ul>
            <li><strong>analytics_id:</strong> Anonymous identifier for usage tracking</li>
            <li><strong>page_views:</strong> Tracks which pages you visit to improve navigation</li>
            <li><strong>feature_usage:</strong> Records which features are most commonly used</li>
          </ul>

          <Title level={2}>5. Third-Party Cookies</Title>
          <Paragraph>
            We may use trusted third-party services that set cookies on our platform for:
          </Paragraph>
          <ul>
            <li>Analytics and performance monitoring</li>
            <li>Error tracking and debugging</li>
            <li>Payment processing (if applicable)</li>
            <li>Customer support tools</li>
          </ul>
          <Paragraph>
            These third parties have their own privacy policies and cookie policies. We recommend reviewing their policies 
            to understand how they use cookies.
          </Paragraph>

          <Title level={2}>6. Managing Your Cookie Preferences</Title>
          
          <Title level={3}>6.1 Browser Settings</Title>
          <Paragraph>
            Most web browsers allow you to control cookies through their settings. You can:
          </Paragraph>
          <ul>
            <li>View cookies stored on your device</li>
            <li>Delete existing cookies</li>
            <li>Block cookies from specific websites</li>
            <li>Block all cookies (not recommended as it may affect functionality)</li>
            <li>Set your browser to notify you when cookies are sent</li>
          </ul>

          <Title level={3}>6.2 Browser-Specific Instructions</Title>
          <ul>
            <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          </ul>

          <Title level={3}>6.3 Impact of Disabling Cookies</Title>
          <Paragraph>
            If you disable essential cookies, you may experience:
          </Paragraph>
          <ul>
            <li>Inability to log in or stay logged in</li>
            <li>Loss of personalized settings and preferences</li>
            <li>Reduced functionality and features</li>
            <li>Degraded user experience</li>
          </ul>

          <Title level={2}>7. Session vs. Persistent Cookies</Title>
          
          <Title level={3}>7.1 Session Cookies</Title>
          <Paragraph>
            Temporary cookies that are deleted when you close your browser. We use session cookies for authentication 
            and security purposes during your active session.
          </Paragraph>

          <Title level={3}>7.2 Persistent Cookies</Title>
          <Paragraph>
            Cookies that remain on your device for a set period or until you delete them. We use persistent cookies 
            to remember your preferences and provide a personalized experience on return visits.
          </Paragraph>

          <Title level={2}>8. Cookie Consent</Title>
          <Paragraph>
            By using SAP Business Management Software, you consent to our use of cookies as described in this policy. 
            When you first visit our platform, you may see a cookie consent banner allowing you to accept or customize 
            your cookie preferences.
          </Paragraph>

          <Title level={2}>9. Updates to Cookie Policy</Title>
          <Paragraph>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for legal and 
            regulatory reasons. We will notify you of significant changes by posting the updated policy on this page 
            and updating the "Last Updated" date.
          </Paragraph>

          <Title level={2}>10. Do Not Track Signals</Title>
          <Paragraph>
            Some browsers offer a "Do Not Track" (DNT) feature that signals websites not to track your online activity. 
            Currently, there is no universal standard for how websites should respond to DNT signals. We do not currently 
            respond to DNT signals, but we are committed to protecting your privacy as outlined in our Privacy Policy.
          </Paragraph>

          <Title level={2}>11. Contact Us</Title>
          <Paragraph>
            If you have questions about our use of cookies or this Cookie Policy, please contact us:
          </Paragraph>
          <ul>
            <li><strong>Email:</strong> saptechnologies256@gmail.com</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li><strong>WhatsApp:</strong> +256 706 564 628</li>
          </ul>

          <Divider />

          <div style={{ backgroundColor: '#f0f2f5', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
            <Title level={4}>Cookie Preferences (Example)</Title>
            <Paragraph type="secondary">
              Manage your cookie preferences here (this is a demonstration - actual implementation would be interactive):
            </Paragraph>
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <strong>Essential Cookies</strong>
                  <Paragraph type="secondary" style={{ margin: 0 }}>Required for platform functionality</Paragraph>
                </div>
                <Switch checked disabled />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <strong>Performance Cookies</strong>
                  <Paragraph type="secondary" style={{ margin: 0 }}>Help improve platform performance</Paragraph>
                </div>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <strong>Functional Cookies</strong>
                  <Paragraph type="secondary" style={{ margin: 0 }}>Remember your preferences</Paragraph>
                </div>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Analytics Cookies</strong>
                  <Paragraph type="secondary" style={{ margin: 0 }}>Understand usage patterns</Paragraph>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: '40px' }}>
            © 2026 SAP Business Management Software. All rights reserved.
          </Paragraph>
        </Card>
      </div>
      <BackToTop />
    </div>
  )
}

export default CookiePolicy
