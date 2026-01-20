import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Select, Spin, Typography, Table, Tag, Space, Progress } from 'antd'
import { DollarOutlined, ShoppingCartOutlined, RiseOutlined, CalendarOutlined, TrophyOutlined, LineChartOutlined, FundOutlined } from '@ant-design/icons'
import { reportsAPI } from '../services/api'
import PageHeader from '../components/PageHeader'
import BackToTop from '../components/BackToTop'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const { Option } = Select
const { Title: AntTitle, Text } = Typography

function Analytics() {
  const [isLoading, setIsLoading] = useState(false)
  const [dailyData, setDailyData] = useState(null)
  const [periodData, setPeriodData] = useState(null)
  const [profitData, setProfitData] = useState(null)
  const [weeklyProfitData, setWeeklyProfitData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedProfitPeriod, setSelectedProfitPeriod] = useState('all')

  useEffect(() => {
    fetchDailyAnalytics()
    fetchProfitAnalytics('all')
    fetchWeeklyProfitBreakdown()
  }, [])

  useEffect(() => {
    fetchPeriodAnalytics(selectedPeriod)
  }, [selectedPeriod])

  useEffect(() => {
    fetchProfitAnalytics(selectedProfitPeriod)
  }, [selectedProfitPeriod])

  const fetchDailyAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await reportsAPI.dailyAnalytics()
      setDailyData(response.data)
    } catch (error) {
      console.error('Failed to fetch daily analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProfitAnalytics = async (period) => {
    try {
      setIsLoading(true)
      const response = await reportsAPI.profitAnalytics(period)
      setProfitData(response.data)
    } catch (error) {
      console.error('Failed to fetch profit analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWeeklyProfitBreakdown = async () => {
    try {
      setIsLoading(true)
      const response = await reportsAPI.profitWeeklyBreakdown()
      setWeeklyProfitData(response.data)
    } catch (error) {
      console.error('Failed to fetch weekly profit breakdown:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfitPeriodChange = (value) => {
    setSelectedProfitPeriod(value)
  }

  const fetchPeriodAnalytics = async (period) => {
    try {
      setIsLoading(true)
      const response = await reportsAPI.periodAnalytics(period)
      setPeriodData(response.data)
    } catch (error) {
      console.error('Failed to fetch period analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value)
  }

  // Prepare chart data for revenue and orders
  const revenueChartData = periodData ? {
    labels: periodData.breakdown.map(item => item.date),
    datasets: [
      {
        label: 'Revenue (UGX)',
        data: periodData.breakdown.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  } : { labels: [], datasets: [] }

  const ordersChartData = periodData ? {
    labels: periodData.breakdown.map(item => item.date),
    datasets: [
      {
        label: 'Orders',
        data: periodData.breakdown.map(item => item.orders),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  } : { labels: [], datasets: [] }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Revenue')) {
                label += 'UGX ' + context.parsed.y.toLocaleString();
              } else {
                label += context.parsed.y.toLocaleString();
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    }
  }

  const isMobile = window.innerWidth <= 768

  return (
    <Spin spinning={isLoading}>
      <div style={{ padding: window.innerWidth <= 768 ? '12px' : '20px' }}>
        <PageHeader
          title="Sales Analytics"
          breadcrumbs={[{ label: 'Analytics' }]}
          extra={
            <Space>
              <CalendarOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
              <Select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                style={{ width: isMobile ? 120 : 150 }}
              >
                <Option value="today">Today</Option>
                <Option value="yesterday">Yesterday</Option>
                <Option value="week">Last Week</Option>
                <Option value="2weeks">Last 2 Weeks</Option>
                <Option value="month">Last Month</Option>
                <Option value="3months">Last 3 Months</Option>
                <Option value="6months">Last 6 Months</Option>
                <Option value="year">Last Year</Option>
              </Select>
            </Space>
          }
        />

        {/* Today's Performance */}
        {dailyData && (
          <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '24px' }}>
            <AntTitle level={4} style={{ marginBottom: '16px', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}>
              <TrophyOutlined /> Today's Performance
            </AntTitle>
            <Row gutter={{ xs: 8, sm: 12, md: 16 }}>
              <Col xs={12} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Today's Revenue (UGX)"
                    value={dailyData.total_revenue_ugx}
                    prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                    suffix="UGX"
                    valueStyle={{ color: '#52c41a', fontSize: isMobile ? '18px' : '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Today's Revenue (USD)"
                    value={dailyData.total_revenue_usd}
                    prefix="$"
                    valueStyle={{ color: '#52c41a', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Today's Orders"
                    value={dailyData.total_orders}
                    prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Avg Order Value"
                    value={dailyData.avg_order_value_ugx}
                    prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                    suffix="UGX"
                    valueStyle={{ color: '#faad14', fontSize: isMobile ? '18px' : '22px' }}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    ${dailyData.avg_order_value_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </Text>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* Period Performance */}
        {periodData && (
          <>
            <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '24px' }}>
              <AntTitle level={4} style={{ marginBottom: '16px', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}>
                <LineChartOutlined /> {periodData.period_label} Summary
              </AntTitle>
              <Row gutter={{ xs: 8, sm: 12, md: 16 }}>
                <Col xs={12} sm={12} md={6}>
                  <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                    <Statistic
                      title={`Total Revenue (UGX)`}
                      value={periodData.total_revenue_ugx}
                      suffix="UGX"
                      valueStyle={{ color: '#52c41a', fontSize: isMobile ? '18px' : '22px' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {periodData.start_date} to {periodData.end_date}
                    </Text>
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                    <Statistic
                      title={`Total Revenue (USD)`}
                      value={periodData.total_revenue_usd}
                      prefix="$"
                      valueStyle={{ color: '#52c41a', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {periodData.start_date} to {periodData.end_date}
                    </Text>
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                    <Statistic
                      title={`Total Orders`}
                      value={periodData.total_orders}
                      valueStyle={{ color: '#1890ff', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {periodData.start_date} to {periodData.end_date}
                    </Text>
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                    <Statistic
                      title="Avg Order Value"
                      value={periodData.avg_order_value_ugx}
                      suffix="UGX"
                      valueStyle={{ color: '#faad14', fontSize: isMobile ? '18px' : '22px' }}
                    />
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      ${periodData.avg_order_value_usd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </Text>
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Revenue Chart */}
            <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '24px' }}>
              <Card 
                title={`Revenue Trend - ${periodData.period_label}`}
                bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '24px' }}
              >
                <div style={{ height: window.innerWidth <= 768 ? '250px' : '350px' }}>
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </Card>
            </div>

            {/* Orders Chart */}
            <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '24px' }}>
              <Card 
                title={`Orders Count - ${periodData.period_label}`}
                bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '24px' }}
              >
                <div style={{ height: window.innerWidth <= 768 ? '250px' : '350px' }}>
                  <Bar data={ordersChartData} options={chartOptions} />
                </div>
              </Card>
            </div>

            {/* Detailed Breakdown Table */}
            <Card 
              title="Detailed Breakdown"
              bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '24px' }}
            >
              <Table
                dataSource={periodData.breakdown}
                scroll={{ x: 'max-content' }}
                size={window.innerWidth <= 768 ? 'small' : 'middle'}
                pagination={{ simple: window.innerWidth <= 768, pageSize: 10 }}
                columns={[
                  {
                    title: 'Period',
                    dataIndex: 'date',
                    key: 'date',
                    render: (date) => <Tag color="blue">{date}</Tag>
                  },
                  {
                    title: 'Revenue',
                    dataIndex: 'revenue',
                    key: 'revenue',
                    render: (revenue) => (
                      <Text strong style={{ color: '#52c41a' }}>
                        UGX {(revenue || 0).toLocaleString()}
                      </Text>
                    ),
                    sorter: (a, b) => (b.revenue || 0) - (a.revenue || 0)
                  },
                  {
                    title: 'Orders',
                    dataIndex: 'orders',
                    key: 'orders',
                    render: (orders) => (
                      <Text strong style={{ color: '#1890ff' }}>
                        {orders}
                      </Text>
                    ),
                    sorter: (a, b) => b.orders - a.orders
                  }
                ]}
              />
            </Card>
          </>
        )}

        {/* Profit Analytics Section */}
        {profitData && (
          <div style={{ marginTop: window.innerWidth <= 768 ? 16 : 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: '12px' }}>
              <AntTitle level={3} style={{ margin: 0, fontSize: window.innerWidth <= 768 ? '18px' : '24px' }}>
                <FundOutlined /> Profit Analytics
              </AntTitle>
              <Space>
                <CalendarOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                <Select
                  value={selectedProfitPeriod}
                  onChange={handleProfitPeriodChange}
                  style={{ width: isMobile ? 120 : 150 }}
                >
                  <Option value="today">Today</Option>
                  <Option value="week">Last 7 Days</Option>
                  <Option value="month">This Month</Option>
                  <Option value="quarter">This Quarter</Option>
                  <Option value="year">This Year</Option>
                  <Option value="all">All Time</Option>
                </Select>
              </Space>
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: isMobile ? '12px' : '14px' }}>
              {profitData.period_label} - Based on actual sales transactions
            </Text>
            
            <Row gutter={{ xs: 8, sm: 12, md: 16 }}>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Total Revenue"
                    value={profitData.total_revenue}
                    precision={0}
                    valueStyle={{ color: '#3f8600', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    prefix="UGX"
                    suffix={<small> </small>}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Total Cost"
                    value={profitData.total_cost}
                    precision={0}
                    valueStyle={{ color: '#cf1322', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    prefix="UGX"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Gross Profit"
                    value={profitData.gross_profit}
                    precision={0}
                    valueStyle={{ color: '#1890ff', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    prefix="UGX"
                  />
                </Card>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Overall Margin"
                    value={profitData.overall_margin}
                    precision={2}
                    valueStyle={{ color: '#722ed1', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    suffix="%"
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={{ xs: 8, sm: 12, md: 16 }} style={{ marginTop: window.innerWidth <= 768 ? 12 : 16 }}>
              <Col xs={12} sm={12} md={8}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Total Expenses"
                    value={profitData.total_expenses || 0}
                    precision={0}
                    valueStyle={{ color: '#fa8c16', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    prefix="UGX"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {profitData.expenses_count || 0} records
                  </Text>
                </Card>
              </Col>
              <Col xs={12} sm={12} md={8}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Net Profit"
                    value={profitData.net_profit}
                    precision={0}
                    valueStyle={{ 
                      color: profitData.net_profit >= 0 ? '#52c41a' : '#ff4d4f', 
                      fontSize: window.innerWidth <= 768 ? '18px' : '22px',
                      fontWeight: 'bold'
                    }}
                    prefix="UGX"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Profit after expenses
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}>
                  <Statistic
                    title="Expense Ratio"
                    value={profitData.gross_profit > 0 ? ((profitData.total_expenses / profitData.gross_profit) * 100).toFixed(2) : 0}
                    precision={2}
                    valueStyle={{ color: '#fa8c16', fontSize: window.innerWidth <= 768 ? '18px' : '22px' }}
                    suffix="%"
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Expenses vs Gross Profit
                  </Text>
                </Card>
              </Col>
            </Row>

            <Row gutter={{ xs: 8, sm: 12, md: 16 }} style={{ marginTop: window.innerWidth <= 768 ? 12 : 16 }}>
              <Col xs={24} lg={12}>
                <Card 
                  title="Margin Distribution"
                  bodyStyle={{ padding: window.innerWidth <= 768 ? '16px' : '24px' }}
                  style={{ marginBottom: window.innerWidth <= 768 ? 12 : 0 }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>High Margin (&gt;30%): {profitData.margin_distribution.high_margin} products</Text>
                      <Progress
                        percent={profitData.margin_distribution.high_margin}
                        strokeColor="#52c41a"
                        showInfo={false}
                      />
                    </div>
                    <div>
                      <Text style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Medium Margin (15-30%): {profitData.margin_distribution.medium_margin} products</Text>
                      <Progress
                        percent={profitData.margin_distribution.medium_margin}
                        strokeColor="#faad14"
                        showInfo={false}
                      />
                    </div>
                    <div>
                      <Text style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Low Margin (&lt;15%): {profitData.margin_distribution.low_margin} products</Text>
                      <Progress
                        percent={profitData.margin_distribution.low_margin}
                        strokeColor="#ff4d4f"
                        showInfo={false}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title="Top 10 Most Profitable Products"
                  bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '24px' }}
                >
                  <Table
                    dataSource={profitData.top_profitable_products}
                    scroll={{ x: 'max-content', y: window.innerWidth <= 768 ? 200 : 300 }}
                    size={window.innerWidth <= 768 ? 'small' : 'middle'}
                    pagination={false}
                    columns={[
                      {
                        title: 'Product',
                        dataIndex: 'name',
                        key: 'name',
                        ellipsis: true,
                        width: 150
                      },
                      {
                        title: 'Sold',
                        dataIndex: 'total_sold',
                        key: 'total_sold',
                        render: (qty) => <Text strong style={{ color: '#1890ff' }}>{qty}</Text>,
                        sorter: (a, b) => b.total_sold - a.total_sold,
                        width: 70
                      },
                      {
                        title: 'Margin',
                        dataIndex: 'profit_margin',
                        key: 'profit_margin',
                        render: (margin) => {
                          const color = margin > 30 ? '#52c41a' : margin > 15 ? '#faad14' : '#ff4d4f'
                          return <Tag color={color}>{margin.toFixed(1)}%</Tag>
                        },
                        sorter: (a, b) => b.profit_margin - a.profit_margin,
                        width: 80
                      },
                      {
                        title: 'Total Profit',
                        dataIndex: 'total_profit',
                        key: 'total_profit',
                        render: (profit) => <Text strong style={{ color: '#52c41a' }}>UGX {profit.toLocaleString()}</Text>,
                        sorter: (a, b) => b.total_profit - a.total_profit,
                        width: 120
                      }
                    ]}
                    rowKey="_id"
                  />
            </Card>
          </Col>
        </Row>
      </div>
    )}

    {/* Weekly Profit Breakdown - Day by Day */}
    {weeklyProfitData && (
      <div style={{ marginTop: window.innerWidth <= 768 ? 20 : 32 }}>
        <AntTitle level={4} style={{ marginBottom: '16px', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}>
          <CalendarOutlined /> {weeklyProfitData.period} - Daily Profit Comparison
        </AntTitle>

        {/* Week Summary Cards */}
        <Row gutter={{ xs: 8, sm: 12, md: 16 }} style={{ marginBottom: window.innerWidth <= 768 ? 12 : 16 }}>
          <Col xs={12} sm={8} md={6}>
            <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '20px' }}>
              <Statistic
                title="Week Total Revenue"
                value={weeklyProfitData.week_totals.total_revenue}
                precision={0}
                valueStyle={{ color: '#3f8600', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                prefix="UGX"
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '20px' }}>
              <Statistic
                title="Week Gross Profit"
                value={weeklyProfitData.week_totals.total_gross_profit}
                precision={0}
                valueStyle={{ color: '#1890ff', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                prefix="UGX"
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '20px' }}>
              <Statistic
                title="Week Net Profit"
                value={weeklyProfitData.week_totals.total_net_profit}
                precision={0}
                valueStyle={{ 
                  color: weeklyProfitData.week_totals.total_net_profit >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: window.innerWidth <= 768 ? '16px' : '20px',
                  fontWeight: 'bold'
                }}
                prefix="UGX"
              />
              <Text type="secondary" style={{ fontSize: '11px' }}>After expenses</Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '20px' }}>
              <Statistic
                title="Week Margin"
                value={weeklyProfitData.week_totals.overall_margin}
                precision={2}
                valueStyle={{ color: '#722ed1', fontSize: window.innerWidth <= 768 ? '16px' : '20px' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        {/* Daily Comparison Table */}
        <Card 
          title="Day-by-Day Profit Analysis"
          bodyStyle={{ padding: window.innerWidth <= 768 ? '12px' : '24px' }}
        >
          <Table
            dataSource={weeklyProfitData.daily_breakdown}
            scroll={{ x: 'max-content' }}
            size={window.innerWidth <= 768 ? 'small' : 'middle'}
            pagination={false}
            rowKey="date"
            columns={[
              {
                title: 'Day',
                dataIndex: 'date_label',
                key: 'date_label',
                fixed: 'left',
                width: 120,
                render: (text, record) => (
                  <div>
                    <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                      {text}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '10px' }}>
                      {record.date}
                    </Text>
                  </div>
                )
              },
              {
                title: 'Revenue',
                dataIndex: 'revenue',
                key: 'revenue',
                width: 120,
                render: (value) => (
                  <Text style={{ color: '#3f8600', fontWeight: 500 }}>
                    UGX {value.toLocaleString()}
                  </Text>
                ),
                sorter: (a, b) => b.revenue - a.revenue
              },
              {
                title: 'Cost',
                dataIndex: 'cost',
                key: 'cost',
                width: 120,
                render: (value) => (
                  <Text style={{ color: '#cf1322' }}>
                    UGX {value.toLocaleString()}
                  </Text>
                ),
                sorter: (a, b) => b.cost - a.cost
              },
              {
                title: 'Gross Profit',
                dataIndex: 'gross_profit',
                key: 'gross_profit',
                width: 130,
                render: (value) => (
                  <Text strong style={{ color: '#1890ff', fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>
                    UGX {value.toLocaleString()}
                  </Text>
                ),
                sorter: (a, b) => b.gross_profit - a.gross_profit
              },
              {
                title: 'Expenses',
                dataIndex: 'expenses',
                key: 'expenses',
                width: 120,
                render: (value) => (
                  <Text style={{ color: '#fa8c16' }}>
                    UGX {value.toLocaleString()}
                  </Text>
                ),
                sorter: (a, b) => b.expenses - a.expenses
              },
              {
                title: 'Net Profit',
                dataIndex: 'net_profit',
                key: 'net_profit',
                width: 130,
                render: (value) => (
                  <Text 
                    strong 
                    style={{ 
                      color: value >= 0 ? '#52c41a' : '#ff4d4f',
                      fontSize: window.innerWidth <= 768 ? '13px' : '15px',
                      fontWeight: 'bold'
                    }}
                  >
                    UGX {value.toLocaleString()}
                  </Text>
                ),
                sorter: (a, b) => b.net_profit - a.net_profit
              },
              {
                title: 'Margin',
                dataIndex: 'profit_margin',
                key: 'profit_margin',
                width: 90,
                render: (margin) => {
                  const color = margin > 30 ? '#52c41a' : margin > 15 ? '#faad14' : '#ff4d4f'
                  return <Tag color={color} style={{ fontWeight: 'bold' }}>{margin}%</Tag>
                },
                sorter: (a, b) => b.profit_margin - a.profit_margin
              },
              {
                title: 'Orders',
                dataIndex: 'order_count',
                key: 'order_count',
                width: 80,
                render: (count) => (
                  <Tag color="blue" style={{ fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>
                    {count}
                  </Tag>
                ),
                sorter: (a, b) => b.order_count - a.order_count
              }
            ]}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                  <Table.Summary.Cell index={0}>
                    <Text strong>Weekly Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong style={{ color: '#3f8600' }}>
                      UGX {weeklyProfitData.week_totals.total_revenue.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <Text strong style={{ color: '#cf1322' }}>
                      UGX {weeklyProfitData.week_totals.total_cost.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <Text strong style={{ color: '#1890ff' }}>
                      UGX {weeklyProfitData.week_totals.total_gross_profit.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <Text strong style={{ color: '#fa8c16' }}>
                      UGX {weeklyProfitData.week_totals.total_expenses.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <Text 
                      strong 
                      style={{ 
                        color: weeklyProfitData.week_totals.total_net_profit >= 0 ? '#52c41a' : '#ff4d4f',
                        fontSize: '15px'
                      }}
                    >
                      UGX {weeklyProfitData.week_totals.total_net_profit.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <Tag color="purple" style={{ fontWeight: 'bold' }}>
                      {weeklyProfitData.week_totals.overall_margin}%
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7}>
                    <Tag color="blue" style={{ fontWeight: 'bold' }}>
                      {weeklyProfitData.week_totals.total_orders}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          {/* Daily Averages */}
          <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
            <Text strong style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px' }}>Daily Averages: </Text>
            <Text style={{ marginLeft: 8, fontSize: window.innerWidth <= 768 ? '11px' : '13px' }}>
              Revenue: <Text strong style={{ color: '#3f8600' }}>UGX {weeklyProfitData.week_averages.avg_daily_revenue.toLocaleString()}</Text>
              {' | '}
              Gross Profit: <Text strong style={{ color: '#1890ff' }}>UGX {weeklyProfitData.week_averages.avg_daily_gross_profit.toLocaleString()}</Text>
              {' | '}
              Net Profit: <Text strong style={{ color: '#52c41a' }}>UGX {weeklyProfitData.week_averages.avg_daily_net_profit.toLocaleString()}</Text>
              {' | '}
              Orders: <Text strong>{weeklyProfitData.week_averages.avg_daily_orders}</Text>
            </Text>
          </div>
        </Card>
      </div>
    )}

    <BackToTop />
  </div>
</Spin>
)
}

export default Analytics