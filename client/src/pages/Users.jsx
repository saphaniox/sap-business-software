import React, { useEffect, useState } from 'react'
import { Table, Select, message, Space, Spin, Tag, Empty, Card, Typography, Button, Tooltip, Modal, Input, Form, Checkbox, Divider, Alert } from 'antd'
import { UserOutlined, CrownOutlined, TeamOutlined, EyeOutlined, DeleteOutlined, KeyOutlined, PlusOutlined, SafetyCertificateOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { usersAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import PageHeader from '../components/PageHeader'
import BackToTop from '../components/BackToTop'

const { Option } = Select
const { Text } = Typography

function Users() {
  const { user } = useAuthStore()
  const [userList, setUserList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false)
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [passwordForm] = Form.useForm()
  const [createUserForm] = Form.useForm()
  const [permissionsForm] = Form.useForm()

  useEffect(() => {
    fetchAllUsers()
  }, [])

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      setIsLoading(true)
      const response = await usersAPI.getAll()
      setUserList(response.data || [])
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to fetch users')
      setUserList([])
    } finally {
      setIsLoading(false)
    }
  }

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.updateRole(userId, newRole)
      message.success('User role updated successfully')
      fetchAllUsers() // Refresh the list
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update user role')
    }
  }

  // Delete user (admin only)
  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: 'Delete User Account',
      content: 'Are you sure you want to permanently delete this user account? This action cannot be undone and will remove all their data.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No, Cancel',
      onOk: async () => {
        try {
          await usersAPI.delete(userId)
          message.success('🗑️ User account deleted successfully')
          fetchAllUsers()
        } catch (error) {
          message.error(error.response?.data?.error || 'Unable to delete user. They may have existing records in the system.')
        }
      }
    })
  }

  // Show change password modal
  const showChangePasswordModal = (userData) => {
    // Check if this is the test account
    if (user?.email === 'test@sbms.com') {
      message.warning('Password changes are disabled for the test account. This is a shared demo account used by many visitors.')
      return
    }
    
    setSelectedUser(userData)
    passwordForm.resetFields()
    setPasswordModalVisible(true)
  }

  // Handle password change
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      await usersAPI.changePassword(selectedUser.id, values.newPassword)
      message.success(`Password updated successfully for ${selectedUser.username}`)
      setPasswordModalVisible(false)
      passwordForm.resetFields()
      setSelectedUser(null)
    } catch (error) {
      if (error.response) {
        message.error(error.response?.data?.error || 'Failed to change password')
      }
      // If validation error, don't close modal
    }
  }

  // Show create user modal
  const showCreateUserModal = () => {
    createUserForm.resetFields()
    setCreateUserModalVisible(true)
  }

  // Show permissions modal
  const showPermissionsModal = (userData) => {
    setSelectedUser(userData)
    permissionsForm.setFieldsValue({
      canAddProducts: userData.permissions?.canAddProducts ?? true,
      canEditProducts: userData.permissions?.canEditProducts ?? true,
      canDeleteProducts: userData.permissions?.canDeleteProducts ?? (userData.role === 'admin'),
      canAddSales: userData.permissions?.canAddSales ?? true,
      canEditSales: userData.permissions?.canEditSales ?? true,
      canDeleteSales: userData.permissions?.canDeleteSales ?? (userData.role === 'admin'),
      canAddInvoices: userData.permissions?.canAddInvoices ?? true,
      canEditInvoices: userData.permissions?.canEditInvoices ?? true,
      canDeleteInvoices: userData.permissions?.canDeleteInvoices ?? (userData.role === 'admin'),
      canAddCustomers: userData.permissions?.canAddCustomers ?? true,
      canEditCustomers: userData.permissions?.canEditCustomers ?? true,
      canDeleteCustomers: userData.permissions?.canDeleteCustomers ?? (userData.role === 'admin'),
      canViewReports: userData.permissions?.canViewReports ?? true,
      canManageUsers: userData.permissions?.canManageUsers ?? (userData.role === 'admin'),
      canAccessCompanySettings: userData.permissions?.canAccessCompanySettings ?? (userData.role === 'admin' || userData.is_company_admin === true),
    })
    setPermissionsModalVisible(true)
  }

  // Handle permissions update
  const handleUpdatePermissions = async () => {
    try {
      const permissions = await permissionsForm.validateFields()
      await usersAPI.updatePermissions(selectedUser.id, permissions)
      message.success(`Permissions updated for ${selectedUser.username}`)
      setPermissionsModalVisible(false)
      fetchAllUsers()
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to update permissions')
    }
  }

  // Handle create user
  const handleCreateUser = async () => {
    try {
      const values = await createUserForm.validateFields()
      await usersAPI.create(values)
      message.success(`User ${values.username} created successfully`)
      setCreateUserModalVisible(false)
      createUserForm.resetFields()
      fetchAllUsers()
    } catch (error) {
      if (error.response) {
        message.error(error.response?.data?.error || 'Failed to create user')
      }
    }
  }

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <CrownOutlined />
      case 'manager':
        return <TeamOutlined />
      case 'sales':
        return <UserOutlined />
      default:
        return <UserOutlined />
    }
  }

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red'
      case 'manager':
        return 'blue'
      case 'sales':
        return 'green'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '25%',
      render: (text, record) => (
        <Space>
          {getRoleIcon(record.role)}
          <Text strong>{text}</Text>
          {record.id === user?.id && <Tag color="cyan">You</Tag>}
          {record.is_company_admin === true && <Tag color="gold" icon={<CrownOutlined />}>Owner</Tag>}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '20%',
      render: (role) => (
        <Tag icon={getRoleIcon(role)} color={getRoleColor(role)}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Change Role',
      key: 'action',
      width: '25%',
      render: (_, record) => (
        <Select
          value={record.role}
          style={{ width: 150 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          disabled={record.id === user?.id || record.is_company_admin === true} // Prevent self-role change and primary admin changes
        >
          <Option value="admin">
            <Space>
              <CrownOutlined />
              Admin
            </Space>
          </Option>
          <Option value="manager">
            <Space>
              <TeamOutlined />
              Manager
            </Space>
          </Option>
          <Option value="sales">
            <Space>
              <UserOutlined />
              Sales
            </Space>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '30%',
      render: (_, record) => (
        <Space wrap>
          {user?.role === 'admin' && (
            <Tooltip title="Manage Permissions">
              <Button
                icon={<SafetyCertificateOutlined />}
                onClick={() => showPermissionsModal(record)}
              >
                Permissions
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Change Password">
            <Button
              type="primary"
              icon={<KeyOutlined />}
              onClick={() => showChangePasswordModal(record)}
            >
              Password
            </Button>
          </Tooltip>
          <Tooltip title={record.id === user?.id ? 'Cannot delete yourself' : record.is_company_admin === true ? 'Cannot delete company owner' : 'Delete User'}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(record.id)}
              disabled={record.id === user?.id || record.is_company_admin === true}
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader />
      <div style={{ flex: 1, padding: '24px' }}>
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>User Management</h2>
              <Text type="secondary">Create and manage user accounts and permissions</Text>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showCreateUserModal}
              size="large"
            >
              Create New User
            </Button>
          </div>

          <Alert
            message="Admin Controls User Permissions"
            description={
              <div>
                <Text>As an <Tag color="red" icon={<CrownOutlined />}>ADMIN</Tag>, you have full control over user permissions. You can:</Text>
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>✓ Assign roles (Admin, Manager, Sales) to control feature access</li>
                  <li>✓ Set custom permissions for each user (add, edit, delete)</li>
                  <li>✓ Grant or revoke access to specific features like reports, user management, and settings</li>
                  <li>✓ Change user passwords and delete user accounts</li>
                </ul>
                <Text strong style={{ display: 'block', marginTop: 8 }}>Note: The system does not set default permissions. You control what each user can do.</Text>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: '16px' }}
          />

          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
            <Text strong>Role Guidelines (Permissions controlled by Admin):</Text>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li><Tag color="red" icon={<CrownOutlined />}>ADMIN</Tag> - Typically given full access to all features including user management and business settings</li>
              <li><Tag color="blue" icon={<TeamOutlined />}>MANAGER</Tag> - Usually can manage products, customers, sales, and view reports (Admin decides specific permissions)</li>
              <li><Tag color="green" icon={<UserOutlined />}>SALES</Tag> - Often can create sales orders and generate invoices (Admin decides what they can access)</li>
            </ul>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>💡 Tip: Use the "Manage Permissions" button to customize exactly what each user can do.</Text>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={userList}
              rowKey="id"
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    description="No users found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          )}
        </Card>

        {/* Change Password Modal */}
        <Modal
          title={`Change Password - ${selectedUser?.username}`}
          open={passwordModalVisible}
          onOk={handleChangePassword}
          onCancel={() => {
            setPasswordModalVisible(false)
            passwordForm.resetFields()
            setSelectedUser(null)
          }}
          okText="Change Password"
          cancelText="Cancel"
        >
          <Form
            form={passwordForm}
            layout="vertical"
          >
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password 
                placeholder="Enter new password (min 6 characters)"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>
    </Modal>

        {/* Create User Modal */}
        <Modal
          title="Create New User"
          open={createUserModalVisible}
          onOk={handleCreateUser}
          onCancel={() => {
            setCreateUserModalVisible(false)
            createUserForm.resetFields()
          }}
          okText="Create User"
          cancelText="Cancel"
          width={600}
        >
          <Form
            form={createUserForm}
            layout="vertical"
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Please enter username' },
                { min: 3, message: 'Username must be at least 3 characters' }
              ]}
            >
              <Input 
                placeholder="Enter username"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input 
                placeholder="Enter email address"
                type="email"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password 
                placeholder="Enter password (min 6 characters)"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              initialValue="sales"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select placeholder="Select user role">
                <Option value="admin">
                  <Space>
                    <CrownOutlined />
                    <span>Admin - Full access to all features</span>
                  </Space>
                </Option>
                <Option value="manager">
                  <Space>
                    <TeamOutlined />
                    <span>Manager - Manage products, customers, sales</span>
                  </Space>
                </Option>
                <Option value="sales">
                  <Space>
                    <UserOutlined />
                    <span>Sales - Create orders and invoices</span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Permissions Modal */}
        <Modal
          title={
            <Space>
              <SafetyCertificateOutlined />
              <span>Manage Permissions - {selectedUser?.username}</span>
            </Space>
          }
          open={permissionsModalVisible}
          onOk={handleUpdatePermissions}
          onCancel={() => {
            setPermissionsModalVisible(false)
            setSelectedUser(null)
          }}
          okText="Save Permissions"
          cancelText="Cancel"
          width={700}
        >
          <Form
            form={permissionsForm}
            layout="vertical"
          >
            <Divider orientation="left">Products Management</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="canAddProducts" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Add Products</Checkbox>
              </Form.Item>
              <Form.Item name="canEditProducts" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Edit Products</Checkbox>
              </Form.Item>
              <Form.Item name="canDeleteProducts" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Delete Products</Checkbox>
              </Form.Item>
            </Space>

            <Divider orientation="left">Sales Management</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="canAddSales" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Add Sales Orders</Checkbox>
              </Form.Item>
              <Form.Item name="canEditSales" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Edit Sales Orders</Checkbox>
              </Form.Item>
              <Form.Item name="canDeleteSales" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Delete Sales Orders</Checkbox>
              </Form.Item>
            </Space>

            <Divider orientation="left">Invoices Management</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="canAddInvoices" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Add Invoices</Checkbox>
              </Form.Item>
              <Form.Item name="canEditInvoices" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Edit Invoices</Checkbox>
              </Form.Item>
              <Form.Item name="canDeleteInvoices" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Delete Invoices</Checkbox>
              </Form.Item>
            </Space>

            <Divider orientation="left">Customers Management</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="canAddCustomers" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Add Customers</Checkbox>
              </Form.Item>
              <Form.Item name="canEditCustomers" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Edit Customers</Checkbox>
              </Form.Item>
              <Form.Item name="canDeleteCustomers" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Delete Customers</Checkbox>
              </Form.Item>
            </Space>

            <Divider orientation="left">Other Permissions</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="canViewReports" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can View Reports & Analytics</Checkbox>
              </Form.Item>
              <Form.Item name="canManageUsers" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Manage Users</Checkbox>
              </Form.Item>
              <Form.Item name="canAccessCompanySettings" valuePropName="checked" style={{ marginBottom: 8 }}>
                <Checkbox>Can Access Business Settings</Checkbox>
              </Form.Item>
            </Space>
          </Form>
        </Modal>

    <BackToTop />
  </div>
</div>
)
}

export default Users