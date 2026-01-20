import React from 'react'
import { Typography, Card, Divider, Button, Alert, Tag } from 'antd'
import { ArrowLeftOutlined, SafetyOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph } = Typography

function DataProtection() {
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
            <LockOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={1}>Data Protection & Security</Title>
            <Paragraph type="secondary">Last Updated: December 20, 2025</Paragraph>
          </div>

          <Alert
            message="Our Commitment to Data Protection"
            description="At SAP Business Management Software, data protection and security are our top priorities. We implement industry-leading security measures to ensure your business data remains safe, private, and secure at all times."
            type="success"
            showIcon
            icon={<SafetyOutlined />}
            style={{ marginBottom: '30px' }}
          />

          <Divider />

          <Title level={2}>1. Data Protection Principles</Title>
          <Paragraph>
            Our data protection strategy is built on the following core principles:
          </Paragraph>
          <ul>
            <li><strong>Complete Data Isolation:</strong> Each business operates in a completely isolated environment</li>
            <li><strong>Privacy by Design:</strong> Security and privacy built into every feature from the ground up</li>
            <li><strong>Data Minimization:</strong> We only collect data necessary for service delivery</li>
            <li><strong>Transparency:</strong> Clear communication about how we handle your data</li>
            <li><strong>User Control:</strong> You maintain full control over your business data</li>
            <li><strong>Accountability:</strong> We take responsibility for protecting your information</li>
          </ul>

          <Title level={2}>2. Multi-Tenant Architecture with Complete Isolation</Title>
          <Paragraph>
            Our platform uses advanced multi-tenant architecture with strict data isolation:
          </Paragraph>

          <div style={{ backgroundColor: '#f6ffed', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #b7eb8f' }}>
            <Title level={4}><SafetyOutlined /> Isolation Features:</Title>
            <ul style={{ marginBottom: 0 }}>
              <li><strong>Logical Separation:</strong> Each business has a unique identifier ensuring data cannot be mixed</li>
              <li><strong>Query Filtering:</strong> All database queries automatically filter by business ID</li>
              <li><strong>Access Controls:</strong> Cross-business access is technically impossible</li>
              <li><strong>Independent Sessions:</strong> Each business maintains separate user sessions</li>
              <li><strong>Isolated Backups:</strong> Backup files are business-specific and encrypted</li>
            </ul>
          </div>

          <Title level={2}>3. Authentication and Access Control</Title>
          
          <Title level={3}>3.1 User Authentication</Title>
          <Paragraph>
            We implement robust authentication mechanisms:
          </Paragraph>
          <ul>
            <li><strong>Password Security:</strong>
              <ul>
                <li>Minimum 8 characters required</li>
                <li>Bcrypt hashing with 12 salt rounds</li>
                <li>Passwords never stored in plain text</li>
                <li>Secure password reset process</li>
              </ul>
            </li>
            <li><strong>JWT Tokens:</strong>
              <ul>
                <li>8-hour token expiry for automatic logout</li>
                <li>Cryptographically signed tokens</li>
                <li>Token validation on every request</li>
              </ul>
            </li>
            <li><strong>Account Lockout:</strong>
              <ul>
                <li>Automatic lockout after 5 failed login attempts</li>
                <li>2-hour lockout duration for security</li>
                <li>Protection against brute force attacks</li>
              </ul>
            </li>
          </ul>

          <Title level={3}>3.2 Role-Based Access Control (RBAC)</Title>
          <Paragraph>
            Within your business, we enforce strict role-based permissions:
          </Paragraph>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Tag color="red" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <KeyOutlined /> <strong>Admin:</strong> Full system access
            </Tag>
            <Tag color="blue" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <KeyOutlined /> <strong>Manager:</strong> Sales, reports, expenses
            </Tag>
            <Tag color="green" style={{ padding: '8px 16px', fontSize: '14px' }}>
              <KeyOutlined /> <strong>Staff:</strong> Basic sales and customers
            </Tag>
          </div>

          <ul>
            <li>Users can only access features permitted by their role</li>
            <li>Sensitive operations (user management, backups) restricted to admins</li>
            <li>Audit logs track all user actions for accountability</li>
          </ul>

          <Title level={2}>4. Data Encryption</Title>
          
          <Title level={3}>4.1 Encryption in Transit</Title>
          <Paragraph>
            All data transmitted between your device and our servers is encrypted:
          </Paragraph>
          <ul>
            <li>TLS 1.2+ encryption for all connections</li>
            <li>HTTPS protocol enforced across the platform</li>
            <li>Secure WebSocket connections for real-time features</li>
            <li>Certificate-based authentication</li>
          </ul>

          <Title level={3}>4.2 Encryption at Rest</Title>
          <Paragraph>
            Your data is encrypted when stored on our servers:
          </Paragraph>
          <ul>
            <li>Database encryption for sensitive fields</li>
            <li>Encrypted backup files</li>
            <li>Secure key management systems</li>
            <li>Regular key rotation policies</li>
          </ul>

          <Title level={2}>5. Data Backup and Recovery</Title>
          <Paragraph>
            We implement comprehensive backup strategies to protect against data loss:
          </Paragraph>
          <ul>
            <li><strong>Automated Backups:</strong> Daily automated backups of all business data</li>
            <li><strong>User-Initiated Backups:</strong> Admins can create backups anytime through the dashboard</li>
            <li><strong>Encrypted Storage:</strong> All backup files are encrypted and securely stored</li>
            <li><strong>Easy Restoration:</strong> Simple one-click restore process</li>
            <li><strong>Download Option:</strong> Export and download your backup files</li>
            <li><strong>Retention Period:</strong> Backups retained for 90 days minimum</li>
          </ul>

          <Title level={2}>6. Security Monitoring and Auditing</Title>
          
          <Title level={3}>6.1 Activity Logging</Title>
          <Paragraph>
            We maintain detailed logs of system activity:
          </Paragraph>
          <ul>
            <li>All login attempts (successful and failed)</li>
            <li>User actions and data modifications</li>
            <li>Administrative operations</li>
            <li>System access patterns</li>
            <li>API usage and requests</li>
          </ul>

          <Title level={3}>6.2 Threat Detection</Title>
          <Paragraph>
            Active monitoring for security threats:
          </Paragraph>
          <ul>
            <li>Real-time intrusion detection systems</li>
            <li>Anomaly detection for unusual activity</li>
            <li>Automated alerts for suspicious behavior</li>
            <li>Regular security vulnerability scans</li>
          </ul>

          <Title level={2}>7. Compliance and Standards</Title>
          <Paragraph>
            We adhere to industry best practices and compliance standards:
          </Paragraph>
          <ul>
            <li><strong>Data Protection Regulations:</strong> Compliance with local and international data protection laws</li>
            <li><strong>Security Standards:</strong> Implementation of OWASP security guidelines</li>
            <li><strong>Regular Audits:</strong> Quarterly security audits and penetration testing</li>
            <li><strong>Vendor Security:</strong> Due diligence on third-party service providers</li>
          </ul>

          <Title level={2}>8. Incident Response</Title>
          <Paragraph>
            In the unlikely event of a security incident:
          </Paragraph>
          <ul>
            <li><strong>Immediate Response:</strong> 24/7 security team ready to respond</li>
            <li><strong>Containment:</strong> Quick isolation of affected systems</li>
            <li><strong>Investigation:</strong> Thorough analysis to identify root cause</li>
            <li><strong>Notification:</strong> Prompt communication with affected users</li>
            <li><strong>Remediation:</strong> Implementation of fixes and preventive measures</li>
            <li><strong>Documentation:</strong> Detailed incident reports and lessons learned</li>
          </ul>

          <Title level={2}>9. Your Responsibilities</Title>
          <Paragraph>
            While we implement strong security measures, you also play a role in protecting your data:
          </Paragraph>
          <ul>
            <li><strong>Strong Passwords:</strong> Use complex, unique passwords for your account</li>
            <li><strong>Credential Security:</strong> Never share login credentials with unauthorized individuals</li>
            <li><strong>Regular Backups:</strong> Periodically download backup copies of critical data</li>
            <li><strong>User Management:</strong> Promptly remove access for former employees</li>
            <li><strong>Security Updates:</strong> Keep your devices and browsers up to date</li>
            <li><strong>Suspicious Activity:</strong> Report any unusual account activity immediately</li>
          </ul>

          <Title level={2}>10. Data Retention and Deletion</Title>
          
          <Title level={3}>10.1 Retention Policy</Title>
          <Paragraph>
            We retain your data according to the following policy:
          </Paragraph>
          <ul>
            <li>Active account data: Retained indefinitely while account is active</li>
            <li>Closed accounts: Data retained for 30 days before permanent deletion</li>
            <li>Backups: Retained for 90 days from creation date</li>
            <li>Audit logs: Retained for 2 years for compliance purposes</li>
          </ul>

          <Title level={3}>10.2 Data Deletion</Title>
          <Paragraph>
            You have the right to request data deletion:
          </Paragraph>
          <ul>
            <li>Contact support to request account and data deletion</li>
            <li>30-day grace period before permanent deletion</li>
            <li>Certain data may be retained as required by law</li>
            <li>Deletion is permanent and cannot be undone</li>
          </ul>

          <Title level={2}>11. Third-Party Services</Title>
          <Paragraph>
            We may use trusted third-party services for:
          </Paragraph>
          <ul>
            <li>Infrastructure hosting and cloud services</li>
            <li>Payment processing (with PCI-DSS compliant providers)</li>
            <li>Error tracking and performance monitoring</li>
            <li>Customer support tools</li>
          </ul>
          <Paragraph>
            All third-party providers are carefully vetted and contractually bound to maintain data security and privacy standards.
          </Paragraph>

          <Title level={2}>12. International Data Transfers</Title>
          <Paragraph>
            If data is transferred internationally:
          </Paragraph>
          <ul>
            <li>We ensure adequate protection measures are in place</li>
            <li>Compliance with relevant data transfer regulations</li>
            <li>Encryption during transit across borders</li>
            <li>Contractual safeguards with international partners</li>
          </ul>

          <Title level={2}>13. Security Updates and Maintenance</Title>
          <Paragraph>
            We continuously improve our security posture:
          </Paragraph>
          <ul>
            <li>Regular security patches and updates</li>
            <li>Quarterly security assessment reviews</li>
            <li>Annual penetration testing by external security firms</li>
            <li>Continuous monitoring of emerging threats</li>
            <li>Staff security training and awareness programs</li>
          </ul>

          <Title level={2}>14. Reporting Security Concerns</Title>
          <Paragraph>
            If you discover a security vulnerability or have concerns:
          </Paragraph>
          <ul>
            <li><strong>Email:</strong> saptechnologies256@gmail.com (Subject: Security Issue)</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li>Provide detailed information about the issue</li>
            <li>We will acknowledge receipt within 24 hours</li>
            <li>Investigation and response within 72 hours</li>
          </ul>

          <Title level={2}>15. Contact Us</Title>
          <Paragraph>
            For questions about data protection and security:
          </Paragraph>
          <ul>
            <li><strong>Email:</strong> saptechnologies256@gmail.com</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li><strong>WhatsApp:</strong> +256 706 564 628</li>
          </ul>

          <Divider />

          <div style={{ backgroundColor: '#e6f7ff', padding: '20px', borderRadius: '8px', marginTop: '30px', border: '1px solid #91d5ff' }}>
            <Title level={4}><SafetyOutlined /> Security Summary</Title>
            <Paragraph style={{ marginBottom: '10px' }}>
              <strong>Your data is protected by:</strong>
            </Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li>✓ Complete business data isolation</li>
              <li>✓ Encrypted connections (TLS 1.2+)</li>
              <li>✓ Encrypted data storage</li>
              <li>✓ Bcrypt password hashing (12 rounds)</li>
              <li>✓ JWT token authentication (8-hour expiry)</li>
              <li>✓ Account lockout protection</li>
              <li>✓ Role-based access control</li>
              <li>✓ Automated daily backups</li>
              <li>✓ 24/7 security monitoring</li>
              <li>✓ Regular security audits</li>
            </ul>
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

export default DataProtection
