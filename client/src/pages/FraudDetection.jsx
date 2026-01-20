import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Alert,
  Spin,
  Button,
  Space,
  Typography,
  Progress,
  Divider,
  Empty,
  Tooltip
} from 'antd';
import {
  WarningOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
  UserOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const { Title, Text, Paragraph } = Typography;

function FraudDetection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFraudData();
  }, []);

  const fetchFraudData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/ai/fraud-detection');
      setData(response.data);
    } catch (err) {
      console.error('Fraud detection error:', err);
      setError(err.response?.data?.error || 'Failed to load fraud detection data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFraudData();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Analyzing security threats..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Fraud Detection"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchFraudData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const riskColor = (level) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'blue'
    };
    return colors[level] || 'default';
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (val) => `UGX ${val?.toLocaleString() || 0}`
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (level) => (
        <Tag color={riskColor(level)} icon={<AlertOutlined />}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 120,
      render: (score) => (
        <div>
          <Progress 
            percent={Math.min(score, 100)} 
            size="small" 
            status={score >= 50 ? 'exception' : score >= 30 ? 'active' : 'normal'}
            showInfo={false}
          />
          <Text strong>{score}</Text>
        </div>
      )
    },
    {
      title: 'Issues',
      dataIndex: 'riskFactors',
      key: 'riskFactors',
      render: (factors) => (
        <Tooltip title={factors.join('; ')}>
          <Text ellipsis style={{ maxWidth: 200, display: 'block' }}>
            {factors.join('; ')}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Recommendation',
      dataIndex: 'recommendation',
      key: 'recommendation',
      width: 200,
      ellipsis: true
    }
  ];

  const inventoryColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      align: 'center'
    },
    {
      title: 'Severity',
      dataIndex: 'severityLevel',
      key: 'severityLevel',
      width: 100,
      render: (level) => (
        <Tag color={riskColor(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Issues',
      dataIndex: 'issues',
      key: 'issues',
      render: (issues) => (
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
          {issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      )
    },
    {
      title: 'Action',
      dataIndex: 'recommendation',
      key: 'recommendation',
      width: 250,
      ellipsis: true
    }
  ];

  const duplicateColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <Tag color="orange">
          {type === 'duplicate_phone' ? 'Duplicate Phone' : 'Similar Name'}
        </Tag>
      )
    },
    {
      title: 'Customer 1',
      key: 'customer1',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customers[0]?.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.customers[0]?.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Customer 2',
      key: 'customer2',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customers[1]?.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.customers[1]?.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Recommendation',
      dataIndex: 'recommendation',
      key: 'recommendation',
      width: 200,
      ellipsis: true
    }
  ];

  const { summary } = data || {};
  const fraudRateValue = parseFloat(summary?.fraudRate) || 0;
  const threatLevel = summary?.criticalAlerts > 0 ? 'critical' : 
                      summary?.highRiskAlerts > 5 ? 'high' : 
                      summary?.suspiciousTransactions > 10 ? 'medium' : 'low';

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title="Fraud Detection & Security"
        subtitle="AI-powered threat detection and security monitoring"
        icon={<SafetyOutlined />}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      />

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Threat Level"
              value={threatLevel.toUpperCase()}
              valueStyle={{ 
                color: threatLevel === 'critical' ? '#f5222d' : 
                       threatLevel === 'high' ? '#fa8c16' : 
                       threatLevel === 'medium' ? '#faad14' : '#52c41a'
              }}
              prefix={
                threatLevel === 'critical' || threatLevel === 'high' ? 
                <AlertOutlined /> : <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Critical Alerts"
              value={summary?.criticalAlerts || 0}
              valueStyle={{ color: summary?.criticalAlerts > 0 ? '#f5222d' : '#52c41a' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Suspicious Transactions"
              value={summary?.suspiciousTransactions || 0}
              suffix={`/ ${summary?.totalTransactionsScanned || 0}`}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Fraud Rate"
              value={fraudRateValue.toFixed(2)}
              suffix="%"
              valueStyle={{ 
                color: fraudRateValue > 5 ? '#f5222d' : fraudRateValue > 2 ? '#fa8c16' : '#52c41a'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* AI Recommendations */}
      {data?.recommendations && data.recommendations.length > 0 && (
        <Card 
          title={
            <Space>
              <InfoCircleOutlined />
              <span>Security Recommendations</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          {data.recommendations.map((rec, index) => (
            <Alert
              key={index}
              message={rec.message}
              description={rec.action}
              type={rec.priority === 'critical' ? 'error' : rec.priority === 'high' ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: index < data.recommendations.length - 1 ? 12 : 0 }}
            />
          ))}
        </Card>
      )}

      {/* Suspicious Transactions */}
      <Card
        title={
          <Space>
            <ShoppingOutlined style={{ color: '#fa8c16' }} />
            <span>Suspicious Transactions</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {data?.transactions?.suspicious && data.transactions.suspicious.length > 0 ? (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text type="secondary">
                  Average Risk Score: <Text strong>{summary?.averageRiskScore}</Text>
                </Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text type="secondary">
                  Scanned: {summary?.totalTransactionsScanned} transactions (last 30 days)
                </Text>
              </Col>
            </Row>
            <Table
              dataSource={data.transactions.suspicious}
              columns={transactionColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </>
        ) : (
          <Empty description="No suspicious transactions detected" />
        )}
      </Card>

      {/* Inventory Discrepancies */}
      {data?.inventory?.discrepancies && data.inventory.discrepancies.length > 0 && (
        <Card
          title={
            <Space>
              <AlertOutlined style={{ color: '#f5222d' }} />
              <span>Inventory Discrepancies</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Alert
            message={`${summary?.inventoryIssues || 0} inventory issues detected`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={data.inventory.discrepancies}
            columns={inventoryColumns}
            rowKey="productId"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      {/* Duplicate Customers */}
      {data?.customers?.duplicates && data.customers.duplicates.length > 0 && (
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: '#722ed1' }} />
              <span>Duplicate Customer Records</span>
            </Space>
          }
        >
          <Alert
            message={`${summary?.duplicateCustomers || 0} potential duplicate records found`}
            description="Merging duplicate records helps maintain data accuracy and prevent confusion."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Table
            dataSource={data.customers.duplicates}
            columns={duplicateColumns}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      {/* Security Tips */}
      <Card 
        title="Security Best Practices"
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Paragraph>
              <Text strong>🛡️ Transaction Monitoring:</Text>
              <ul>
                <li>Review all high-risk transactions immediately</li>
                <li>Verify large or unusual transactions with customers</li>
                <li>Set up transaction amount limits</li>
                <li>Enable two-factor authentication</li>
              </ul>
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Paragraph>
              <Text strong>📦 Inventory Security:</Text>
              <ul>
                <li>Conduct regular physical inventory counts</li>
                <li>Investigate negative stock immediately</li>
                <li>Limit manual stock adjustments</li>
                <li>Review stock discrepancies weekly</li>
              </ul>
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default FraudDetection;
