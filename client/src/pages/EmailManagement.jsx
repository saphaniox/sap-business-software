import React, { useState, useEffect } from 'react';
import {
  Card, Button, Form, Input, Select, message, Tabs, Table, Tag, Modal,
  Space, Typography, Row, Col, Divider, Alert, Spin
} from 'antd';
import {
  MailOutlined, SendOutlined, HistoryOutlined, CheckCircleOutlined,
  CloseCircleOutlined, RocketOutlined, WarningOutlined, BulbOutlined,
  ReloadOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function EmailManagement() {
  const [loading, setLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [testModalVisible, setTestModalVisible] = useState(false);
  
  const [approvalForm] = Form.useForm();
  const [suspensionForm] = Form.useForm();
  const [featuresForm] = Form.useForm();
  const [customForm] = Form.useForm();

  useEffect(() => {
    fetchEmailLogs();
    fetchCompanies();
  }, []);

  const fetchEmailLogs = async () => {
    try {
      const response = await api.get('/email/logs?limit=100');
      setEmailLogs(response.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/superadmin/companies');
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const sendApprovalEmail = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/email/send-approval', {
        companyId: values.companyId
      });
      message.success(response.data.message);
      approvalForm.resetFields();
      fetchEmailLogs();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send approval email');
    } finally {
      setLoading(false);
    }
  };

  const sendSuspensionEmail = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/email/send-suspension', {
        companyId: values.companyId,
        reason: values.reason
      });
      message.success(response.data.message);
      suspensionForm.resetFields();
      fetchEmailLogs();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send suspension email');
    } finally {
      setLoading(false);
    }
  };

  const sendFeaturesEmail = async (values) => {
    setLoading(true);
    try {
      // Parse features from textarea
      const featuresArray = values.features.split('\n').filter(f => f.trim()).map(line => {
        const [icon, rest] = line.split(' ');
        const [title, ...descParts] = rest.split(':');
        return {
          icon: icon || '✨',
          title: title.trim(),
          description: descParts.join(':').trim()
        };
      });

      const response = await api.post('/email/send-features', {
        recipientType: values.recipientType,
        companyIds: values.recipientType === 'specific' ? values.companyIds : undefined,
        features: featuresArray,
        learnMoreUrl: values.learnMoreUrl
      });
      message.success(response.data.message);
      featuresForm.resetFields();
      fetchEmailLogs();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send features email');
    } finally {
      setLoading(false);
    }
  };

  const sendCustomEmail = async (values) => {
    setLoading(true);
    try {
      const emails = values.recipientEmails.split(',').map(e => e.trim()).filter(e => e);
      
      const response = await api.post('/email/send-custom', {
        recipientEmails: emails,
        subject: values.subject,
        message: values.message
      });
      message.success(response.data.message);
      customForm.resetFields();
      fetchEmailLogs();
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send custom email');
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfig = async () => {
    setLoading(true);
    try {
      const response = await api.post('/email/test');
      message.success('Test email sent successfully! Check your inbox.');
      setTestModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  const emailLogColumns = [
    {
      title: 'Date',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (date) => new Date(date).toLocaleString(),
      width: 180
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
      ellipsis: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeColors = {
          account_approval: 'green',
          account_suspension: 'red',
          new_features: 'blue',
          custom: 'purple'
        };
        return <Tag color={typeColors[type] || 'default'}>{type.replace('_', ' ')}</Tag>;
      },
      width: 150
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success) => success ? 
        <Tag icon={<CheckCircleOutlined />} color="success">Sent</Tag> : 
        <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>,
      width: 100
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card>
            <Space align="center" size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <MailOutlined style={{ fontSize: '32px', color: '#667eea' }} />
                <div>
                  <Title level={2} style={{ margin: 0 }}>Email Management</Title>
                  <Text type="secondary">Send professional emails to clients</Text>
                </div>
              </Space>
              <Space>
                <Button 
                  icon={<ThunderboltOutlined />} 
                  onClick={() => setTestModalVisible(true)}
                >
                  Test Configuration
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchEmailLogs}
                >
                  Refresh Logs
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="approval" items={[
        {
          key: 'approval',
          label: <span><CheckCircleOutlined /> Account Approval</span>,
          children: (
            <Card>
              <Alert
                message="Account Approval Email"
                description="Send a professional welcome email when approving a company account. Includes login credentials and feature overview."
                type="info"
                showIcon
                icon={<BulbOutlined />}
                style={{ marginBottom: '24px' }}
              />
              
              <Form form={approvalForm} layout="vertical" onFinish={sendApprovalEmail}>
                <Form.Item
                  label="Select Company"
                  name="companyId"
                  rules={[{ required: true, message: 'Please select a company' }]}
                >
                  <Select
                    placeholder="Choose company to approve"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {companies.filter(c => c.status === 'pending_approval').map(company => (
                      <Option key={company._id} value={company._id}>
                        {company.business_name} ({company.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Send Approval Email
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )
        },
        {
          key: 'suspension',
          label: <span><WarningOutlined /> Account Suspension</span>,
          children: (
            <Card>
              <Alert
                message="Account Suspension Email"
                description="Notify a company that their account has been suspended with a specific reason."
                type="warning"
                showIcon
                style={{ marginBottom: '24px' }}
              />
              
              <Form form={suspensionForm} layout="vertical" onFinish={sendSuspensionEmail}>
                <Form.Item
                  label="Select Company"
                  name="companyId"
                  rules={[{ required: true, message: 'Please select a company' }]}
                >
                  <Select
                    placeholder="Choose company to suspend"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {companies.filter(c => c.status === 'active' || c.status === 'suspended').map(company => (
                      <Option key={company._id} value={company._id}>
                        {company.business_name} ({company.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Suspension Reason"
                  name="reason"
                  rules={[{ required: true, message: 'Please provide a reason' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter the reason for suspension (e.g., 'Account suspended due to violation of terms of service')"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    danger
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Send Suspension Email
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )
        },
        {
          key: 'features',
          label: <span><RocketOutlined /> New Features</span>,
          children: (
            <Card>
              <Alert
                message="New Features Announcement"
                description="Announce exciting new features to all clients or specific companies."
                type="success"
                showIcon
                icon={<RocketOutlined />}
                style={{ marginBottom: '24px' }}
              />
              
              <Form form={featuresForm} layout="vertical" onFinish={sendFeaturesEmail}>
                <Form.Item
                  label="Recipients"
                  name="recipientType"
                  rules={[{ required: true }]}
                  initialValue="all"
                >
                  <Select>
                    <Option value="all">All Active Companies</Option>
                    <Option value="specific">Specific Companies</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => 
                    prevValues.recipientType !== currentValues.recipientType
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('recipientType') === 'specific' ? (
                      <Form.Item
                        label="Select Companies"
                        name="companyIds"
                        rules={[{ required: true, message: 'Please select at least one company' }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Choose companies"
                          showSearch
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {companies.filter(c => c.status === 'active').map(company => (
                            <Option key={company._id} value={company._id}>
                              {company.business_name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item
                  label="Features (one per line, format: 'emoji Title: Description')"
                  name="features"
                  rules={[{ required: true, message: 'Please enter features' }]}
                >
                  <TextArea
                    rows={8}
                    placeholder={'📊 Advanced Analytics: Get deeper insights with our new analytics dashboard\n🔒 Enhanced Security: Two-factor authentication now available\n⚡ Performance Boost: 50% faster page load times'}
                  />
                </Form.Item>

                <Form.Item
                  label="Learn More URL (optional)"
                  name="learnMoreUrl"
                >
                  <Input placeholder="https://your-website.com/new-features" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Send Feature Announcement
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )
        },
        {
          key: 'custom',
          label: <span><MailOutlined /> Custom Message</span>,
          children: (
            <Card>
              <Alert
                message="Custom Email Message"
                description="Send a personalized message to specific email addresses."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
              />
              
              <Form form={customForm} layout="vertical" onFinish={sendCustomEmail}>
                <Form.Item
                  label="Recipient Emails (comma separated)"
                  name="recipientEmails"
                  rules={[{ required: true, message: 'Please enter recipient emails' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </Form.Item>

                <Form.Item
                  label="Subject"
                  name="subject"
                  rules={[{ required: true, message: 'Please enter subject' }]}
                >
                  <Input placeholder="Email subject" />
                </Form.Item>

                <Form.Item
                  label="Message"
                  name="message"
                  rules={[{ required: true, message: 'Please enter message' }]}
                >
                  <TextArea
                    rows={10}
                    placeholder="Enter your custom message here..."
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={loading}
                    size="large"
                  >
                    Send Custom Email
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )
        },
        {
          key: 'logs',
          label: <span><HistoryOutlined /> Email Logs</span>,
          children: (
            <Card>
              <Table
                columns={emailLogColumns}
                dataSource={emailLogs}
                rowKey="_id"
                pagination={{ pageSize: 20 }}
                loading={loading}
              />
            </Card>
          )
        }
      ]} />

      <Modal
        title="Test Email Configuration"
        open={testModalVisible}
        onOk={testEmailConfig}
        onCancel={() => setTestModalVisible(false)}
        confirmLoading={loading}
      >
        <Paragraph>
          This will send a test email to saptechnologies256@gmail.com to verify your email configuration is working correctly.
        </Paragraph>
        <Alert
          message="Make sure EMAIL_PASSWORD is set in your environment variables"
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
}
