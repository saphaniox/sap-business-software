import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Button, Empty, Spin, Typography, Space, Popconfirm } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const { Text } = Typography;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

/**
 * Notifications Center Component
 * Displays in-app notifications with bell icon and dropdown
 */
const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Skip if no token (e.g., Super Admin mode)
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't show error for 401 (likely Super Admin or expired token)
      if (error.response?.status !== 401) {
        // Could show a silent error or notification
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      const notification = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Clear all read notifications
  const clearReadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/clear-read`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
      setDropdownOpen(false);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    const iconStyle = { fontSize: 18 };
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'warning':
        return <WarningOutlined style={{ ...iconStyle, color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    }
  };

  // Load notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Dropdown menu content
  const dropdownContent = (
    <div style={{ width: 400, maxHeight: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa'
      }}>
        <Text strong style={{ fontSize: 16 }}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <Space>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={markAllAsRead}
              icon={<CheckOutlined />}
            >
              Mark all read
            </Button>
          )}
          {notifications.some(n => n.read) && (
            <Popconfirm
              title="Clear all read notifications?"
              onConfirm={clearReadNotifications}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="link" 
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                Clear
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: 40 }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={notification => (
              <List.Item
                key={notification._id}
                style={{
                  padding: '12px 16px',
                  cursor: notification.link ? 'pointer' : 'default',
                  backgroundColor: notification.read ? 'transparent' : '#e6f7ff',
                  borderLeft: notification.read ? 'none' : '3px solid #1890ff',
                  transition: 'all 0.3s'
                }}
                actions={[
                  <Popconfirm
                    title="Delete this notification?"
                    onConfirm={() => deleteNotification(notification._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<DeleteOutlined />}
                      danger
                    />
                  </Popconfirm>
                ]}
                onClick={() => handleNotificationClick(notification)}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(notification.type)}
                  title={
                    <Text strong={!notification.read}>
                      {notification.title}
                    </Text>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {notification.message}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ border: 'none' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationsCenter;
