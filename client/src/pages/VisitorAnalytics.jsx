import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  message,
  Typography,
  Spin,
  Empty,
  Progress,
  Divider
} from 'antd';
import {
  UserOutlined,
  GlobalOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  ChromeOutlined,
  ReloadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import '../styles/global.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Remove /api suffix if present in VITE_API_URL to prevent double /api/api/
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000';
const API_BASE_URL = baseUrl.replace(/\/api$/, '');

const VisitorAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [popularPages, setPopularPages] = useState([]);
  const [deviceStats, setDeviceStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);

  // Check Super Admin authentication
  useEffect(() => {
    const superAdminAuth = localStorage.getItem('superAdminAuth');
    if (!superAdminAuth) {
      message.error('Unauthorized access. Please login as Super Admin.');
      navigate('/');
      return;
    }
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superAdminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [overviewRes, visitorsRes, pagesRes, devicesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/analytics/overview`, config),
        axios.get(`${API_BASE_URL}/api/analytics/visitors?page=1&limit=50`, config),
        axios.get(`${API_BASE_URL}/api/analytics/popular-pages`, config),
        axios.get(`${API_BASE_URL}/api/analytics/device-stats`, config)
      ]);

      setOverview(overviewRes.data);
      setVisitors(visitorsRes.data.visitors || []);
      setTotalVisitors(visitorsRes.data.total || 0);
      setPopularPages(pagesRes.data.pages || []);
      setDeviceStats(devicesRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      message.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVisitors = async (page) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/analytics/visitors?page=${page}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVisitors(response.data.visitors || []);
      setCurrentPage(page);
    } catch (error) {
      message.error('Failed to load visitors');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <MobileOutlined />;
      case 'tablet': return <TabletOutlined />;
      default: return <DesktopOutlined />;
    }
  };

  const visitorsColumns = [
    {
      title: 'Session ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      render: (text) => <Text code copyable>{text.substring(0, 20)}...</Text>,
      width: 200
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => <Tag color="blue">{ip || 'Unknown'}</Tag>
    },
    {
      title: 'Location',
      dataIndex: 'country',
      key: 'location',
      render: (country, record) => (
        <Space>
          <GlobalOutlined />
          <Text>{country || 'Unknown'}</Text>
          {record.city && <Text type="secondary">({record.city})</Text>}
        </Space>
      )
    },
    {
      title: 'Device',
      dataIndex: 'deviceType',
      key: 'device',
      render: (type, record) => (
        <Space>
          {getDeviceIcon(type)}
          <Text>{type || 'Unknown'}</Text>
          <Text type="secondary">{record.browser}</Text>
        </Space>
      )
    },
    {
      title: 'OS',
      dataIndex: 'os',
      key: 'os',
      render: (os) => <Tag>{os || 'Unknown'}</Tag>
    },
    {
      title: 'Pages Viewed',
      dataIndex: 'totalPageViews',
      key: 'pages',
      render: (count) => <Tag color="green">{count || 0} pages</Tag>
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{formatDuration(duration)}</Text>
        </Space>
      )
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => new Date(time).toLocaleString(),
      width: 180
    },
    {
      title: 'Status',
      dataIndex: 'endTime',
      key: 'status',
      render: (endTime) => (
        <Tag color={endTime ? 'default' : 'success'}>
          {endTime ? 'Ended' : 'Active'}
        </Tag>
      )
    }
  ];

  const pagesColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_, __, index) => <Text strong>#{index + 1}</Text>,
      width: 80
    },
    {
      title: 'Page',
      dataIndex: 'page',
      key: 'page',
      render: (page) => <Text code>{page}</Text>
    },
    {
      title: 'Visits',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count.toLocaleString()}</Tag>,
      sorter: (a, b) => b.count - a.count
    },
    {
      title: 'Popularity',
      dataIndex: 'count',
      key: 'popularity',
      render: (count) => {
        const maxCount = popularPages[0]?.count || 1;
        const percentage = (count / maxCount) * 100;
        return <Progress percent={Math.round(percentage)} size="small" />;
      }
    }
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" tip="Loading analytics data..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ background: '#fff', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/dashboard')}
            >
              Back
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              📊 Visitor Analytics & Performance
            </Title>
          </Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={fetchAllData}
          >
            Refresh
          </Button>
        </div>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Overview Statistics */}
        <Card title="📈 Overview Statistics" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Total Visitors"
                  value={overview?.totalVisitors || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Total Sessions"
                  value={overview?.totalSessions || 0}
                  prefix={<GlobalOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Total Page Views"
                  value={overview?.totalPageViews || 0}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="Avg Session Duration"
                  value={formatDuration(overview?.averageDuration || 0)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Today's Activity</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Today's Visitors"
                value={overview?.todayVisitors || 0}
                prefix="👥"
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Today's Page Views"
                value={overview?.todayPageViews || 0}
                prefix="📄"
              />
            </Col>
          </Row>
        </Card>

        {/* Device Statistics */}
        {deviceStats && (
          <Card title="💻 Device & Browser Statistics" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Title level={5}>Device Types</Title>
                {deviceStats.deviceTypes?.map(device => (
                  <div key={device._id} style={{ marginBottom: 12 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        {getDeviceIcon(device._id)}
                        <Text>{device._id || 'Unknown'}</Text>
                      </Space>
                      <Tag color="blue">{device.count} ({device.percentage}%)</Tag>
                    </Space>
                    <Progress percent={device.percentage} size="small" />
                  </div>
                ))}
              </Col>
              <Col xs={24} md={8}>
                <Title level={5}>Browsers</Title>
                {deviceStats.browsers?.map(browser => (
                  <div key={browser._id} style={{ marginBottom: 12 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <ChromeOutlined />
                        <Text>{browser._id || 'Unknown'}</Text>
                      </Space>
                      <Tag color="green">{browser.count} ({browser.percentage}%)</Tag>
                    </Space>
                    <Progress percent={browser.percentage} size="small" strokeColor="#52c41a" />
                  </div>
                ))}
              </Col>
              <Col xs={24} md={8}>
                <Title level={5}>Operating Systems</Title>
                {deviceStats.os?.map(system => (
                  <div key={system._id} style={{ marginBottom: 12 }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>{system._id || 'Unknown'}</Text>
                      <Tag color="purple">{system.count} ({system.percentage}%)</Tag>
                    </Space>
                    <Progress percent={system.percentage} size="small" strokeColor="#722ed1" />
                  </div>
                ))}
              </Col>
            </Row>
          </Card>
        )}

        {/* Popular Pages */}
        <Card title="🔥 Most Popular Pages" style={{ marginBottom: 24 }}>
          {popularPages.length > 0 ? (
            <Table
              columns={pagesColumns}
              dataSource={popularPages}
              rowKey="page"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          ) : (
            <Empty description="No page data available" />
          )}
        </Card>

        {/* Recent Visitors */}
        <Card title="👥 Recent Visitors">
          {visitors.length > 0 ? (
            <Table
              columns={visitorsColumns}
              dataSource={visitors}
              rowKey="sessionId"
              pagination={{
                current: currentPage,
                total: totalVisitors,
                pageSize: 50,
                onChange: loadMoreVisitors,
                showTotal: (total) => `Total ${total} visitors`
              }}
              scroll={{ x: 1400 }}
              size="middle"
            />
          ) : (
            <Empty description="No visitor data available" />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default VisitorAnalytics;
