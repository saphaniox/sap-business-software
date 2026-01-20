import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Spin, 
  Typography, 
  Descriptions,
  Tag,
  Divider,
  Upload,
  Image,
  Space,
  Alert,
  Select
} from 'antd'
import { 
  ShopOutlined, 
  MailOutlined, 
  PhoneOutlined,
  DatabaseOutlined,
  SaveOutlined,
  UploadOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  LockOutlined
} from '@ant-design/icons'
import BackToTop from '../components/BackToTop'
import { companyAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useAutoDismissAlert } from '../hooks/useAutoDismissAlert'

const { Content } = Layout
const { Title, Text } = Typography
const { TextArea } = Input

function CompanySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [company, setCompany] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [form] = Form.useForm()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [alertVisible, setAlertVisible] = useAutoDismissAlert(15000)

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      const response = await companyAPI.getMyCompany()
      const companyData = response.data.company
      setCompany(companyData)
      
      // Set logo URL if exists
      if (companyData.logo) {
        setLogoUrl(`https://sap-business-management-software.koyeb.app/uploads/company-logos/${companyData.logo}`)
      }
      
      form.setFieldsValue({
        business_type: companyData.business_type,
        currency: companyData.currency || 'UGX',
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address || '',
        city: companyData.city || '',
        country: companyData.country || 'Uganda',
        website: companyData.website || '',
        alternate_phone: companyData.alternate_phone || '',
        tax_id: companyData.tax_id || ''
      })
    } catch (error) {
      message.error('Failed to load company details')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true)
      return
    }
    
    if (info.file.status === 'done') {
      setUploading(false)
      message.success('Logo uploaded successfully!')
      loadCompanyData() // Reload to get new logo
    } else if (info.file.status === 'error') {
      setUploading(false)
      message.error('Logo upload failed')
    }
  }

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return false
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
      return false
    }
    
    return true
  }

  const onFinish = async (values) => {
    setSaving(true)
    try {
      await companyAPI.updateCompany(values)
      message.success('Business settings updated successfully')
      loadCompanyData()
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update business settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    )
  }

  // Only company admins can access this page
  const canAccessSettings = user?.is_company_admin || 
                           user?.role === 'admin' || 
                           user?.permissions?.canAccessCompanySettings;
  
  if (!canAccessSettings) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '24px' }}>
        <Content>
          <Card>
            <Title level={4}>🔒 Access Denied</Title>
            <Text type="secondary">Only business administrators can access business settings.</Text>
            <br /><br />
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <Content style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Card>
          <Title level={2}>
            <ShopOutlined /> Business Settings
          </Title>
          
          {company && (
            <>
              {/* Data Isolation Notice */}
              {alertVisible && (
                <Alert
                  message="🔒 Your Business Data is Completely Isolated & Secure"
                  description={
                    <div>
                      <p style={{ marginBottom: '8px' }}>
                        <strong>Complete Privacy:</strong> Your business operates in a dedicated, private database 
                        (<Text code>{company.database_name || 'tenant_' + company._id}</Text>) that no other business can access.
                      </p>
                      <p style={{ marginBottom: '0' }}>
                        <strong>Zero Data Sharing:</strong> All your products, customers, sales, invoices, expenses, 
                        and financial records are completely isolated and private to your business only. 
                        No cross-business access is possible.
                      </p>
                    </div>
                  }
                  type="success"
                  showIcon
                  icon={<LockOutlined />}
                  style={{ marginBottom: '24px', marginTop: '16px' }}
                  closable
                  onClose={() => setAlertVisible(false)}
                />
              )}
              
              <Divider />
              
              {/* Company Overview */}
              <Card type="inner" title="Company Overview" style={{ marginBottom: '24px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Company Name">
                    <strong>{company.company_name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={company.status === 'active' ? 'green' : 'red'}>
                      {company.status?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Database Type">
                    <Tag icon={<DatabaseOutlined />} color="blue">
                      {company.database_type?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Database Name">
                    <Text code>{company.database_name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Subscription Tier">
                    <Tag color="purple">{company.subscription_tier?.toUpperCase()}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">
                    {new Date(company.created_at).toLocaleDateString()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Editable Company Information */}
              <Card type="inner" title="Company Logo" style={{ marginBottom: '24px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {logoUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <Image
                        src={logoUrl}
                        alt="Company Logo"
                        style={{ maxHeight: '150px', objectFit: 'contain' }}
                        fallback="data:image/png;base64,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"
                      />
                    </div>
                  )}
                  
                  <Upload
                    name="logo"
                    listType="picture"
                    maxCount={1}
                    action={`https://sap-business-management-software.koyeb.app/api/company/logo`}
                    headers={{
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                    }}
                    beforeUpload={beforeUpload}
                    onChange={handleLogoUpload}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading} size="large">
                      {logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                  </Upload>
                  
                  <Alert
                    message="Logo will appear on all documents, invoices, and orders"
                    description="Recommended size: 200x200px. Maximum file size: 2MB. Formats: JPG, PNG"
                    type="info"
                    showIcon
                    icon={<PictureOutlined />}
                  />
                </Space>
              </Card>

              {/* Editable Company Information */}
              <Card type="inner" title="Company Information">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                >
                  <Form.Item
                    label="Business Type"
                    name="business_type"
                  >
                    <Input 
                      prefix={<ShopOutlined />} 
                      placeholder="e.g., Retail, Wholesale, Services"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Local Currency"
                    name="currency"
                    rules={[
                      { required: true, message: 'Please select your local currency' }
                    ]}
                    extra="This currency will be used throughout your system for all transactions and reports"
                  >
                    <Select 
                      placeholder="Select your local currency"
                      size="large"
                      showSearch
                      optionFilterProp="children"
                    >
                      <Select.Option value="UGX">🇺🇬 UGX - Ugandan Shilling</Select.Option>
                      <Select.Option value="USD">🇺🇸 USD - US Dollar</Select.Option>
                      <Select.Option value="EUR">🇪🇺 EUR - Euro</Select.Option>
                      <Select.Option value="GBP">🇬🇧 GBP - British Pound</Select.Option>
                      <Select.Option value="KES">🇰🇪 KES - Kenyan Shilling</Select.Option>
                      <Select.Option value="TZS">🇹🇿 TZS - Tanzanian Shilling</Select.Option>
                      <Select.Option value="RWF">🇷🇼 RWF - Rwandan Franc</Select.Option>
                      <Select.Option value="ZAR">🇿🇦 ZAR - South African Rand</Select.Option>
                      <Select.Option value="NGN">🇳🇬 NGN - Nigerian Naira</Select.Option>
                      <Select.Option value="GHS">🇬🇭 GHS - Ghanaian Cedi</Select.Option>
                      <Select.Option value="INR">🇮🇳 INR - Indian Rupee</Select.Option>
                      <Select.Option value="AED">🇦🇪 AED - UAE Dirham</Select.Option>
                      <Select.Option value="SAR">🇸🇦 SAR - Saudi Riyal</Select.Option>
                      <Select.Option value="CNY">🇨🇳 CNY - Chinese Yuan</Select.Option>
                      <Select.Option value="JPY">🇯🇵 JPY - Japanese Yen</Select.Option>
                    </Select>
                  </Form.Item>

                  <Divider plain>Contact Information</Divider>

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
                    label="Primary Phone"
                    name="phone"
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="+256 700 000 000"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Alternate Phone"
                    name="alternate_phone"
                  >
                    <Input 
                      prefix={<PhoneOutlined />} 
                      placeholder="+256 700 000 000"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Website"
                    name="website"
                  >
                    <Input 
                      prefix={<GlobalOutlined />} 
                      placeholder="https://yourcompany.com"
                      size="large"
                    />
                  </Form.Item>

                  <Divider plain>Location</Divider>

                  <Form.Item
                    label="Physical Address"
                    name="address"
                  >
                    <TextArea
                      prefix={<EnvironmentOutlined />} 
                      placeholder="Street address, Building, Plot number"
                      rows={3}
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="City"
                    name="city"
                  >
                    <Input 
                      prefix={<EnvironmentOutlined />} 
                      placeholder="Kampala"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Country"
                    name="country"
                  >
                    <Input 
                      prefix={<GlobalOutlined />} 
                      placeholder="Uganda"
                      size="large"
                    />
                  </Form.Item>

                  <Divider plain>Tax Information (Optional)</Divider>

                  <Form.Item
                    label="Tax ID / TIN"
                    name="tax_id"
                  >
                    <Input 
                      placeholder="Tax Identification Number"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      loading={saving}
                      size="large"
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </>
          )}
        </Card>
      </Content>
      <BackToTop />
    </Layout>
  )
}

export default CompanySettings
