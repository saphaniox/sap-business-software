import { useState, useEffect } from 'react';
import {
  Card, Form, Input, Switch, Button, message, Tabs, Space,
  Typography, Divider, Tag, Row, Col
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  MailOutlined,
  FlagOutlined,
  DollarOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { platformSettingsAPI } from '../services/api';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SuperAdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [generalForm] = Form.useForm();
  const [featureFlagsForm] = Form.useForm();
  const [emailTemplatesForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await platformSettingsAPI.get();
      if (response.data.success) {
        const data = response.data.settings;
        setSettings(data);
        
        // Set form values
        generalForm.setFieldsValue({
          maintenance_mode: data.maintenance_mode,
          maintenance_message: data.maintenance_message
        });
        
        featureFlagsForm.setFieldsValue(data.feature_flags);
        emailTemplatesForm.setFieldsValue(data.email_templates);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async (enabled) => {
    const maintenanceMessage = generalForm.getFieldValue('maintenance_message');
    setLoading(true);
    try {
      const response = await platformSettingsAPI.toggleMaintenanceMode(enabled, maintenanceMessage);
      if (response.data.success) {
        message.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
        fetchSettings();
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      message.error('Failed to toggle maintenance mode');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeatureFlags = async (values) => {
    setLoading(true);
    try {
      const response = await platformSettingsAPI.updateFeatureFlags(values);
      if (response.data.success) {
        message.success('Feature flags updated successfully');
        fetchSettings();
      }
    } catch (error) {
      console.error('Error updating feature flags:', error);
      message.error('Failed to update feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmailTemplates = async (values) => {
    setLoading(true);
    try {
      const response = await platformSettingsAPI.updateEmailTemplates(values);
      if (response.data.success) {
        message.success('Email templates updated successfully');
        fetchSettings();
      }
    } catch (error) {
      console.error('Error updating email templates:', error);
      message.error('Failed to update email templates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <SettingOutlined /> Platform Settings
      </Title>

      <Tabs defaultActiveKey="general">
        {/* General Settings */}
        <TabPane
          tab={
            <span>
              <ToolOutlined />
              General
            </span>
          }
          key="general"
        >
          <Card title="System Maintenance" loading={loading}>
            <Form form={generalForm} layout="vertical">
              <Form.Item
                name="maintenance_mode"
                label="Maintenance Mode"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                  onChange={handleToggleMaintenance}
                />
              </Form.Item>
              {settings?.maintenance_mode && (
                <Tag color="warning" style={{ marginBottom: 16 }}>
                  ⚠️ System is currently in maintenance mode
                </Tag>
              )}
              <Form.Item
                name="maintenance_message"
                label="Maintenance Message"
              >
                <TextArea
                  rows={3}
                  placeholder="Message to display to users during maintenance"
                />
              </Form.Item>
            </Form>
          </Card>

          <Card title="System Limits" style={{ marginTop: 16 }} loading={loading}>
            {settings?.system_limits && (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Max File Upload Size:</Text> {settings.system_limits.max_file_upload_size_mb} MB
                </div>
                <div>
                  <Text strong>Session Timeout:</Text> {settings.system_limits.session_timeout_hours} hours
                </div>
                <div>
                  <Text strong>Rate Limit:</Text> {settings.system_limits.rate_limit_per_minute} requests/minute
                </div>
                <div>
                  <Text strong>Max Users per Company:</Text> {settings.system_limits.max_users_per_company}
                </div>
              </Space>
            )}
          </Card>
        </TabPane>

        {/* Feature Flags */}
        <TabPane
          tab={
            <span>
              <FlagOutlined />
              Feature Flags
            </span>
          }
          key="features"
        >
          <Card title="Enable/Disable Platform Features" loading={loading}>
            <Form
              form={featureFlagsForm}
              layout="vertical"
              onFinish={handleUpdateFeatureFlags}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="analytics"
                    label="Analytics Dashboard"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="reports"
                    label="Reports & Export"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="multi_currency"
                    label="Multi-Currency Support"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="backup_restore"
                    label="Backup & Restore"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="announcements"
                    label="Announcements System"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="support_tickets"
                    label="Support Tickets"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="product_returns"
                    label="Product Returns"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="barcode_scanning"
                    label="Barcode Scanning"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                  </Form.Item>
                </Col>
              </Row>
              <Divider />
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Save Feature Flags
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* Email Templates */}
        <TabPane
          tab={
            <span>
              <MailOutlined />
              Email Templates
            </span>
          }
          key="emails"
        >
          <Card title="Customize Email Templates" loading={loading}>
            <Form
              form={emailTemplatesForm}
              layout="vertical"
              onFinish={handleUpdateEmailTemplates}
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Available variables: {'{company_name}'}, {'{user_name}'}, {'{platform_name}'}, {'{login_url}'}
              </Text>
              
              <Divider orientation="left">Welcome Email</Divider>
              <Form.Item
                name={['welcome', 'subject']}
                label="Subject"
              >
                <Input placeholder="Welcome to {platform_name}!" />
              </Form.Item>
              <Form.Item
                name={['welcome', 'body']}
                label="Body"
              >
                <TextArea
                  rows={6}
                  placeholder="Dear {user_name}, Welcome to {platform_name}..."
                />
              </Form.Item>

              <Divider orientation="left">Company Approval Email</Divider>
              <Form.Item
                name={['approval', 'subject']}
                label="Subject"
              >
                <Input placeholder="Your company has been approved!" />
              </Form.Item>
              <Form.Item
                name={['approval', 'body']}
                label="Body"
              >
                <TextArea
                  rows={6}
                  placeholder="Congratulations {company_name}! Your company has been approved..."
                />
              </Form.Item>

              <Divider orientation="left">Company Rejection Email</Divider>
              <Form.Item
                name={['rejection', 'subject']}
                label="Subject"
              >
                <Input placeholder="Update on your company registration" />
              </Form.Item>
              <Form.Item
                name={['rejection', 'body']}
                label="Body"
              >
                <TextArea
                  rows={6}
                  placeholder="Dear {company_name}, We regret to inform you..."
                />
              </Form.Item>

              <Divider />
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Save Email Templates
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        {/* Pricing Tiers */}
        <TabPane
          tab={
            <span>
              <DollarOutlined />
              Pricing
            </span>
          }
          key="pricing"
        >
          <Card title="Pricing Tiers" loading={loading}>
            {settings?.pricing_tiers && (
              <Row gutter={[16, 16]}>
                {settings.pricing_tiers.map((tier, index) => (
                  <Col xs={24} sm={12} md={6} key={index}>
                    <Card
                      title={tier.name}
                      bordered
                      style={{
                        textAlign: 'center',
                        borderColor: tier.name === 'Professional' ? '#1890ff' : undefined
                      }}
                    >
                      <Title level={2} style={{ margin: 0 }}>
                        ${tier.price}
                        <Text type="secondary" style={{ fontSize: 14 }}>/month</Text>
                      </Title>
                      <Divider />
                      <Space direction="vertical" size="small" style={{ textAlign: 'left' }}>
                        <div>
                          <Text strong>Max Users:</Text> {tier.max_users}
                        </div>
                        <div>
                          <Text strong>Max Products:</Text> {tier.max_products}
                        </div>
                        <div>
                          <Text strong>Storage:</Text> {tier.storage_gb} GB
                        </div>
                        <div>
                          <Text strong>Features:</Text>
                          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                            {tier.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SuperAdminSettings;
