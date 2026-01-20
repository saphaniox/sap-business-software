import { Modal, Descriptions, Tag, Statistic, Row, Col, Card, Timeline, Table, Avatar, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  DollarOutlined, 
  ShoppingOutlined, 
  TeamOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useState, useEffect } from 'react';
import api from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const CompanyProfileModal = ({ visible, onClose, companyId }) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (visible && companyId) {
      fetchCompanyProfile();
    }
  }, [visible, companyId]);

  const fetchCompanyProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/superadmin/companies/${companyId}/profile`);
      if (response.data.success) {
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      blocked: 'error',
      inactive: 'default'
    };
    return colors[status] || 'default';
  };

  const getUserStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.profile_picture} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color="blue">{role}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getUserStatusColor(status)} icon={status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM D, YYYY')
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          <span>Company Profile</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      loading={loading}
    >
      {profileData && (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Company Details */}
          <Card title="Company Information" style={{ marginBottom: 16 }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Company Name">
                {profileData.company.company_name}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(profileData.company.status)}>
                  {profileData.company.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                {profileData.company.industry || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Number">
                {profileData.company.registration_number || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {profileData.company.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {profileData.company.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                {profileData.company.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Registered">
                {dayjs(profileData.company.created_at).format('MMMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(profileData.company.updated_at).fromNow()}
              </Descriptions.Item>
              <Descriptions.Item label="Database Size">
                {profileData.statistics.database_size}
              </Descriptions.Item>
              <Descriptions.Item label="Total Users">
                {profileData.users.length}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Statistics */}
          <Card title="Business Statistics" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <Statistic
                      title="Total Sales"
                      value={profileData.statistics.total_sales}
                      prefix={<DollarOutlined />}
                      valueRender={(value) => (
                        <CountUp end={parseFloat(value)} decimals={2} duration={2} />
                      )}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <Statistic
                      title="Total Profit"
                      value={profileData.statistics.total_profit}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                      valueRender={(value) => (
                        <CountUp end={parseFloat(value)} decimals={2} duration={2} />
                      )}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <Statistic
                      title="Total Expenses"
                      value={profileData.statistics.total_expenses}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                      valueRender={(value) => (
                        <CountUp end={parseFloat(value)} decimals={2} duration={2} />
                      )}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <Statistic
                      title="Total Products"
                      value={profileData.statistics.total_products}
                      prefix={<ShoppingOutlined />}
                      valueRender={(value) => (
                        <CountUp end={parseInt(value)} duration={2} />
                      )}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <Statistic
                      title="Total Customers"
                      value={profileData.statistics.total_customers}
                      prefix={<TeamOutlined />}
                      valueRender={(value) => (
                        <CountUp end={parseInt(value)} duration={2} />
                      )}
                    />
                  </Card>
                </motion.div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card>
                    <Statistic
                      title="Total Invoices"
                      value={profileData.statistics.total_invoices}
                      prefix={<FileTextOutlined />}
                      valueRender={(value) => (
                        <CountUp end={parseInt(value)} duration={2} />
                      )}
                    />
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Card>

          {/* Users Table */}
          <Card title={`Users (${profileData.users.length})`} style={{ marginBottom: 16 }}>
            <Table
              columns={userColumns}
              dataSource={profileData.users}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>

          {/* Recent Activity */}
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title="Recent Activity" style={{ marginBottom: 16 }}>
                <Timeline>
                  {profileData.recent_activity.slice(0, 5).map((activity, index) => (
                    <Timeline.Item
                      key={index}
                      color={activity.type === 'sale' ? 'green' : 'blue'}
                      dot={activity.type === 'sale' ? <DollarOutlined /> : <UserOutlined />}
                    >
                      <Text strong>{activity.description}</Text>
                      <br />
                      <Text type="secondary">
                        <ClockCircleOutlined /> {dayjs(activity.date).fromNow()}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
                {profileData.recent_activity.length === 0 && (
                  <Text type="secondary">No recent activity</Text>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Activity Logs" style={{ marginBottom: 16 }}>
                <Timeline>
                  {profileData.activity_logs.slice(0, 5).map((log, index) => (
                    <Timeline.Item key={index}>
                      <Text>{log.description}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {log.user} • {dayjs(log.timestamp).fromNow()}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
                {profileData.activity_logs.length === 0 && (
                  <Text type="secondary">No activity logs</Text>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Modal>
  );
};

export default CompanyProfileModal;
