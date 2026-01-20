import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography,
  Tag,
  Table,
  Progress,
  Space,
  Divider,
  Empty,
  Button,
  Tooltip
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  RiseOutlined,
  FallOutlined,
  AlertOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  UserOutlined,
  BarChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const { Title, Text, Paragraph } = Typography;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

function AIAnalytics() {
  const [loading, setLoading] = useState(true);
  const [salesForecast, setSalesForecast] = useState(null);
  const [inventoryRecommendations, setInventoryRecommendations] = useState(null);
  const [customerInsights, setCustomerInsights] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllAIData();
  }, []);

  const fetchAllAIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [forecastRes, inventoryRes, customerRes] = await Promise.all([
        api.get('/ai/sales-forecast?days=30'),
        api.get('/ai/inventory-recommendations'),
        api.get('/ai/customer-insights')
      ]);

      setSalesForecast(forecastRes.data);
      setInventoryRecommendations(inventoryRes.data);
      setCustomerInsights(customerRes.data);
    } catch (err) {
      console.error('AI Analytics error:', err);
      setError(err.response?.data?.error || 'Failed to load AI analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllAIData();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="AI is analyzing your business data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading AI Analytics"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchAllAIData}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Prepare sales forecast chart data
  const forecastChartData = salesForecast?.historical?.dates?.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: salesForecast.historical.sales[index],
    movingAvg: salesForecast.historical.movingAverage[index],
    smoothed: salesForecast.historical.smoothed[index]
  })) || [];

  // Add predictions to chart
  const predictionData = salesForecast?.forecast?.predictions?.map((pred, index) => ({
    date: `Day ${index + 1}`,
    predicted: pred.predicted,
    lower: pred.lower,
    upper: pred.upper
  })) || [];

  // Inventory recommendations columns
  const inventoryColumns = [
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.product.category}
          </Text>
        </div>
      )
    },
    {
      title: 'Stock Status',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const { status, priority } = record.recommendation;
        const colors = {
          critical: 'red',
          out_of_stock: 'red',
          warning: 'orange',
          slow_moving: 'blue',
          overstocked: 'purple'
        };
        return (
          <Tag color={colors[status]} icon={priority === 1 ? <AlertOutlined /> : null}>
            {status.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Current Stock',
      dataIndex: ['product', 'currentStock'],
      key: 'currentStock',
      width: 100,
      align: 'center'
    },
    {
      title: 'Daily Sales',
      dataIndex: ['analysis', 'averageDailySales'],
      key: 'dailySales',
      width: 100,
      align: 'center',
      render: (val) => val?.toFixed(1) || '0'
    },
    {
      title: 'Days Until Stockout',
      dataIndex: ['analysis', 'daysUntilStockout'],
      key: 'daysUntilStockout',
      width: 120,
      align: 'center',
      render: (days) => {
        if (!days || days === Infinity) return <Text type="secondary">N/A</Text>;
        const color = days < 7 ? 'red' : days < 14 ? 'orange' : 'green';
        return <Text style={{ color }}>{days} days</Text>;
      }
    },
    {
      title: 'Recommended Order',
      dataIndex: ['analysis', 'recommendedOrderQuantity'],
      key: 'orderQty',
      width: 120,
      align: 'center',
      render: (qty) => <Text strong>{qty || 0}</Text>
    },
    {
      title: 'Action',
      dataIndex: ['recommendation', 'action'],
      key: 'action',
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 250 }}>
            {text}
          </Text>
        </Tooltip>
      )
    }
  ];

  // Customer insights columns
  const customerColumns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      width: 120,
      render: (segment) => {
        const colors = {
          Champions: 'gold',
          'Loyal Customers': 'green',
          'Potential Loyalist': 'blue',
          'At Risk': 'orange',
          'Need Attention': 'red'
        };
        return <Tag color={colors[segment] || 'default'}>{segment}</Tag>;
      }
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 120,
      align: 'right',
      render: (val) => `UGX ${val?.toLocaleString() || 0}`
    },
    {
      title: 'Purchases',
      dataIndex: 'totalPurchases',
      key: 'purchases',
      width: 100,
      align: 'center'
    },
    {
      title: 'Lifetime Value',
      dataIndex: 'clv',
      key: 'clv',
      width: 120,
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#52c41a' }}>
          UGX {val?.toLocaleString() || 0}
        </Text>
      )
    },
    {
      title: 'Risk',
      dataIndex: 'churnRisk',
      key: 'risk',
      width: 100,
      render: (risk) => {
        const colors = { low: 'green', medium: 'orange', high: 'red' };
        return <Tag color={colors[risk]}>{risk?.toUpperCase()}</Tag>;
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title="AI-Powered Business Intelligence"
        subtitle="Advanced analytics and insights powered by artificial intelligence"
        icon={<BarChartOutlined />}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh All
          </Button>
        }
      />

      {/* Sales Forecast Section */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#1890ff' }} />
            <span>Sales Forecast & Predictions</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {salesForecast?.insights ? (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Average Recent Sales"
                  value={salesForecast.insights.averageRecentSales}
                  prefix="UGX"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Predicted Average"
                  value={salesForecast.insights.predictedAverageSales}
                  prefix="UGX"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Expected Growth"
                  value={salesForecast.insights.expectedGrowth}
                  prefix={
                    parseFloat(salesForecast.insights.expectedGrowth) > 0 ? (
                      <RiseOutlined />
                    ) : (
                      <FallOutlined />
                    )
                  }
                  valueStyle={{
                    color:
                      parseFloat(salesForecast.insights.expectedGrowth) > 0
                        ? '#52c41a'
                        : '#f5222d'
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Sales Velocity"
                  value={salesForecast.insights.salesVelocity}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Tag color="blue">Trend: {salesForecast.forecast?.trend || 'N/A'}</Tag>
                <Tag color="green">Confidence: {salesForecast.insights?.confidence || 'N/A'}</Tag>
                {salesForecast.seasonality?.hasSeasonality && (
                  <Tag color="purple">Seasonality Detected</Tag>
                )}
                {salesForecast.insights?.anomaliesDetected > 0 && (
                  <Tag color="red">
                    {salesForecast.insights.anomaliesDetected} Anomalies Detected
                  </Tag>
                )}
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Title level={5}>Historical Sales with Trends</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#1890ff"
                      fill="#1890ff"
                      fillOpacity={0.3}
                      name="Actual Sales"
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="#52c41a"
                      name="7-Day Moving Avg"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="smoothed"
                      stroke="#faad14"
                      name="Smoothed Trend"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Col>

              <Col xs={24} lg={12}>
                <Title level={5}>30-Day Forecast Prediction</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictionData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="#faad14"
                      fill="#faad14"
                      fillOpacity={0.1}
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#1890ff"
                      fill="#1890ff"
                      fillOpacity={0.3}
                      name="Predicted"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="#f5222d"
                      fill="#f5222d"
                      fillOpacity={0.1}
                      name="Lower Bound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Col>
            </Row>

            {salesForecast.recommendations && salesForecast.recommendations.length > 0 && (
              <>
                <Divider />
                <Title level={5}>AI Recommendations</Title>
                {salesForecast.recommendations.map((rec, index) => (
                  <Alert
                    key={index}
                    message={rec.message}
                    type={rec.priority === 'high' ? 'warning' : 'info'}
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <Empty description="Not enough sales data for forecasting. Need at least 7 days of sales history." />
        )}
      </Card>

      {/* Smart Inventory Management */}
      <Card
        title={
          <Space>
            <ShoppingOutlined style={{ color: '#52c41a' }} />
            <span>Smart Inventory Recommendations</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {inventoryRecommendations?.summary && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Critical Items"
                    value={inventoryRecommendations.summary.critical}
                    valueStyle={{ color: '#f5222d' }}
                    prefix={<AlertOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Out of Stock"
                    value={inventoryRecommendations.summary.outOfStock}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Needs Attention"
                    value={inventoryRecommendations.summary.warning}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small">
                  <Statistic
                    title="Estimated Reorder Cost"
                    value={inventoryRecommendations.insights.estimatedReorderCost}
                    prefix="UGX"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              dataSource={inventoryRecommendations.recommendations}
              columns={inventoryColumns}
              rowKey={(record) => record.product.id}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </>
        )}
      </Card>

      {/* Customer Insights */}
      <Card
        title={
          <Space>
            <UserOutlined style={{ color: '#722ed1' }} />
            <span>Intelligent Customer Insights</span>
          </Space>
        }
      >
        {customerInsights?.summary && (
          <>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Customers"
                  value={customerInsights.summary.totalCustomers}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Active Customers"
                  value={customerInsights.summary.activeCustomers}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="At Risk"
                  value={customerInsights.summary.atRiskCount}
                  valueStyle={{ color: '#f5222d' }}
                  prefix={<AlertOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Lifetime Value"
                  value={customerInsights.summary.totalLifetimeValue}
                  prefix="UGX"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Top Customers</Title>
            <Table
              dataSource={customerInsights.topCustomers}
              columns={customerColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
              style={{ marginBottom: 24 }}
            />

            {customerInsights.segments && (
              <>
                <Divider />
                <Title level={5}>Customer Segmentation</Title>
                <Row gutter={16}>
                  {Object.entries(customerInsights.segments).map(([segment, data]) => (
                    <Col xs={24} sm={12} md={8} key={segment}>
                      <Card size="small" style={{ marginBottom: 16 }}>
                        <Statistic
                          title={segment}
                          value={data.count}
                          suffix="customers"
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Total Value: UGX {data.totalValue?.toLocaleString() || 0}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Avg CLV: UGX {data.averageCLV?.toLocaleString() || 0}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AIAnalytics;
