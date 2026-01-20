import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, Select, Space, Spin, message, Badge, Collapse, Button, Modal, Tooltip } from 'antd';
import { UserOutlined, SearchOutlined, TeamOutlined, ShopOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const AllUsersManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersByCompany, setUsersByCompany] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [stats, setStats] = useState({ totalUsers: 0, totalBusinesses: 0 });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, filterCompany, filterRole]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/superadmin/all-users');

      if (response.data.success) {
        setUsers(response.data.users);
        setUsersByCompany(response.data.usersByCompany);
        setStats({
          totalUsers: response.data.totalUsers,
          totalBusinesses: response.data.totalBusinesses
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.company.name.toLowerCase().includes(search)
      );
    }

    // Company filter
    if (filterCompany !== 'all') {
      filtered = filtered.filter(user => user.company.name === filterCompany);
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      manager: 'orange',
      sales: 'blue'
    };
    return colors[role] || 'default';
  };

  const getCompanyStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending_approval: 'warning',
      rejected: 'error',
      inactive: 'default'
    };
    return colors[status] || 'default';
  };

  const handleDeleteUser = async (user) => {
    Modal.confirm({
      title: 'Delete User - PERMANENT ACTION',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p><strong>WARNING:</strong> This will permanently delete user:</p>
          <ul>
            <li>Username: <strong>{user.username}</strong></li>
            <li>Email: <strong>{user.email}</strong></li>
            <li>Business: <strong>{user.company.name}</strong></li>
          </ul>
          <p style={{ color: '#ff4d4f', marginTop: 16 }}>
            <strong>This action CANNOT be undone!</strong>
          </p>
          <Input 
            placeholder='Type "DELETE" to confirm'
            onChange={(e) => {
              const btn = document.querySelector('.ant-modal-confirm-btns .ant-btn-primary');
              if (btn) {
                btn.disabled = e.target.value !== 'DELETE';
              }
            }}
          />
        </div>
      ),
      okText: 'Delete Permanently',
      okType: 'danger',
      okButtonProps: { disabled: true },
      cancelText: 'Cancel',
      onOk: async () => {
        const input = document.querySelector('.ant-modal-confirm .ant-input');
        const confirmationText = input?.value;
        
        if (confirmationText !== 'DELETE') {
          message.error('Please type DELETE to confirm');
          return Promise.reject();
        }

        try {
          await api.delete(`/superadmin/users/${user.id}`, {
            data: { 
              confirmationText,
              reason: 'Deleted by super admin'
            }
          });
          message.success('User permanently deleted');
          fetchAllUsers();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete user');
          throw error;
        }
      }
    });
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <span style={{ fontWeight: record.is_company_admin ? 'bold' : 'normal' }}>
            {text}
            {record.is_company_admin && <Tag color="gold" style={{ marginLeft: 8 }}>Business Admin</Tag>}
          </span>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email)
    },
    {
      title: 'Business',
      dataIndex: ['company', 'name'],
      key: 'company',
      sorter: (a, b) => a.company.name.localeCompare(b.company.name),
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <span style={{ fontWeight: 500 }}>{text}</span>
          <Space size="small">
            <Tag color={getCompanyStatusColor(record.company.status)}>
              {record.company.status}
            </Tag>
            <Tag>{record.company.business_type}</Tag>
          </Space>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="Permanently delete user">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record)}
          >
            Delete
          </Button>
        </Tooltip>
      )
    }
  ];

  // Get unique company names for filter
  const companyNames = [...new Set(users.map(u => u.company.name))].sort();

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>All Users Management</span>
          </Space>
        }
        extra={
          <Space>
            <Badge count={stats.totalUsers} showZero style={{ backgroundColor: '#52c41a' }}>
              <TeamOutlined style={{ fontSize: '24px', color: '#666' }} />
            </Badge>
            <Badge count={stats.totalBusinesses} showZero style={{ backgroundColor: '#1890ff' }}>
              <ShopOutlined style={{ fontSize: '24px', color: '#666' }} />
            </Badge>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters */}
          <Space wrap>
            <Search
              placeholder="Search by username, email, or business"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Business"
              value={filterCompany}
              onChange={setFilterCompany}
            >
              <Option value="all">All Businesses</Option>
              {companyNames.map(name => (
                <Option key={name} value={name}>{name}</Option>
              ))}
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Filter by Role"
              value={filterRole}
              onChange={setFilterRole}
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="manager">Manager</Option>
              <Option value="sales">Sales</Option>
            </Select>
          </Space>

          {/* Stats */}
          <div style={{ 
            padding: '16px', 
            background: '#f0f2f5', 
            borderRadius: '8px',
            display: 'flex',
            gap: '24px'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {filteredUsers.length}
              </div>
              <div style={{ color: '#666' }}>Users Displayed</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {stats.totalUsers}
              </div>
              <div style={{ color: '#666' }}>Total Users</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                {stats.totalBusinesses}
              </div>
              <div style={{ color: '#666' }}>Total Businesses</div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Table
                dataSource={filteredUsers}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} users`
                }}
                scroll={{ x: 800 }}
              />

              {/* Grouped by Company View */}
              <Card title="Users Grouped by Business" style={{ marginTop: '24px' }}>
                <Collapse accordion>
                  {usersByCompany
                    .filter(group => {
                      if (filterCompany !== 'all') {
                        return group.company.name === filterCompany;
                      }
                      return true;
                    })
                    .map((group) => (
                      <Panel
                        header={
                          <Space>
                            <ShopOutlined />
                            <strong>{group.company.name}</strong>
                            <Tag color={getCompanyStatusColor(group.company.status)}>
                              {group.company.status}
                            </Tag>
                            <Badge count={group.users.length} style={{ backgroundColor: '#1890ff' }} />
                          </Space>
                        }
                        key={group.company.id}
                      >
                        <Table
                          dataSource={group.users}
                          columns={columns.filter(col => col.key !== 'company')}
                          rowKey="id"
                          pagination={false}
                          size="small"
                        />
                      </Panel>
                    ))}
                </Collapse>
              </Card>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AllUsersManagement;
