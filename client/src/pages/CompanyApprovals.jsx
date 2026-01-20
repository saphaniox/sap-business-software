import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, message, Modal, Input, 
  Typography, Descriptions, Badge, Tooltip, Empty 
} from 'antd';
import { 
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined,
  ReloadOutlined, ShopOutlined, UserOutlined, MailOutlined, CalendarOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';
import api from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

function CompanyApprovals() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get('/superadmin/pending-companies');
      if (response.data.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching pending companies:', error);
      message.error('Failed to load pending companies');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (company) => {
    setSelectedCompany(company);
    setApprovalNotes('');
    setApproveModalVisible(true);
  };

  const handleReject = (company) => {
    setSelectedCompany(company);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const confirmApprove = async () => {
    if (!selectedCompany) return;

    setActionLoading(true);
    try {
      const response = await api.post(
        `/superadmin/companies/${selectedCompany._id}/approve`,
        { notes: approvalNotes }
      );

      if (response.data.success) {
        message.success(`${selectedCompany.company_name} has been approved!`);
        setApproveModalVisible(false);
        fetchPendingCompanies();
      }
    } catch (error) {
      console.error('Error approving company:', error);
      message.error('Failed to approve company');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedCompany || !rejectionReason.trim()) {
      message.warning('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await api.post(
        `/superadmin/companies/${selectedCompany._id}/reject`,
        { reason: rejectionReason }
      );

      if (response.data.success) {
        message.success(`${selectedCompany.company_name} registration has been rejected`);
        setRejectModalVisible(false);
        fetchPendingCompanies();
      }
    } catch (error) {
      console.error('Error rejecting company:', error);
      message.error('Failed to reject company');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Business Name',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: '15px' }}>
            <ShopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            {text}
          </Text>
          <br />
          <Tag color="blue" style={{ marginTop: '4px' }}>
            {record.business_type || 'General'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Admin Details',
      key: 'admin',
      render: (_, record) => (
        <div>
          {record.adminUser ? (
            <>
              <Text>
                <UserOutlined style={{ marginRight: '6px', color: '#52c41a' }} />
                {record.adminUser.username}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '13px' }}>
                <MailOutlined style={{ marginRight: '6px' }} />
                {record.adminUser.email}
              </Text>
            </>
          ) : (
            <Text type="secondary">No admin found</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          {record.email && (
            <>
              <Text style={{ fontSize: '13px' }}>
                <MailOutlined style={{ marginRight: '6px' }} />
                {record.email}
              </Text>
              <br />
            </>
          )}
          {record.phone && (
            <Text style={{ fontSize: '13px' }}>
              <PhoneOutlined style={{ marginRight: '6px' }} />
              {record.phone}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'approval_requested_at',
      key: 'approval_requested_at',
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <Text>
            <CalendarOutlined style={{ marginRight: '6px' }} />
            {new Date(date).toLocaleDateString()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag icon={<ClockCircleOutlined />} color="orange">
          {status === 'pending_approval' ? 'Pending' : status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Approve this business">
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
              size="small"
            >
              Approve
            </Button>
          </Tooltip>
          <Tooltip title="Reject this registration">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record)}
              size="small"
            >
              Reject
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Business Approvals
          </Title>
          <Text type="secondary">
            Review and approve pending business registrations
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchPendingCompanies}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: '24px' }}>
        <Badge count={companies.length} showZero>
          <Card size="small" style={{ display: 'inline-block' }}>
            <Text strong>Pending Approvals: {companies.length}</Text>
          </Card>
        </Badge>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={companies}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No pending approvals"
              >
                <Text type="secondary">
                  All business registrations have been processed
                </Text>
              </Empty>
            ),
          }}
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
            <span>Approve Business Registration</span>
          </Space>
        }
        open={approveModalVisible}
        onOk={confirmApprove}
        onCancel={() => setApproveModalVisible(false)}
        confirmLoading={actionLoading}
        okText="Approve"
        okButtonProps={{ icon: <CheckCircleOutlined /> }}
        width={600}
      >
        {selectedCompany && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Business Name">
                {selectedCompany.company_name}
              </Descriptions.Item>
              <Descriptions.Item label="Business Type">
                {selectedCompany.business_type || 'General'}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Username">
                {selectedCompany.adminUser?.username || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Email">
                {selectedCompany.adminUser?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Email">
                {selectedCompany.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedCompany.phone || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: '8px' }}>
              <Text strong>Approval Notes (Optional):</Text>
            </div>
            <TextArea
              rows={3}
              placeholder="Add any notes about this approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
            />
            
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: '4px'
            }}>
              <Text style={{ color: '#52c41a' }}>
                ✓ Once approved, the business will have full access to the platform
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <span>Reject Business Registration</span>
          </Space>
        }
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={actionLoading}
        okText="Reject"
        okButtonProps={{ danger: true, icon: <CloseCircleOutlined /> }}
        width={600}
      >
        {selectedCompany && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="Business Name">
                {selectedCompany.company_name}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Username">
                {selectedCompany.adminUser?.username || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Admin Email">
                {selectedCompany.adminUser?.email || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: '8px' }}>
              <Text strong style={{ color: '#ff4d4f' }}>Reason for Rejection (Required):</Text>
            </div>
            <TextArea
              rows={4}
              placeholder="Please provide a clear reason for rejecting this registration..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              status={rejectionReason.trim() ? '' : 'error'}
            />
            
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: '#fff2e8', 
              border: '1px solid #ffbb96',
              borderRadius: '4px'
            }}>
              <Text style={{ color: '#ff4d4f' }}>
                ⚠️ The admin will be notified about the rejection with your reason
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CompanyApprovals;
