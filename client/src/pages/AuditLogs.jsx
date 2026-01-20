import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Tag, Input, Space, DatePicker, Select, Button, 
  Tooltip, Empty, message, Badge 
} from 'antd';
import {
  HistoryOutlined, UserOutlined, ShopOutlined, SearchOutlined,
  CheckCircleOutlined, CloseCircleOutlined, LockOutlined,
  UnlockOutlined, DeleteOutlined, ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import api from '../services/api';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

function AuditLogs() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approvals: 0,
    rejections: 0,
    blocks: 0,
    deletions: 0
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchText, filterAction, dateRange]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/superadmin/audit-logs');
      
      if (response.data.success) {
        const auditLogs = response.data.logs || [];
        setLogs(auditLogs);

        // Calculate statistics
        const stats = {
          total: auditLogs.length,
          approvals: auditLogs.filter(l => l.action === 'approve_company').length,
          rejections: auditLogs.filter(l => l.action === 'reject_company').length,
          blocks: auditLogs.filter(l => l.action === 'block_company').length,
          deletions: auditLogs.filter(l => l.action === 'delete_company' || l.action === 'delete_user').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      message.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(log =>
        log.target_name?.toLowerCase().includes(search) ||
        log.admin_name?.toLowerCase().includes(search) ||
        log.details?.toLowerCase().includes(search)
      );
    }

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(log => {
        try {
          const logDate = parseISO(log.timestamp);
          return isAfter(logDate, start.toDate()) && isBefore(logDate, end.toDate());
        } catch {
          return true;
        }
      });
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (action) => {
    const icons = {
      approve_company: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      reject_company: <CloseCircleOutlined style={{ color: '#f5222d' }} />,
      block_company: <LockOutlined style={{ color: '#ff4d4f' }} />,
      suspend_company: <LockOutlined style={{ color: '#faad14' }} />,
      reactivate_company: <UnlockOutlined style={{ color: '#52c41a' }} />,
      delete_company: <DeleteOutlined style={{ color: '#f5222d' }} />,
      delete_user: <DeleteOutlined style={{ color: '#f5222d' }} />,
      create_user: <UserOutlined style={{ color: '#1890ff' }} />,
      update_company: <ShopOutlined style={{ color: '#1890ff' }} />
    };
    return icons[action] || <HistoryOutlined />;
  };

  const getActionColor = (action) => {
    const colors = {
      approve_company: 'success',
      reject_company: 'error',
      block_company: 'error',
      suspend_company: 'warning',
      reactivate_company: 'success',
      delete_company: 'error',
      delete_user: 'error',
      create_user: 'processing',
      update_company: 'processing'
    };
    return colors[action] || 'default';
  };

  const getActionLabel = (action) => {
    const labels = {
      approve_company: 'Approved Company',
      reject_company: 'Rejected Company',
      block_company: 'Blocked Company',
      suspend_company: 'Suspended Company',
      reactivate_company: 'Reactivated Company',
      delete_company: 'Deleted Company',
      delete_user: 'Deleted User',
      create_user: 'Created User',
      update_company: 'Updated Company'
    };
    return labels[action] || action;
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => {
        try {
          const date = parseISO(timestamp);
          return (
            <Tooltip title={format(date, 'MMMM d, yyyy h:mm:ss a')}>
              <span style={{ fontSize: '12px' }}>
                {format(date, 'MMM d, yyyy HH:mm')}
              </span>
            </Tooltip>
          );
        } catch {
          return <span style={{ fontSize: '12px' }}>Invalid date</span>;
        }
      },
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      defaultSortOrder: 'ascend'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action) => (
        <Tag icon={getActionIcon(action)} color={getActionColor(action)}>
          {getActionLabel(action)}
        </Tag>
      )
    },
    {
      title: 'Target',
      dataIndex: 'target_name',
      key: 'target_name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: '600', fontSize: '13px' }}>{name || 'N/A'}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            ID: {record.target_id?.slice(0, 8)}...
          </div>
        </div>
      )
    },
    {
      title: 'Admin',
      dataIndex: 'admin_name',
      key: 'admin_name',
      render: (name, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontSize: '13px' }}>{name || 'System'}</span>
        </Space>
      )
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => (
        <Tooltip title={details}>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {details || 'No details provided'}
          </span>
        </Tooltip>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (ip) => (
        <code style={{ fontSize: '11px', color: '#666' }}>
          {ip || 'N/A'}
        </code>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '28px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <HistoryOutlined style={{ color: '#1890ff' }} /> Audit Logs
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Track all administrative actions and system changes
          </p>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={fetchAuditLogs}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>Total Actions</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1890ff' }}>{stats.total}</div>
            </div>
            <HistoryOutlined style={{ fontSize: '32px', color: '#1890ff', opacity: 0.3 }} />
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>Approvals</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#52c41a' }}>{stats.approvals}</div>
            </div>
            <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a', opacity: 0.3 }} />
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>Rejections</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#f5222d' }}>{stats.rejections}</div>
            </div>
            <CloseCircleOutlined style={{ fontSize: '32px', color: '#f5222d', opacity: 0.3 }} />
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>Blocks/Suspensions</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#faad14' }}>{stats.blocks}</div>
            </div>
            <LockOutlined style={{ fontSize: '32px', color: '#faad14', opacity: 0.3 }} />
          </div>
        </Card>
        <Card size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>Deletions</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff4d4f' }}>{stats.deletions}</div>
            </div>
            <DeleteOutlined style={{ fontSize: '32px', color: '#ff4d4f', opacity: 0.3 }} />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Search by company, admin, or details..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={setFilterAction}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Actions</Option>
            <Option value="approve_company">Approvals</Option>
            <Option value="reject_company">Rejections</Option>
            <Option value="block_company">Blocks</Option>
            <Option value="suspend_company">Suspensions</Option>
            <Option value="delete_company">Company Deletions</Option>
            <Option value="delete_user">User Deletions</Option>
          </Select>
          <RangePicker 
            onChange={setDateRange}
            style={{ width: 300 }}
          />
        </Space>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey={(record) => record._id || record.timestamp}
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} logs`
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No audit logs found"
              />
            )
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}

export default AuditLogs;
