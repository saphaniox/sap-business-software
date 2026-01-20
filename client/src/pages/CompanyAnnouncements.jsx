import { useState, useEffect } from 'react';
import { Card, List, Tag, Badge, Button, Empty, Typography, Space, Divider } from 'antd';
import {
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import { announcementsAPI } from '../services/api';
import { message as antMessage } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const CompanyAnnouncements = () => {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementsAPI.getCompanyAnnouncements();
      if (response.data.success) {
        const allAnnouncements = response.data.announcements || [];
        setAnnouncements(allAnnouncements);
        
        // Count unread announcements
        const unread = allAnnouncements.filter(a => !a.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      antMessage.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      const response = await announcementsAPI.markAsRead(announcementId);
      if (response.data.success) {
        // Update local state
        setAnnouncements(prev =>
          prev.map(a =>
            a._id === announcementId ? { ...a, is_read: true } : a
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        antMessage.success('Marked as read');
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      antMessage.error('Failed to mark as read');
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

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent') {
      return <NotificationOutlined style={{ color: '#f5222d' }} />;
    }
    return <BellOutlined />;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <BellOutlined /> Announcements
        </Title>
        <Badge count={unreadCount} showZero>
          <Button icon={<BellOutlined />} size="large">
            Notifications
          </Button>
        </Badge>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No announcements yet"
          />
        </Card>
      ) : (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={announcements}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} announcements`
          }}
          renderItem={(announcement) => (
            <Card
              style={{
                marginBottom: 16,
                border: announcement.is_read ? '1px solid #f0f0f0' : '2px solid #1890ff',
                backgroundColor: announcement.is_read ? '#ffffff' : '#f0f9ff'
              }}
            >
              <List.Item
                key={announcement._id}
                extra={
                  !announcement.is_read && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleMarkAsRead(announcement._id)}
                    >
                      Mark as Read
                    </Button>
                  )
                }
              >
                <List.Item.Meta
                  avatar={getPriorityIcon(announcement.priority)}
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 16 }}>
                        {announcement.title}
                      </Text>
                      {!announcement.is_read && (
                        <Badge status="processing" text="New" />
                      )}
                      <Tag color={getPriorityColor(announcement.priority)}>
                        {announcement.priority.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {dayjs(announcement.created_at).fromNow()}
                        {' • '}
                        {dayjs(announcement.created_at).format('MMMM D, YYYY h:mm A')}
                      </Text>
                    </Space>
                  }
                />
                <Divider style={{ margin: '12px 0' }} />
                <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                  {announcement.message}
                </Paragraph>
              </List.Item>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default CompanyAnnouncements;
