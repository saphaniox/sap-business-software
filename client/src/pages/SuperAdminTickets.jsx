import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  message, Badge, Typography, Timeline, Divider, Row, Col, Statistic
} from 'antd';
import {
  CustomerServiceOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { supportTicketsAPI } from '../services/api';
import CompanyLogoDisplay from '../components/CompanyLogoDisplay';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Title, Text } = Typography;

const SuperAdminTickets = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await supportTicketsAPI.getAllTickets(filters);
      if (response.data.success) {
        setTickets(response.data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      message.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsModalVisible(true);
  };

  const handleReply = async (values) => {
    if (!selectedTicket) return;
    
    setLoading(true);
    try {
      const response = await supportTicketsAPI.addAdminMessage(selectedTicket._id, values.message);
      if (response.data.success) {
        message.success('Reply sent successfully');
        setReplyModalVisible(false);
        form.resetFields();
        fetchTickets();
        
        // Update selected ticket
        const updatedResponse = await supportTicketsAPI.getAllTickets({ ticket_id: selectedTicket._id });
        if (updatedResponse.data.success && updatedResponse.data.tickets.length > 0) {
          setSelectedTicket(updatedResponse.data.tickets[0]);
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      message.error('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setLoading(true);
    try {
      const response = await supportTicketsAPI.updateStatus(ticketId, newStatus);
      if (response.data.success) {
        message.success(`Ticket status updated to ${newStatus}`);
        fetchTickets();
        
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      message.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'blue',
      in_progress: 'orange',
      resolved: 'green',
      closed: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <ClockCircleOutlined />,
      in_progress: <SyncOutlined spin />,
      resolved: <CheckCircleOutlined />,
      closed: <CloseCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text) => <Text strong code>{text}</Text>
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text, record) => (
        <Space>
          <CompanyLogoDisplay
            companyName={text}
            logoUrl={record.company_logo}
            size={32}
          />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'General', value: 'general' },
        { text: 'Technical', value: 'technical' },
        { text: 'Billing', value: 'billing' },
        { text: 'Feature Request', value: 'feature_request' }
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag>{category.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Urgent', value: 'urgent' }
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Open', value: 'open' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Closed', value: 'closed' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleUpdateStatus(record._id, newStatus)}
          style={{ width: 120 }}
          size="small"
        >
          <Select.Option value="open">
            <Tag color="blue" icon={<ClockCircleOutlined />}>Open</Tag>
          </Select.Option>
          <Select.Option value="in_progress">
            <Tag color="orange" icon={<SyncOutlined />}>In Progress</Tag>
          </Select.Option>
          <Select.Option value="resolved">
            <Tag color="green" icon={<CheckCircleOutlined />}>Resolved</Tag>
          </Select.Option>
          <Select.Option value="closed">
            <Tag color="default" icon={<CloseCircleOutlined />}>Closed</Tag>
          </Select.Option>
        </Select>
      )
    },
    {
      title: 'Messages',
      dataIndex: 'messages',
      key: 'messages',
      render: (messages) => (
        <Badge count={messages?.length || 0} showZero />
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => dayjs(date).fromNow()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<MessageOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CustomerServiceOutlined /> Support Tickets Management
      </Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Tickets"
              value={tickets.length}
              prefix={<CustomerServiceOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Open Tickets"
              value={tickets.filter(t => t.status === 'open').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={tickets.filter(t => t.status === 'in_progress').length}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Resolved"
              value={tickets.filter(t => t.status === 'resolved').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tickets Table */}
      <Card title="All Support Tickets">
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tickets`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Ticket Details Modal */}
      <Modal
        title={
          <Space>
            <CustomerServiceOutlined />
            <span>Ticket Details: {selectedTicket?.ticket_number}</span>
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="reply"
            type="primary"
            icon={<MessageOutlined />}
            onClick={() => {
              setDetailsModalVisible(false);
              setReplyModalVisible(true);
            }}
          >
            Reply to Ticket
          </Button>
        ]}
      >
        {selectedTicket && (
          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Subject:</Text> {selectedTicket.subject}
              </div>
              <div>
                <Text strong>Category:</Text>{' '}
                <Tag>{selectedTicket.category.replace('_', ' ').toUpperCase()}</Tag>
              </div>
              <div>
                <Text strong>Priority:</Text>{' '}
                <Tag color={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority.toUpperCase()}
                </Tag>
              </div>
              <div>
                <Text strong>Status:</Text>{' '}
                <Tag color={getStatusColor(selectedTicket.status)} icon={getStatusIcon(selectedTicket.status)}>
                  {selectedTicket.status.toUpperCase()}
                </Tag>
              </div>
              <Divider />
              <div>
                <Text strong>Initial Message:</Text>
                <Card style={{ marginTop: 8 }}>
                  <Text>{selectedTicket.description}</Text>
                </Card>
              </div>
              <Divider />
              <Text strong>Conversation:</Text>
              <Timeline>
                {selectedTicket.messages?.map((msg, index) => (
                  <Timeline.Item
                    key={index}
                    color={msg.sender_type === 'admin' ? 'green' : 'blue'}
                  >
                    <Text strong>
                      {msg.sender_type === 'admin' ? 'Super Admin' : selectedTicket.company_name}
                    </Text>
                    <br />
                    <Text type="secondary">{dayjs(msg.timestamp).format('MMM D, YYYY h:mm A')}</Text>
                    <Card size="small" style={{ marginTop: 8 }}>
                      {msg.message}
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Space>
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        title="Reply to Ticket"
        open={replyModalVisible}
        onCancel={() => {
          setReplyModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleReply}>
          <Form.Item
            name="message"
            label="Your Reply"
            rules={[{ required: true, message: 'Please enter your reply' }]}
          >
            <TextArea
              rows={6}
              placeholder="Type your reply here..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminTickets;
