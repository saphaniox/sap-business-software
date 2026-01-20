import React from 'react'
import { Typography, Card, Divider, Button, Alert, Timeline } from 'antd'
import { ArrowLeftOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import BackToTop from '../components/BackToTop'

const { Title, Paragraph } = Typography

function RefundPolicy() {
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
            <DollarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={1}>Refund Policy</Title>
            <Paragraph type="secondary">Last Updated: December 20, 2025</Paragraph>
          </div>

          <Alert
            message="Important Information"
            description="This Refund Policy outlines the terms and conditions for requesting refunds on SAP Business Management Software subscription fees and services."
            type="info"
            showIcon
            style={{ marginBottom: '30px' }}
          />

          <Divider />

          <Title level={2}>1. Overview</Title>
          <Paragraph>
            At SAP Business Management Software, we strive to provide high-quality services that meet your business needs. 
            However, we understand that circumstances may arise where you need to request a refund. This policy explains 
            our refund procedures, eligibility criteria, and the process for requesting refunds.
          </Paragraph>

          <Title level={2}>2. Refund Eligibility</Title>
          
          <Title level={3}>2.1 Eligible for Refund</Title>
          <div style={{ backgroundColor: '#f6ffed', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #b7eb8f' }}>
            <Paragraph><CheckCircleOutlined style={{ color: '#52c41a' }} /> <strong>You may be eligible for a refund if:</strong></Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li>You request a refund within 14 days of your initial subscription payment (first-time subscribers only)</li>
              <li>The platform experiences significant technical issues that prevent you from using core features for more than 72 consecutive hours</li>
              <li>You were charged incorrectly due to a billing error on our part</li>
              <li>Duplicate charges were processed for the same subscription period</li>
              <li>The service was not delivered as described at the time of purchase</li>
              <li>We discontinue the service before the end of your paid subscription period</li>
            </ul>
          </div>

          <Title level={3}>2.2 Not Eligible for Refund</Title>
          <div style={{ backgroundColor: '#fff2e8', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffbb96' }}>
            <Paragraph><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> <strong>Refunds will NOT be granted in the following cases:</strong></Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li>Subscription renewals (automatic or manual) after the initial 14-day period</li>
              <li>Partial refunds for unused portions of a subscription period</li>
              <li>Change of mind after the 14-day trial/refund period</li>
              <li>Failure to use the platform due to user error or lack of training</li>
              <li>Violation of our Terms and Conditions resulting in account suspension or termination</li>
              <li>Third-party service failures (internet connectivity, hardware issues, etc.)</li>
              <li>Data loss due to user error or failure to maintain backups</li>
              <li>Dissatisfaction with features after the trial period has ended</li>
            </ul>
          </div>

          <Title level={2}>3. Refund Request Process</Title>
          <Paragraph style={{ marginBottom: '24px' }}>
            To request a refund, please follow these steps:
          </Paragraph>

          <Timeline
            items={[
              {
                color: 'blue',
                children: (
                  <div>
                    <Title level={4}>Step 1: Contact Support</Title>
                    <Paragraph>
                      Send a refund request to our support team via:
                      <ul>
                        <li>Email: saptechnologies256@gmail.com</li>
                        <li>Phone: +256 706 564 628</li>
                        <li>WhatsApp: +256 706 564 628</li>
                      </ul>
                    </Paragraph>
                  </div>
                )
              },
              {
                color: 'blue',
                children: (
                  <div>
                    <Title level={4}>Step 2: Provide Information</Title>
                    <Paragraph>
                      Include the following in your refund request:
                      <ul>
                        <li>Your business name and account email</li>
                        <li>Transaction ID or payment reference number</li>
                        <li>Date of payment</li>
                        <li>Amount paid</li>
                        <li>Detailed reason for refund request</li>
                        <li>Supporting documentation (if applicable)</li>
                      </ul>
                    </Paragraph>
                  </div>
                )
              },
              {
                color: 'blue',
                children: (
                  <div>
                    <Title level={4}>Step 3: Review Process</Title>
                    <Paragraph>
                      Our team will review your request within 3-5 business days. We may contact you for additional 
                      information or clarification if needed.
                    </Paragraph>
                  </div>
                )
              },
              {
                color: 'blue',
                children: (
                  <div>
                    <Title level={4}>Step 4: Decision Notification</Title>
                    <Paragraph>
                      You will receive an email notification with our decision. If approved, we will process your refund 
                      as outlined in Section 5.
                    </Paragraph>
                  </div>
                )
              }
            ]}
          />

          <Title level={2}>4. 14-Day Money-Back Guarantee</Title>
          <Paragraph>
            For first-time subscribers, we offer a 14-day money-back guarantee:
          </Paragraph>
          <ul>
            <li>Available only for your first subscription payment</li>
            <li>Must be requested within 14 calendar days of your initial payment</li>
            <li>Full refund of subscription fees (excluding any transaction fees charged by payment processors)</li>
            <li>Your account will be deactivated upon refund approval</li>
            <li>All data associated with your account will be deleted after 30 days</li>
            <li>Not applicable to subscription renewals or subsequent payments</li>
          </ul>

          <Title level={2}>5. Refund Processing</Title>
          
          <Title level={3}>5.1 Processing Time</Title>
          <Paragraph>
            Once your refund is approved:
          </Paragraph>
          <ul>
            <li>Refunds are processed within 5-7 business days</li>
            <li>The refund will be issued to the original payment method</li>
            <li>Bank processing times may add an additional 3-10 business days</li>
            <li>You will receive a confirmation email when the refund is processed</li>
          </ul>

          <Title level={3}>5.2 Refund Method</Title>
          <Paragraph>
            Refunds will be issued using the same payment method used for the original purchase:
          </Paragraph>
          <ul>
            <li><strong>Credit/Debit Card:</strong> Refunded to the original card</li>
            <li><strong>Mobile Money:</strong> Refunded to the mobile money account used</li>
            <li><strong>Bank Transfer:</strong> Refunded to the originating bank account</li>
          </ul>

          <Title level={2}>6. Partial Refunds</Title>
          <Paragraph>
            In certain circumstances, we may offer partial refunds at our discretion:
          </Paragraph>
          <ul>
            <li>Platform downtime exceeding our service level agreement</li>
            <li>Billing errors affecting service delivery</li>
            <li>Prorated refunds for early service discontinuation by us</li>
          </ul>
          <Paragraph>
            Partial refunds are calculated on a case-by-case basis and are not guaranteed.
          </Paragraph>

          <Title level={2}>7. Cancellation vs. Refund</Title>
          <Paragraph>
            It's important to understand the difference:
          </Paragraph>
          <ul>
            <li><strong>Cancellation:</strong> Stops future billing but does not refund current subscription fees. 
            You retain access until the end of your paid period.</li>
            <li><strong>Refund:</strong> Returns payment and may result in immediate account deactivation, depending 
            on the circumstances.</li>
          </ul>

          <Title level={2}>8. Free Trial and Refunds</Title>
          <Paragraph>
            If a free trial period is offered:
          </Paragraph>
          <ul>
            <li>You can cancel anytime during the trial without charge</li>
            <li>The 14-day money-back guarantee starts from your first paid subscription, not the trial start date</li>
            <li>If you cancel during the free trial, no refund is necessary as no payment was made</li>
          </ul>

          <Title level={2}>9. Account Termination and Refunds</Title>
          <Paragraph>
            If your account is terminated for violating our Terms and Conditions:
          </Paragraph>
          <ul>
            <li>No refunds will be issued</li>
            <li>All remaining subscription time is forfeited</li>
            <li>You are not entitled to compensation for unused subscription periods</li>
          </ul>

          <Title level={2}>10. Dispute Resolution</Title>
          <Paragraph>
            If your refund request is denied and you wish to dispute the decision:
          </Paragraph>
          <ul>
            <li>Contact our support team to request an escalation</li>
            <li>Provide any additional information or documentation supporting your claim</li>
            <li>A senior manager will review your case within 5-7 business days</li>
            <li>The manager's decision is final</li>
          </ul>

          <Title level={2}>11. Chargebacks</Title>
          <Paragraph>
            We strongly discourage initiating chargebacks through your bank or payment provider before contacting us:
          </Paragraph>
          <ul>
            <li>Chargebacks should be a last resort after exhausting our refund process</li>
            <li>Initiating a chargeback may result in immediate account suspension</li>
            <li>Chargeback fees may be passed on to you if the chargeback is found to be unjustified</li>
            <li>We reserve the right to provide transaction evidence to your payment provider</li>
          </ul>

          <Title level={2}>12. Changes to This Policy</Title>
          <Paragraph>
            We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon 
            posting to this page. Your continued use of our services after changes constitutes acceptance of the updated policy.
          </Paragraph>

          <Title level={2}>13. Contact Information</Title>
          <Paragraph>
            For refund requests or questions about this policy, please contact us:
          </Paragraph>
          <ul>
            <li><strong>Email:</strong> saptechnologies256@gmail.com</li>
            <li><strong>Phone:</strong> +256 706 564 628</li>
            <li><strong>WhatsApp:</strong> +256 706 564 628</li>
            <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (EAT)</li>
          </ul>

          <Divider />

          <Alert
            message="Customer Satisfaction Guarantee"
            description="We are committed to your satisfaction. If you experience any issues with our platform, please contact our support team before requesting a refund. We're here to help resolve any problems and ensure you get the most value from our services."
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

export default RefundPolicy
