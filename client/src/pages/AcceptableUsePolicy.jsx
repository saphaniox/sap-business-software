import React from 'react'
import { Typography, Card, Divider, Button, Alert } from 'antd'
import { ArrowLeftOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph } = Typography

function AcceptableUsePolicy() {
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
            <StopOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
            <Title level={1}>Acceptable Use Policy</Title>
            <Paragraph type="secondary">Last Updated: January 11, 2026</Paragraph>
          </div>

          <Alert
            message="Important: Responsible Use Required"
            description="This Acceptable Use Policy outlines the rules and guidelines for using SAP Business Management Software. Violation of this policy may result in suspension or termination of your account."
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: '30px' }}
          />

          <Divider />

          <Title level={2}>1. Purpose and Scope</Title>
          <Paragraph>
            This Acceptable Use Policy ("AUP") governs your use of SAP Business Management Software ("the Platform"). 
            By using our services, you agree to comply with this policy. This AUP is designed to protect all users, 
            preserve the integrity of our platform, and ensure compliance with applicable laws and regulations.
          </Paragraph>

          <Title level={2}>2. Acceptable Use</Title>
          <Paragraph>
            You may use the Platform for the following purposes:
          </Paragraph>
          <ul>
            <li><strong>Business Operations:</strong> Managing legitimate business operations and commercial activities</li>
            <li><strong>Inventory Management:</strong> Tracking products, stock levels, low stock alerts, demand analytics</li>
            <li><strong>Sales & Transactions:</strong> Processing sales with custom pricing, automatic profit calculations</li>
            <li><strong>Customer Management:</strong> Maintaining customer records and purchase history</li>
            <li><strong>Financial Management:</strong> Generating invoices, receipts, tracking expenses in multiple currencies</li>
            <li><strong>Reporting & Analytics:</strong> Analyzing business performance, sales trends, profit tracking</li>
            <li><strong>Data Export:</strong> Exporting reports to Excel, CSV, or PDF for legitimate business purposes</li>
            <li><strong>Team Management:</strong> Managing users with appropriate role-based permissions (Admin/Manager/Staff)</li>
            <li><strong>Backup & Recovery:</strong> Creating automated backups and restoring business data</li>
            <li><strong>Company Branding:</strong> Uploading company logos for professional documents</li>
            <li><strong>Multi-Currency Operations:</strong> Conducting business in any of the 15+ supported currencies</li>
            <li><strong>Notifications:</strong> Receiving real-time alerts for business activities and low stock warnings</li>
            <li><strong>Any other lawful business management activities</strong></li>
          </ul>

          <Title level={2}>3. Prohibited Activities</Title>
          <Paragraph>
            The following activities are strictly prohibited:
          </Paragraph>

          <Title level={3}>3.1 Illegal Activities</Title>
          <div style={{ backgroundColor: '#fff2e8', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffbb96' }}>
            <Paragraph><StopOutlined style={{ color: '#ff4d4f' }} /> <strong>You must NOT use the Platform to:</strong></Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li>Engage in or facilitate any illegal activities or transactions</li>
              <li>Sell or distribute illegal goods, services, or substances</li>
              <li>Launder money or engage in financial fraud</li>
              <li>Violate any local, national, or international laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Evade taxes or facilitate tax evasion</li>
              <li>Engage in terrorism, violence, or hate crimes</li>
            </ul>
          </div>

          <Title level={3}>3.2 Security Violations</Title>
          <Paragraph>
            You must NOT:
          </Paragraph>
          <ul>
            <li>Attempt to gain unauthorized access to other users' accounts or data</li>
            <li>Circumvent or disable security features of the Platform</li>
            <li>Use automated tools to scrape, harvest, or extract data</li>
            <li>Probe, scan, or test the vulnerability of our systems</li>
            <li>Breach or attempt to breach our authentication mechanisms</li>
            <li>Interfere with or disrupt the Platform's operations or servers</li>
            <li>Introduce viruses, malware, or other harmful code</li>
            <li>Launch denial-of-service (DoS) or distributed denial-of-service (DDoS) attacks</li>
          </ul>

          <Title level={3}>3.3 Abuse and Harassment</Title>
          <Paragraph>
            You must NOT:
          </Paragraph>
          <ul>
            <li>Harass, threaten, or abuse other users or our support staff</li>
            <li>Use the Platform to send spam or unsolicited communications</li>
            <li>Engage in hate speech, discrimination, or promote violence</li>
            <li>Impersonate another person or entity</li>
            <li>Create fake or misleading business profiles</li>
            <li>Post or share inappropriate, offensive, or harmful content</li>
          </ul>

          <Title level={3}>3.4 System Abuse</Title>
          <Paragraph>
            You must NOT:
          </Paragraph>
          <ul>
            <li>Overload or attempt to overload our servers or network infrastructure</li>
            <li>Use the Platform in ways that could damage, disable, or impair the service</li>
            <li>Reverse engineer, decompile, or disassemble the Platform</li>
            <li>Copy, modify, or create derivative works of the Platform</li>
            <li>Remove, obscure, or alter any copyright, trademark, or proprietary notices</li>
            <li>Use the Platform to develop competing products or services</li>
            <li>Resell or sublicense access to the Platform without authorization</li>
          </ul>

          <Title level={3}>3.5 Data Misuse</Title>
          <Paragraph>
            You must NOT:
          </Paragraph>
          <ul>
            <li>Store or process data that violates others' privacy rights</li>
            <li>Upload or transmit personal data without proper consent</li>
            <li>Share customer data with unauthorized third parties</li>
            <li>Use collected data for purposes beyond your business operations</li>
            <li>Store sensitive information (e.g., credit card numbers) in plain text</li>
            <li>Violate data protection regulations (GDPR, CCPA, etc.)</li>
          </ul>

          <Title level={3}>3.6 Fraudulent Activities</Title>
          <Paragraph>
            You must NOT:
          </Paragraph>
          <ul>
            <li>Provide false or misleading information during registration</li>
            <li>Use stolen or fraudulent payment methods</li>
            <li>Create multiple accounts to abuse free trials or promotions</li>
            <li>Manipulate system data to create false reports or analytics</li>
            <li>Engage in price manipulation or fraudulent invoicing</li>
            <li>Use the Platform to facilitate pyramid schemes or Ponzi schemes</li>
          </ul>

          <Title level={2}>4. Content Guidelines</Title>
          <Paragraph>
            When using the Platform, ensure that all content you input (product names, descriptions, customer information, etc.):
          </Paragraph>
          <ul>
            <li>Is accurate and truthful</li>
            <li>Does not infringe on others' intellectual property rights</li>
            <li>Does not contain malicious code or links</li>
            <li>Complies with applicable advertising and marketing regulations</li>
            <li>Does not contain explicit, adult, or age-restricted content (unless legally permitted for your business)</li>
            <li>Respects cultural sensitivities and local norms</li>
          </ul>

          <Title level={2}>5. Resource Usage</Title>
          <Paragraph>
            To ensure fair use for all customers:
          </Paragraph>
          <ul>
            <li>Do not create excessive API requests or database queries</li>
            <li>Limit file uploads to reasonable business needs</li>
            <li>Do not use the Platform for cryptocurrency mining</li>
            <li>Avoid storing unnecessary or duplicate data that consumes excessive resources</li>
            <li>Report any bugs or vulnerabilities responsibly rather than exploiting them</li>
          </ul>

          <Title level={2}>6. Account Sharing and Security</Title>
          <Paragraph>
            You are responsible for:
          </Paragraph>
          <ul>
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring only authorized personnel access your account</li>
            <li>Using the multi-user feature properly with appropriate role assignments</li>
            <li>Promptly reporting any unauthorized access or security breaches</li>
            <li>Logging out when using shared or public computers</li>
          </ul>

          <Title level={2}>7. Compliance with Laws</Title>
          <Paragraph>
            You must:
          </Paragraph>
          <ul>
            <li>Comply with all applicable local, national, and international laws</li>
            <li>Obtain necessary licenses and permits for your business operations</li>
            <li>Follow tax regulations and reporting requirements</li>
            <li>Adhere to consumer protection laws</li>
            <li>Respect labor laws and employee rights</li>
            <li>Follow industry-specific regulations (e.g., pharmacy, healthcare, financial services)</li>
          </ul>

          <Title level={2}>8. Reporting Violations</Title>
          <Paragraph>
            If you become aware of any violations of this AUP:
          </Paragraph>
          <ul>
            <li>Report immediately to our support team</li>
            <li>Provide detailed information about the violation</li>
            <li>Do not attempt to investigate or confront the violator yourself</li>
            <li>Cooperate with any investigation we conduct</li>
          </ul>
          <Paragraph>
            <strong>Report violations to:</strong>
          </Paragraph>
          <ul>
            <li>Email: saptechnologies256@gmail.com (Subject: AUP Violation Report)</li>
            <li>Phone: +256 706 564 628</li>
          </ul>

          <Title level={2}>9. Consequences of Violations</Title>
          <Paragraph>
            Violations of this AUP may result in:
          </Paragraph>
          <ul>
            <li><strong>Warning:</strong> First-time minor violations may receive a written warning</li>
            <li><strong>Temporary Suspension:</strong> Account access suspended for a specified period</li>
            <li><strong>Permanent Termination:</strong> Immediate and permanent account closure for serious violations</li>
            <li><strong>Data Deletion:</strong> Removal of all data associated with terminated accounts</li>
            <li><strong>Legal Action:</strong> Referral to law enforcement for illegal activities</li>
            <li><strong>No Refunds:</strong> Fees are not refunded for accounts terminated due to AUP violations</li>
            <li><strong>Liability:</strong> You may be held liable for damages resulting from your violations</li>
          </ul>

          <Title level={2}>10. Investigation Rights</Title>
          <Paragraph>
            We reserve the right to:
          </Paragraph>
          <ul>
            <li>Investigate suspected violations of this AUP</li>
            <li>Access and review your account data as necessary for investigations</li>
            <li>Cooperate with law enforcement agencies</li>
            <li>Disclose information to authorities as required by law</li>
            <li>Take immediate action to protect the Platform and other users</li>
          </ul>

          <Title level={2}>11. No Liability for User Content</Title>
          <Paragraph>
            We are not responsible for:
          </Paragraph>
          <ul>
            <li>Content created, uploaded, or transmitted by users</li>
            <li>Business transactions conducted using the Platform</li>
            <li>Disputes between you and your customers or employees</li>
            <li>Accuracy of data entered by users</li>
            <li>Compliance with industry-specific regulations by users</li>
          </ul>

          <Title level={2}>12. Modifications to This Policy</Title>
          <Paragraph>
            We may modify this AUP at any time:
          </Paragraph>
          <ul>
            <li>Changes will be posted on this page with an updated "Last Updated" date</li>
            <li>Significant changes will be communicated via email</li>
            <li>Continued use of the Platform after changes constitutes acceptance</li>
            <li>You should review this policy periodically</li>
          </ul>

          <Title level={2}>13. Enforcement</Title>
          <Paragraph>
            We enforce this AUP at our sole discretion:
          </Paragraph>
          <ul>
            <li>We are not obligated to monitor all user activity</li>
            <li>Failure to enforce in one instance does not waive our right to enforce later</li>
            <li>We may take action based on third-party reports or our own monitoring</li>
            <li>Enforcement decisions are final and not subject to appeal</li>
          </ul>

          <Title level={2}>14. Contact Us</Title>
          <Paragraph>
            For questions about this Acceptable Use Policy:
          </Paragraph>
          <ul>
            <li><strong>Email:</strong> saptechnologies256@gmail.com</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li><strong>WhatsApp:</strong> +256 706 564 628</li>
          </ul>

          <Divider />

          <Alert
            message="Commitment to Fair Use"
            description="By adhering to this Acceptable Use Policy, you help us maintain a safe, secure, and reliable platform for all users. Thank you for using SAP Business Management Software responsibly."
            type="info"
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

export default AcceptableUsePolicy
