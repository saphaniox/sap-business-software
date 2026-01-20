import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  message, Typography, Timeline, Divider, Badge, Empty
} from 'antd';
import {
  CustomerServiceOutlined,
  PlusOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { supportTicketsAPI } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Title, Text } = Typography;

const CompanySupportTickets = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [createForm] = Form.useForm();
  const [messageForm] = Form.useForm();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async (status = '') => {
    setLoading(true);
    try {
      const response = await supportTicketsAPI.getCompanyTickets(status);
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

  const handleCreate = async (values) => {
    setLoading(true);
    try {
      const response = await supportTicketsAPI.create(values);
      if (response.data.success) {
        message.success('Support ticket created successfully');
        setCreateModalVisible(false);
        createForm.resetFields();
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      message.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsModalVisible(true);
  };

  const handleAddMessage = async (values) => {
    if (!selectedTicket) return;

    setLoading(true);
    try {
      const response = await supportTicketsAPI.addMessage(selectedTicket._id, values.message);
      if (response.data.success) {
        message.success('Message sent successfully');
        messageForm.resetFields();
        
        // Refresh tickets and update selected ticket
        await fetchTickets();
        const updatedTicket = await supportTicketsAPI.getCompanyTickets();
        const updated = updatedTicket.data.tickets?.find(t => t._id === selectedTicket._id);
        if (updated) {
          setSelectedTicket(updated);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message');
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
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag>{category.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
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
      render: (date) => dayjs(date).fromNow()
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<MessageOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View & Reply
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <CustomerServiceOutlined /> Support Tickets
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateModalVisible(true)}
        >
          Create New Ticket
        </Button>
      </div>

      <Card>
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
        />
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        title="Create Support Ticket"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter a subject' }]}
          >
            <Input placeholder="Brief description of your issue" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please describe your issue' }]}
          >
            <TextArea
              rows={4}
              placeholder="Provide detailed information about your issue"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              <Select.Option value="general">General Inquiry</Select.Option>
              <Select.Option value="technical">Technical Issue</Select.Option>
              <Select.Option value="billing">Billing Question</Select.Option>
              <Select.Option value="feature_request">Feature Request</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            initialValue="medium"
          >
            <Select>
              <Select.Option value="low">
                <Tag color="default">Low</Tag>
              </Select.Option>
              <Select.Option value="medium">
                <Tag color="blue">Medium</Tag>
              </Select.Option>
              <Select.Option value="high">
                <Tag color="orange">High</Tag>
              </Select.Option>
              <Select.Option value="urgent">
                <Tag color="red">Urgent</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        title={
          <Space>
            <CustomerServiceOutlined />
            <span>Ticket: {selectedTicket?.ticket_number}</span>
            <Tag color={getStatusColor(selectedTicket?.status)} icon={getStatusIcon(selectedTicket?.status)}>
              {selectedTicket?.status?.replace('_', ' ').toUpperCase()}
            </Tag>
          </Space>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={800}
        footer={null}
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
              <Divider />
              <div>
                <Text strong>Initial Description:</Text>
                <Card style={{ marginTop: 8, backgroundColor: '#f5f5f5' }}>
                  <Text>{selectedTicket.description}</Text>
                </Card>
              </div>
              <Divider />
              <Text strong>Conversation:</Text>
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                <Timeline>
                  {selectedTicket.messages.map((msg, index) => (
                    <Timeline.Item
                      key={index}
                      color={msg.sender_type === 'admin' ? 'green' : 'blue'}
                    >
                      <Text strong>
                        {msg.sender_type === 'admin' ? '🛡️ Super Admin' : '👤 You'}
                      </Text>
                      <br />
                      <Text type="secondary">{dayjs(msg.timestamp).format('MMM D, YYYY h:mm A')}</Text>
                      <Card size="small" style={{ marginTop: 8 }}>
                        {msg.message}
                      </Card>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="No messages yet. Waiting for admin response..." />
              )}
              
              {selectedTicket.status !== 'closed' && (
                <>
                  <Divider />
                  <Form
                    form={messageForm}
                    layout="vertical"
                    onFinish={handleAddMessage}
                  >
                    <Form.Item
                      name="message"
                      label="Add a Reply"
                      rules={[{ required: true, message: 'Please enter your message' }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Type your message here..."
                        maxLength={1000}
                        showCount
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<MessageOutlined />}
                        loading={loading}
                        block
                      >
                        Send Message
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompanySupportTickets;
