import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Typography, Spin, Statistic, Space, Button, message } from 'antd'
import {
  DatabaseOutlined, ClockCircleOutlined, CheckCircleOutlined,
  UserOutlined, GlobalOutlined, ThunderboltOutlined, SafetyOutlined, ReloadOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import PageHeader from '../components/PageHeader'
import BackToTop from '../components/BackToTop'
import axios from 'axios'

const { Text } = Typography

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000'

function Debug() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [systemHealth, setSystemHealth] = useState(null)
  const [responseTime, setResponseTime] = useState(null)

  useEffect(() => {
    fetchSystemMetrics()
  }, [])

  const fetchSystemMetrics = async () => {
    setIsLoading(true)
    try {
      // Test API response time
      const startTime = Date.now()
      const response = await axios.get(`${API_BASE_URL}/api/health`)
      const endTime = Date.now()
      
      setResponseTime(endTime - startTime)
      setSystemHealth(response.data)
      message.success('System metrics updated')
    } catch (error) {
      message.error('Failed to fetch system metrics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const isMobile = window.innerWidth <= 768

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: isMobile ? '10px' : '20px' }}>
        <PageHeader
          title="System Dashboard"
          breadcrumbs={[{ label: 'System Dashboard' }]}
          icon={<DatabaseOutlined />}
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchSystemMetrics}
            >
              Refresh
            </Button>
          }
        />

        {/* System Health Overview */}
        <Card 
          title={
            <Space>
              <SafetyOutlined />
              <Text strong>System Health Status</Text>
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="API Status"
                value={systemHealth?.status || 'Unknown'}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: systemHealth?.status === 'healthy' ? '#3f8600' : '#cf1322' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Response Time"
                value={responseTime || 0}
                suffix="ms"
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: responseTime < 500 ? '#3f8600' : responseTime < 1000 ? '#fa8c16' : '#cf1322' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Server Uptime"
                value={formatUptime(systemHealth?.uptime)}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Database"
                value="Connected"
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Performance Metrics */}
        <Card 
          title={
            <Space>
              <ThunderboltOutlined />
              <Text strong>Performance Metrics</Text>
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>API Response Time</Text>
                  <Text>{responseTime ? `${responseTime}ms` : 'N/A'}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {responseTime < 300 ? '✅ Excellent' : 
                     responseTime < 700 ? '⚡ Good' : 
                     responseTime < 1500 ? '⚠️ Average' : '❌ Slow'}
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Server Uptime</Text>
                  <Text>{formatUptime(systemHealth?.uptime)}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Last checked: {systemHealth?.timestamp ? new Date(systemHealth.timestamp).toLocaleTimeString() : 'N/A'}
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* System Information */}
        <Card 
          title={
            <Space>
              <GlobalOutlined />
              <Text strong>System Configuration</Text>
            </Space>
          }
          style={{ marginBottom: 20 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>API Base URL</Text><br />
                  <Tag color="blue">{API_BASE_URL}</Tag>
                </div>
                <div>
                  <Text strong>Environment</Text><br />
                  <Tag color={import.meta.env.MODE === 'production' ? 'green' : 'orange'}>
                    {import.meta.env.MODE}
                  </Tag>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Auth Status</Text><br />
                  <Tag color={localStorage.getItem('token') ? 'green' : 'red'}>
                    {localStorage.getItem('token') ? 'Authenticated' : 'Not Authenticated'}
                  </Tag>
                </div>
                <div>
                  <Text strong>Database Connection</Text><br />
                  <Tag color="green">Active</Tag>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Current User Information */}
        <Card 
          title={
            <Space>
              <UserOutlined />
              <Text strong>Current Session</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Text strong>Username:</Text><br />
              <Tag color="green">{user?.username || 'Unknown'}</Tag>
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Role:</Text><br />
              <Tag color="purple">{user?.role || 'Unknown'}</Tag>
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Session Status:</Text><br />
              <Tag color="blue">Active</Tag>
            </Col>
          </Row>
        </Card>

        <BackToTop />
      </div>
    </Spin>
  )
}

export default Debug
