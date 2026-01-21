import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Tag, Button, message, Alert, 
  Space, Badge, Tooltip, Empty, Timeline, Progress, Divider 
} from 'antd';
import {
  ShopOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, BarChartOutlined, ReloadOutlined, TrophyOutlined,
  RiseOutlined, UserAddOutlined, CalendarOutlined, PieChartOutlined, EyeOutlined,
  AppstoreOutlined, ShoppingOutlined, FileTextOutlined, AlertOutlined, CrownOutlined
} from '@ant-design/icons';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import CompanyProfileModal from '../components/CompanyProfileModal';
import CompanyLogoDisplay from '../components/CompanyLogoDisplay';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

function SuperAdminDashboard({ onNavigate }) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    blockedCompanies: 0,
    totalUsers: 0,
    recentRegistrations: 0,
    recentApprovals: 0,
    recentRejections: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [companyGrowth, setCompanyGrowth] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [visitorAnalytics, setVisitorAnalytics] = useState({
    totalVisitors: 0,
    totalPageViews: 0,
    todayVisitors: 0,
    averageDuration: 0
  });
  const [recentVisitors, setRecentVisitors] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchVisitorAnalytics();
    
    // Refresh data every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchDashboardData();
      fetchVisitorAnalytics();
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [companiesRes, usersRes, pendingRes, statsRes] = await Promise.all([
        api.get('/superadmin/companies'),
        api.get('/superadmin/all-users'),
        api.get('/superadmin/pending-companies'),
        api.get('/superadmin/statistics')
      ]);

      if (companiesRes.data.success) {
        const companies = companiesRes.data.companies || [];
        setCompanies(companies); // Store companies for the table
        const activeCount = companies.filter(c => c.status === 'active').length;
        const blockedCount = companies.filter(c => 
          c.status === 'blocked' || c.status === 'suspended' || c.status === 'banned'
        ).length;

        // Calculate recent registrations (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = companies.filter(c => 
          new Date(c.created_at) >= sevenDaysAgo
        ).length;

        // Status distribution for pie chart
        const statusCounts = companies.reduce((acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        }, {});

        const statusData = Object.keys(statusCounts).map(status => ({
          name: status.replace('_', ' ').toUpperCase(),
          value: statusCounts[status]
        }));

        // Top companies by user count
        const companyUserCounts = companies.map(c => ({
          name: c.company_name,
          users: c.userCount || 0,
          status: c.status
        })).sort((a, b) => b.users - a.users).slice(0, 5);

        // Company growth over last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const growthData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i * 5);
          const count = companies.filter(c => new Date(c.created_at) <= date).length;
          growthData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            companies: count
          });
        }

        // Recent activity timeline
        const activities = companies
          .filter(c => c.updated_at || c.created_at)
          .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
          .slice(0, 10)
          .map(c => ({
            company: c.company_name,
            status: c.status,
            date: new Date(c.updated_at || c.created_at).toLocaleString(),
            action: c.status === 'active' ? 'approved' : c.status === 'rejected' ? 'rejected' : 'registered'
          }));

        setStats(prev => ({
          ...prev,
          totalCompanies: companies.length,
          activeCompanies: activeCount,
          blockedCompanies: blockedCount,
          recentRegistrations: recentCount
        }));
        setStatusDistribution(statusData);
        setTopCompanies(companyUserCounts);
        setCompanyGrowth(growthData);
        setRecentActivity(activities);
      }

      if (pendingRes.data.success) {
        setStats(prev => ({
          ...prev,
          pendingCompanies: pendingRes.data.companies?.length || 0
        }));
      }

      if (usersRes.data.success) {
        const users = usersRes.data.users || [];
        setStats(prev => ({
          ...prev,
          totalUsers: users.length
        }));
      }

      // Add platform statistics if available
      if (statsRes?.data?.success) {
        const platformStats = statsRes.data.statistics;
        setStats(prev => ({
          ...prev,
          ...platformStats
        }));
      }

      message.success('Dashboard refreshed', 1);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
      if (error.response?.status === 403) {
        message.error('Access denied. Please check your super admin permissions.');
      } else if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else {
        message.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorAnalytics = async () => {
    try {
      const [overviewRes, visitorsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/visitors?limit=10')
      ]);

      if (overviewRes.data) {
        setVisitorAnalytics(overviewRes.data);
      }

      if (visitorsRes.data?.visitors) {
        setRecentVisitors(visitorsRes.data.visitors);
      }
    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
      // Don't show error message - analytics may not be critical
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'rejected':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'registered':
        return <ShopOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending_approval: 'warning',
      rejected: 'error',
      blocked: 'error',
      suspended: 'orange',
      banned: 'red'
    };
    return colors[status] || 'default';
  };

  const handleViewCompany = (companyId) => {
    setSelectedCompany(companyId);
    setProfileModalVisible(true);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Professional Header */}
      <div style={{ 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '20px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '32px', 
            fontWeight: '600',
            color: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <TrophyOutlined /> Super Admin Dashboard
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            System Overview • {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
            {stats.last_updated && (
              <span style={{ marginLeft: '16px', color: '#999' }}>
                • Last updated: {new Date(stats.last_updated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Badge status="processing" text="Auto-refresh: 30s" style={{ fontSize: '12px', color: '#666' }} />
          <Tooltip title="Refresh Dashboard">
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchDashboardData}
              loading={loading}
              size="large"
            >
              Refresh
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card 
              hoverable
              onClick={() => onNavigate?.('company-management')}
              style={{ 
                borderLeft: '4px solid #1890ff',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px', color: '#666' }}>Total Companies</span>}
                value={stats.totalCompanies}
                prefix={<ShopOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: '600' }}
                valueRender={(value) => (
                  <CountUp end={parseInt(value)} duration={2} />
                )}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                <RiseOutlined style={{ color: '#52c41a' }} /> {stats.recentRegistrations} new this week
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card 
              hoverable
              onClick={() => onNavigate?.('all-users')}
              style={{ 
                borderLeft: '4px solid #52c41a',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px', color: '#666' }}>Total Users</span>}
                value={stats.totalUsers}
                prefix={<TeamOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: '600' }}
                valueRender={(value) => (
                  <CountUp end={parseInt(value)} duration={2} />
                )}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                Across all companies
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card 
              hoverable
              onClick={() => onNavigate?.('approvals')}
              style={{ 
                borderLeft: '4px solid #faad14',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px', color: '#666' }}>Pending Approvals</span>}
                value={stats.pendingCompanies}
                prefix={<ClockCircleOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: '600' }}
                valueRender={(value) => (
                  <CountUp end={parseInt(value)} duration={2} />
                )}
              />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                {stats.pendingCompanies > 0 ? 'Requires attention' : 'All clear'}
              </div>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card 
              style={{ 
                borderLeft: '4px solid #52c41a',
                transition: 'all 0.3s'
              }}
            >
              <Statistic
                title={<span style={{ fontSize: '13px', color: '#666' }}>Active Companies</span>}
                value={stats.activeCompanies}
                prefix={<CheckCircleOutlined style={{ fontSize: '20px' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: '600' }}
                valueRender={(value) => (
                  <CountUp end={parseInt(value)} duration={2} />
                )}
              />
              <Progress 
                percent={Math.round((stats.activeCompanies / stats.totalCompanies) * 100) || 0} 
                strokeColor="#52c41a"
                size="small"
                showInfo={false}
                style={{ marginTop: '8px' }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Business Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} md={6}>
          <Card style={{ borderLeft: '4px solid #722ed1' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Total Products</span>}
              value={stats.total_products || 0}
              prefix={<AppstoreOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: '600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8} md={6}>
          <Card style={{ borderLeft: '4px solid #13c2c2' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Total Sales</span>}
              value={stats.total_sales || 0}
              prefix={<ShoppingOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#13c2c2', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              {stats.today_sales || 0} today
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8} md={6}>
          <Card style={{ borderLeft: '4px solid #fa8c16' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Total Invoices</span>}
              value={stats.total_invoices || 0}
              prefix={<FileTextOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              {stats.today_invoices || 0} today
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8} md={6}>
          <Card style={{ borderLeft: '4px solid #eb2f96' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Support Tickets</span>}
              value={stats.total_tickets || 0}
              prefix={<AlertOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#eb2f96', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              {stats.open_tickets || 0} open
            </div>
          </Card>
        </Col>
      </Row>

      {/* Activity Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderLeft: '4px solid #52c41a', background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Today's Activity</span>}
              value={`${(stats.today_users || 0) + (stats.today_sales || 0) + (stats.today_invoices || 0)}`}
              prefix={<RiseOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Users: {stats.today_users || 0} | Sales: {stats.today_sales || 0} | Invoices: {stats.today_invoices || 0}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderLeft: '4px solid #1890ff', background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Recent Activity (1h)</span>}
              value={stats.recent_activity || 0}
              prefix={<ClockCircleOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              System events tracked
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card style={{ borderLeft: '4px solid #faad14', background: 'linear-gradient(135deg, #fffbe6 0%, #ffffff 100%)' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}>Admin Users</span>}
              value={stats.admin_users || 0}
              prefix={<CrownOutlined style={{ fontSize: '20px' }} />}
              valueStyle={{ color: '#faad14', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Business administrators
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visitor Analytics Row - Super Admin Only */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderLeft: '4px solid #722ed1' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}><EyeOutlined /> Total Visitors</span>}
              value={visitorAnalytics.totalVisitors}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: '600' }}
              valueRender={(value) => <CountUp end={parseInt(value) || 0} duration={2} />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              {visitorAnalytics.todayVisitors || 0} today
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderLeft: '4px solid #13c2c2' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}><FileTextOutlined /> Page Views</span>}
              value={visitorAnalytics.totalPageViews}
              valueStyle={{ color: '#13c2c2', fontSize: '24px', fontWeight: '600' }}
              valueRender={(value) => <CountUp end={parseInt(value) || 0} duration={2} />}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              All time
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderLeft: '4px solid #fa8c16' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}><ClockCircleOutlined /> Avg Duration</span>}
              value={Math.floor((visitorAnalytics.averageDuration || 0) / 60)}
              suffix="min"
              valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              Per session
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderLeft: '4px solid #eb2f96' }}>
            <Statistic
              title={<span style={{ fontSize: '13px', color: '#666' }}><UserAddOutlined /> Active Sessions</span>}
              value={recentVisitors.filter(v => {
                const sessionTime = new Date(v.start_time);
                const now = new Date();
                return (now - sessionTime) < 30 * 60 * 1000; // Last 30 minutes
              }).length}
              valueStyle={{ color: '#eb2f96', fontSize: '24px', fontWeight: '600' }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              Last 30 minutes
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Company Growth Chart */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                <BarChartOutlined style={{ marginRight: '8px' }} />
                Platform Growth (Last 7 Days)
              </span>
            }
            style={{ height: '400px' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={companyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                <YAxis style={{ fontSize: '12px' }} />
                <ChartTooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="companies" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  dot={{ fill: '#1890ff', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Companies"
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  dot={{ fill: '#52c41a', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#13c2c2" 
                  strokeWidth={2}
                  dot={{ fill: '#13c2c2', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Status Distribution */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                <PieChartOutlined style={{ marginRight: '8px' }} />
                Company Status Distribution
              </span>
            }
            style={{ height: '400px' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        {/* Top Companies */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                <TrophyOutlined style={{ marginRight: '8px' }} />
                Top Companies by Users
              </span>
            }
          >
            {topCompanies.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {topCompanies.map((company, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#fafafa',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Badge 
                        count={index + 1} 
                        style={{ 
                          backgroundColor: index === 0 ? '#faad14' : '#d9d9d9',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }} 
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{company.name}</div>
                        <Tag color={getStatusColor(company.status)} size="small">
                          {company.status}
                        </Tag>
                      </div>
                    </div>
                    <Statistic 
                      value={company.users} 
                      suffix="users"
                      valueStyle={{ fontSize: '16px', color: '#1890ff' }}
                    />
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description="No companies yet" />
            )}
          </Card>
        </Col>

        {/* Recent Activity Timeline */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span style={{ fontSize: '16px', fontWeight: '600' }}>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Recent Activity
              </span>
            }
            style={{ maxHeight: '500px', overflow: 'auto' }}
          >
            {recentActivity.length > 0 ? (
              <Timeline mode="left">
                {recentActivity.map((activity, index) => (
                  <Timeline.Item 
                    key={index}
                    dot={getActivityIcon(activity.action)}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {activity.company}
                      </div>
                      <Tag color={getStatusColor(activity.status)} size="small">
                        {activity.action.toUpperCase()}
                      </Tag>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        {activity.date}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No recent activity" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Action Alerts */}
      {stats.pendingCompanies > 0 && (
        <Alert
          message={`${stats.pendingCompanies} Company Approval${stats.pendingCompanies > 1 ? 's' : ''} Pending`}
          description="New businesses are waiting for approval. Review and approve them to give them access to the platform."
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => onNavigate?.('approvals')}>
              Review Now
            </Button>
          }
          style={{ marginTop: '24px' }}
        />
      )}

      {stats.blockedCompanies > 0 && (
        <Alert
          message={`${stats.blockedCompanies} Blocked/Suspended Companies`}
          description="Some companies are currently blocked or suspended. Review their status in company management."
          type="info"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}

      {/* All Companies Table */}
      <Card 
        title={
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            <ShopOutlined style={{ marginRight: '8px' }} />
            All Registered Companies
          </span>
        }
        style={{ marginTop: '24px' }}
      >
        <Table
          dataSource={companies}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} companies` }}
          scroll={{ x: 1000 }}
          columns={[
            {
              title: 'Logo',
              dataIndex: 'logo',
              key: 'logo',
              width: 70,
              render: (logo, record) => (
                <CompanyLogoDisplay
                  companyName={record.company_name}
                  logoUrl={record.logo}
                  size={40}
                />
              )
            },
            {
              title: 'Company Name',
              dataIndex: 'company_name',
              key: 'company_name',
              sorter: (a, b) => a.company_name.localeCompare(b.company_name),
              render: (text) => <span style={{ fontWeight: '600' }}>{text}</span>
            },
            {
              title: 'Email',
              dataIndex: 'email',
              key: 'email'
            },
            {
              title: 'Industry',
              dataIndex: 'industry',
              key: 'industry',
              render: (text) => text || 'N/A'
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              filters: [
                { text: 'Active', value: 'active' },
                { text: 'Pending', value: 'pending_approval' },
                { text: 'Blocked', value: 'blocked' }
              ],
              onFilter: (value, record) => record.status === value,
              render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
            },
            {
              title: 'Registered',
              dataIndex: 'created_at',
              key: 'created_at',
              sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
              render: (date) => new Date(date).toLocaleDateString()
            },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewCompany(record._id)}
                >
                  View Details
                </Button>
              )
            }
          ]}
        />
      </Card>

      {/* Company Profile Modal */}
      <CompanyProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        companyId={selectedCompany}
      />
    </div>
  );
}

export default SuperAdminDashboard;
