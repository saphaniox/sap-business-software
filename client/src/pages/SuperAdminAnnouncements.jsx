import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  message, Popconfirm, Badge, Typography, Row, Col, Statistic
} from 'antd';
import {
  NotificationOutlined,
  PlusOutlined,
  DeleteOutlined,
  BellOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { announcementsAPI } from '../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Title, Text } = Typography;

const SuperAdminAnnouncements = () => {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getAll();
      if (response.data.success) {
        setAnnouncements(response.data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      message.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setLoading(true);
    try {
      const response = await announcementsAPI.create(values);
      if (response.data.success) {
        message.success('Announcement created successfully');
        setModalVisible(false);
        form.resetFields();
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      message.error(error.response?.data?.message || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await announcementsAPI.delete(id);
      if (response.data.success) {
        message.success('Announcement deleted successfully');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      message.error('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      normal: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'default';
  };

  const getTargetColor = (target) => {
    const colors = {
      all: 'cyan',
      active: 'green',
      pending: 'gold'
    };
    return colors[target] || 'default';
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text) => (
        <Text ellipsis style={{ maxWidth: 300 }}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </Text>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Normal', value: 'normal' },
        { text: 'High', value: 'high' },
        { text: 'Urgent', value: 'urgent' }
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Target Audience',
      dataIndex: 'target_audience',
      key: 'target_audience',
      filters: [
        { text: 'All', value: 'all' },
        { text: 'Active', value: 'active' },
        { text: 'Pending', value: 'pending' }
      ],
      onFilter: (value, record) => record.target_audience === value,
      render: (target) => (
        <Tag color={getTargetColor(target)}>{target.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Read Count',
      dataIndex: 'read_by',
      key: 'read_count',
      render: (readBy) => (
        <Badge
          count={readBy?.length || 0}
          showZero
          style={{ backgroundColor: '#52c41a' }}
        />
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => dayjs(date).format('MMM D, YYYY h:mm A')
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete Announcement"
          description="Are you sure you want to delete this announcement?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <NotificationOutlined /> Announcements Management
      </Title>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Announcements"
              value={announcements.length}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Urgent Announcements"
              value={announcements.filter(a => a.priority === 'urgent').length}
              prefix={<NotificationOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Reads"
              value={announcements.reduce((sum, a) => sum + (a.read_by?.length || 0), 0)}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Announcements Table */}
      <Card
        title="All Announcements"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Create Announcement
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={announcements}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} announcements`
          }}
        />
      </Card>

      {/* Create Announcement Modal */}
      <Modal
        title="Create New Announcement"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter announcement message"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select a priority' }]}
            initialValue="normal"
          >
            <Select>
              <Select.Option value="low">
                <Tag color="default">Low</Tag>
              </Select.Option>
              <Select.Option value="normal">
                <Tag color="blue">Normal</Tag>
              </Select.Option>
              <Select.Option value="high">
                <Tag color="orange">High</Tag>
              </Select.Option>
              <Select.Option value="urgent">
                <Tag color="red">Urgent</Tag>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="target_audience"
            label="Target Audience"
            rules={[{ required: true, message: 'Please select target audience' }]}
            initialValue="all"
          >
            <Select>
              <Select.Option value="all">
                <Tag color="cyan">All Companies</Tag>
              </Select.Option>
              <Select.Option value="active">
                <Tag color="green">Active Companies Only</Tag>
              </Select.Option>
              <Select.Option value="pending">
                <Tag color="gold">Pending Companies Only</Tag>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuperAdminAnnouncements;
