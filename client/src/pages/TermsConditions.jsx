import React from 'react'
import { Typography, Card, Divider, Button, Alert } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph } = Typography

function TermsConditions() {
  const navigate = useNavigate()

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
            <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={1}>Terms and Conditions</Title>
            <Paragraph type="secondary">Last Updated: January 11, 2026</Paragraph>
          </div>

          <Alert
            message="Important Notice"
            description="Please read these terms and conditions carefully before using SAP Business Management Software. By accessing or using our platform, you agree to be bound by these terms."
            type="info"
            showIcon
            style={{ marginBottom: '30px' }}
          />

          <Divider />

          <Title level={2}>1. Acceptance of Terms</Title>
          <Paragraph>
            By accessing and using SAP Business Management Software ("the Platform"), you accept and agree to be bound 
            by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.
          </Paragraph>

          <Title level={2}>2. Description of Service</Title>
          <Paragraph>
            SAP Business Management Software provides a comprehensive cloud-based business management solution that includes:
          </Paragraph>
          <Title level={3}>2.1 Core Business Features</Title>
          <ul>
            <li><strong>Smart Inventory Management</strong> - Track stock, low stock alerts, demand analytics, automatic stock deduction</li>
            <li><strong>Sales Management</strong> - Process sales, custom pricing, automatic profit calculations, edit history</li>
            <li><strong>Customer Relationship Management</strong> - Store customer data, purchase history, export capabilities</li>
            <li><strong>Professional Invoicing</strong> - Generate invoices with company logo, POS-style thermal receipts</li>
            <li><strong>Expense Tracking</strong> - Record expenses by category, spending analytics, monthly/yearly trends</li>
            <li><strong>Returns Management</strong> - Handle returns efficiently, automatic inventory adjustment, refund tracking</li>
            <li><strong>Advanced Analytics</strong> - Real-time dashboards, sales trends, profit tracking, top product analysis</li>
            <li><strong>Multi-User Access</strong> - Role-based permissions (Admin, Manager, Staff) with activity tracking</li>
          </ul>

          <Title level={3}>2.2 Advanced Features</Title>
          <ul>
            <li><strong>Multi-Currency Support</strong> - 15+ global currencies (UGX, USD, EUR, GBP, KES, TZS, RWF, ZAR, NGN, GHS, INR, AED, SAR, CNY, JPY)</li>
            <li><strong>Export Anywhere</strong> - Export data to Excel (.xlsx), CSV (.csv), and PDF formats with one click</li>
            <li><strong>Real-Time Notifications</strong> - In-app notification center with alerts for low stock, sales, expenses, system events</li>
            <li><strong>Automated Backup System</strong> - Schedule automatic backups, one-click restore, download backup files</li>
            <li><strong>Keyboard Shortcuts</strong> - Ctrl+S to save, Esc to cancel for faster data entry</li>
            <li><strong>Auto-Save Drafts</strong> - Forms automatically save to browser localStorage to prevent data loss</li>
            <li><strong>Loading Skeletons</strong> - Beautiful loading states for better user experience</li>
            <li><strong>Confirmation Dialogs</strong> - Smart confirmations to prevent accidental deletions</li>
            <li><strong>Company Branding</strong> - Upload company logo to appear on all invoices, receipts, and PDF exports</li>
            <li><strong>Edit History & Audit Trails</strong> - Track changes and modifications for accountability</li>
            <li><strong>Advanced Search & Filtering</strong> - Powerful search capabilities across all data tables</li>
            <li><strong>Empty States</strong> - Helpful guidance when no data exists to improve onboarding</li>
            <li><strong>Custom Pricing</strong> - Override product prices per transaction for flexibility</li>
          </ul>

          <Title level={3}>2.3 Multi-Tenancy & Security</Title>
          <ul>
            <li><strong>Complete Data Isolation</strong> - Each business's data is 100% isolated with multi-layered security</li>
            <li><strong>26 Industry Types</strong> - Electronics, fashion, pharmacy, grocery, restaurant, hardware, automotive, hospitality, education, and more</li>
            <li><strong>Flexible Database Options</strong> - Choose between shared database (cost-effective) or dedicated database (enterprise)</li>
            <li><strong>Enterprise-Grade Security</strong> - JWT authentication, password hashing, rate limiting, input sanitization</li>
          </ul>

          <Title level={2}>3. User Registration and Account</Title>
          <Title level={3}>3.1 Account Creation</Title>
          <Paragraph>
            To use the Platform, you must register and create an account by providing accurate and complete information, including:
          </Paragraph>
          <ul>
            <li>Business name and type</li>
            <li>Administrator contact information</li>
            <li>Valid email address</li>
            <li>Secure password</li>
          </ul>

          <Title level={3}>3.2 Account Security</Title>
          <Paragraph>
            You are responsible for:
          </Paragraph>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Ensuring your password meets security requirements</li>
          </ul>

          <Title level={3}>3.3 Account Termination</Title>
          <Paragraph>
            We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent, 
            illegal, or harmful activities.
          </Paragraph>

          <Title level={2}>4. User Responsibilities</Title>
          <Paragraph>
            You agree to:
          </Paragraph>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Use the Platform only for lawful business purposes</li>
            <li>Not attempt to gain unauthorized access to the Platform or other users' data</li>
            <li>Not use the Platform to transmit harmful or malicious content</li>
            <li>Not reverse engineer, decompile, or disassemble the Platform</li>
            <li>Not violate any applicable laws or regulations</li>
            <li>Maintain backup copies of your important data</li>
          </ul>

          <Title level={2}>5. Data Ownership and License</Title>
          <Title level={3}>5.1 Your Data</Title>
          <Paragraph>
            You retain all rights, title, and interest in your business data, including products, customers, sales records, 
            and other information you input into the Platform. We do not claim ownership of your data.
          </Paragraph>

          <Title level={3}>5.2 License to Use Platform</Title>
          <Paragraph>
            We grant you a limited, non-exclusive, non-transferable license to access and use the Platform for your business 
            operations, subject to these terms.
          </Paragraph>

          <Title level={3}>5.3 Data Isolation</Title>
          <Paragraph>
            Your business data is completely isolated from other users. We implement strict data isolation measures to ensure 
            privacy and security.
          </Paragraph>

          <Title level={2}>6. Fees and Payment</Title>
          <Title level={3}>6.1 Subscription Fees</Title>
          <Paragraph>
            Access to certain features may require payment of subscription fees. All fees are stated in the pricing section 
            and are subject to change with prior notice.
          </Paragraph>

          <Title level={3}>6.2 Payment Terms</Title>
          <ul>
            <li>Fees are billed in advance on a monthly or annual basis</li>
            <li>All payments are non-refundable unless otherwise stated</li>
            <li>Failure to pay may result in suspension or termination of service</li>
          </ul>

          <Title level={2}>7. Intellectual Property</Title>
          <Paragraph>
            The Platform, including its source code, design, features, and functionality, is owned by SAP Technologies Uganda 
            and is protected by copyright, trademark, and other intellectual property laws. You may not:
          </Paragraph>
          <ul>
            <li>Copy, modify, or distribute the Platform</li>
            <li>Remove any copyright or proprietary notices</li>
            <li>Use our trademarks without written permission</li>
            <li>Create derivative works based on the Platform</li>
          </ul>

          <Title level={2}>8. Service Availability and Support</Title>
          <Title level={3}>8.1 Service Uptime</Title>
          <Paragraph>
            We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Platform may be unavailable due to:
          </Paragraph>
          <ul>
            <li>Scheduled maintenance</li>
            <li>Emergency repairs</li>
            <li>Internet connectivity issues</li>
            <li>Force majeure events</li>
          </ul>

          <Title level={3}>8.2 Customer Support</Title>
          <Paragraph>
            We provide support through:
          </Paragraph>
          <ul>
            <li>Email: saptechnologies256@gmail.com</li>
            <li>Phone: +256 706 564 628</li>
            <li>WhatsApp: +256 706 564 628</li>
            <li>In-platform help documentation</li>
          </ul>

          <Title level={2}>9. Data Backup and Loss</Title>
          <Paragraph>
            While we implement automated backup systems, you are responsible for maintaining your own backups of critical data. 
            We are not liable for any data loss, corruption, or unavailability.
          </Paragraph>

          <Title level={2}>10. Limitation of Liability</Title>
          <Paragraph>
            To the maximum extent permitted by law:
          </Paragraph>
          <ul>
            <li>We provide the Platform "as is" without warranties of any kind</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability shall not exceed the fees you paid in the last 12 months</li>
            <li>We are not responsible for third-party services or content</li>
          </ul>

          <Title level={2}>11. Indemnification</Title>
          <Paragraph>
            You agree to indemnify and hold harmless SAP Technologies Uganda from any claims, damages, losses, liabilities, 
            and expenses arising from:
          </Paragraph>
          <ul>
            <li>Your use of the Platform</li>
            <li>Your violation of these terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your business operations and activities</li>
          </ul>

          <Title level={2}>12. Privacy and Data Protection</Title>
          <Paragraph>
            Your use of the Platform is also governed by our Privacy Policy. Please review our Privacy Policy to understand 
            how we collect, use, and protect your information.
          </Paragraph>

          <Title level={2}>13. Modifications to Terms</Title>
          <Paragraph>
            We reserve the right to modify these Terms and Conditions at any time. We will notify you of material changes 
            via email or through the Platform. Your continued use of the Platform after changes constitutes acceptance of 
            the modified terms.
          </Paragraph>

          <Title level={2}>14. Termination</Title>
          <Paragraph>
            Either party may terminate this agreement:
          </Paragraph>
          <ul>
            <li>You may close your account at any time</li>
            <li>We may terminate for breach of these terms</li>
            <li>Upon termination, you lose access to your account and data</li>
            <li>We may retain certain data as required by law</li>
          </ul>

          <Title level={2}>15. Governing Law</Title>
          <Paragraph>
            These Terms and Conditions are governed by and construed in accordance with the laws of Uganda. Any disputes 
            shall be resolved in the courts of Uganda.
          </Paragraph>

          <Title level={2}>16. Dispute Resolution</Title>
          <Paragraph>
            In the event of any dispute, both parties agree to first attempt to resolve the matter through good faith 
            negotiations. If negotiations fail, disputes may be submitted to mediation before pursuing legal action.
          </Paragraph>

          <Title level={2}>17. Severability</Title>
          <Paragraph>
            If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall 
            continue in full force and effect.
          </Paragraph>

          <Title level={2}>18. Contact Information</Title>
          <Paragraph>
            For questions about these Terms and Conditions, please contact us:
          </Paragraph>
          <ul>
            <li><strong>Company:</strong> SAP Technologies Uganda</li>
            <li><strong>Email:</strong> saptechnologies256@gmail.com</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li><strong>WhatsApp:</strong> +256 706 564 628</li>
          </ul>

          <Divider />

          <Alert
            message="Agreement"
            description="By using SAP Business Management Software, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions."
            type="success"
            showIcon
            style={{ marginTop: '30px' }}
          />

          <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: '40px' }}>
            © 2026 SAP Business Management Software. All rights reserved.
          </Paragraph>
        </Card>
      </div>
      <BackToTop />
    </div>
  )
}

export default TermsConditions
