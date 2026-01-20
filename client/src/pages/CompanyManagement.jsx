import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Input, Space, Spin, message, Button, Modal, Form, Select, Badge, Tooltip, Popconfirm } from 'antd';
import { SearchOutlined, ShopOutlined, LockOutlined, StopOutlined, CloseCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

const CompanyManagement = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionForm] = Form.useForm();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchText, filterStatus]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/superadmin/companies');

      if (response.data.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      message.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(company =>
        company.company_name.toLowerCase().includes(search) ||
        company.email?.toLowerCase().includes(search) ||
        company.business_type?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(company => company.status === filterStatus);
    }

    setFilteredCompanies(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending_approval: 'warning',
      rejected: 'default',
      blocked: 'error',
      suspended: 'orange',
      banned: 'red',
      inactive: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircleOutlined />,
      pending_approval: <ExclamationCircleOutlined />,
      blocked: <LockOutlined />,
      suspended: <StopOutlined />,
      banned: <CloseCircleOutlined />
    };
    return icons[status] || null;
  };

  const showActionModal = (company, action) => {
    setSelectedCompany(company);
    setActionType(action);
    actionForm.resetFields();
    setActionModalVisible(true);
  };

  const handleAction = async () => {
    try {
      const values = await actionForm.validateFields();
      const endpoint = `/superadmin/companies/${selectedCompany.id}/${actionType}`;
      
      await api.post(endpoint, values);

      message.success(`Company ${actionType}ed successfully`);
      setActionModalVisible(false);
      actionForm.resetFields();
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || `Failed to ${actionType} company`);
      }
    }
  };

  const handleDeleteCompany = async (company) => {
    Modal.confirm({
      title: 'Delete Company - PERMANENT ACTION',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p><strong>WARNING:</strong> This will permanently delete:</p>
          <ul>
            <li>Company: <strong>{company.company_name}</strong></li>
            <li>All users in this company</li>
            <li>All products, customers, sales, invoices</li>
            <li>All associated data</li>
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
          await api.delete(`/superadmin/companies/${company.id}`, {
            data: { 
              confirmationText,
              reason: 'Deleted by super admin'
            }
          });
          message.success('Company permanently deleted');
          fetchCompanies();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete company');
          throw error;
        }
      }
    });
  };

  const getActionModalTitle = () => {
    const titles = {
      block: 'Block Company',
      suspend: 'Suspend Company',
      ban: 'Ban Company (Permanent)',
      reactivate: 'Reactivate Company'
    };
    return titles[actionType] || 'Action';
  };

  const getActionButtonText = () => {
    const texts = {
      block: 'Block',
      suspend: 'Suspend',
      ban: 'Ban Permanently',
      reactivate: 'Reactivate'
    };
    return texts[actionType] || 'Confirm';
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
      sorter: (a, b) => a.company_name.localeCompare(b.company_name),
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <ShopOutlined />
            <span style={{ fontWeight: 500 }}>{text}</span>
          </Space>
          <span style={{ fontSize: '12px', color: '#666' }}>{record.business_type}</span>
        </Space>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span style={{ fontSize: '12px' }}>{record.email}</span>
          <span style={{ fontSize: '12px', color: '#666' }}>{record.phone}</span>
        </Space>
      )
    },
    {
      title: 'Users',
      dataIndex: 'user_count',
      key: 'user_count',
      sorter: (a, b) => a.user_count - b.user_count,
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: '#1890ff' }} />
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.toUpperCase().replace('_', ' ')}
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
        <Space wrap>
          {record.status === 'active' && (
            <>
              <Tooltip title="Block company access">
                <Button
                  size="small"
                  icon={<LockOutlined />}
                  onClick={() => showActionModal(record, 'block')}
                >
                  Block
                </Button>
              </Tooltip>
              <Tooltip title="Temporarily suspend">
                <Button
                  size="small"
                  icon={<StopOutlined />}
                  onClick={() => showActionModal(record, 'suspend')}
                >
                  Suspend
                </Button>
              </Tooltip>
              <Tooltip title="Permanent ban">
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => showActionModal(record, 'ban')}
                >
                  Ban
                </Button>
              </Tooltip>
            </>
          )}
          {['blocked', 'suspended', 'banned'].includes(record.status) && (
            <Tooltip title="Restore company access">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => showActionModal(record, 'reactivate')}
              >
                Reactivate
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Permanently delete company and all data">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCompany(record)}
            >
              Delete
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const statusCounts = {
    all: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    blocked: companies.filter(c => c.status === 'blocked').length,
    suspended: companies.filter(c => c.status === 'suspended').length,
    banned: companies.filter(c => c.status === 'banned').length,
    pending_approval: companies.filter(c => c.status === 'pending_approval').length
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <ShopOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Company Management</span>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Filters */}
          <Space wrap>
            <Search
              placeholder="Search by company name, email, or type"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 350 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              style={{ width: 180 }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">All Status ({statusCounts.all})</Option>
              <Option value="active">Active ({statusCounts.active})</Option>
              <Option value="pending_approval">Pending ({statusCounts.pending_approval})</Option>
              <Option value="blocked">Blocked ({statusCounts.blocked})</Option>
              <Option value="suspended">Suspended ({statusCounts.suspended})</Option>
              <Option value="banned">Banned ({statusCounts.banned})</Option>
            </Select>
          </Space>

          {/* Statistics */}
          <div style={{ 
            padding: '16px', 
            background: '#f0f2f5', 
            borderRadius: '8px',
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {statusCounts.active}
              </div>
              <div style={{ color: '#666' }}>Active</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                {statusCounts.blocked}
              </div>
              <div style={{ color: '#666' }}>Blocked</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {statusCounts.suspended}
              </div>
              <div style={{ color: '#666' }}>Suspended</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#cf1322' }}>
                {statusCounts.banned}
              </div>
              <div style={{ color: '#666' }}>Banned</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {filteredCompanies.length}
              </div>
              <div style={{ color: '#666' }}>Displayed</div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={filteredCompanies}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} companies`
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Space>
      </Card>

      {/* Action Modal */}
      <Modal
        title={getActionModalTitle()}
        open={actionModalVisible}
        onOk={handleAction}
        onCancel={() => {
          setActionModalVisible(false);
          actionForm.resetFields();
          setSelectedCompany(null);
        }}
        okText={getActionButtonText()}
        okButtonProps={{ danger: actionType === 'ban' }}
        cancelText="Cancel"
      >
        <Form form={actionForm} layout="vertical">
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
            <strong>Company:</strong> {selectedCompany?.company_name}<br />
            <strong>Current Status:</strong> <Tag color={getStatusColor(selectedCompany?.status)}>
              {selectedCompany?.status?.toUpperCase().replace('_', ' ')}
            </Tag>
          </div>

          {actionType === 'suspend' && (
            <Form.Item
              label="Suspension Duration (days)"
              name="duration"
              rules={[{ required: false }]}
              tooltip="Leave empty for indefinite suspension"
            >
              <Input 
                type="number" 
                placeholder="Enter number of days (optional)"
                min={1}
              />
            </Form.Item>
          )}

          {actionType !== 'reactivate' && (
            <Form.Item
              label="Reason"
              name="reason"
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <TextArea 
                rows={4}
                placeholder={`Explain why you are ${actionType}ing this company...`}
              />
            </Form.Item>
          )}

          {actionType === 'reactivate' && (
            <Form.Item
              label="Notes (optional)"
              name="notes"
            >
              <TextArea 
                rows={3}
                placeholder="Add any notes about the reactivation..."
              />
            </Form.Item>
          )}

          {actionType === 'ban' && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#fff2e8', border: '1px solid #ffbb96', borderRadius: '4px' }}>
              <strong style={{ color: '#cf1322' }}>⚠️ Warning:</strong> This action is permanent and cannot be undone. The company will be completely blocked from accessing the platform.
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyManagement;
