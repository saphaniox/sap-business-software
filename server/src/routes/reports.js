import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDatabase } from '../db/connection.js';

const router = express.Router();

// Sales summary - total orders and revenue
router.get('/sales-summary', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    const [result] = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM sales
      WHERE company_id = ? AND status IN ('pending', 'completed')`,
      [companyId]
    );

    res.json({
      total_orders: result.total_orders || 0,
      total_sales: result.total_sales || 0,
      avg_order_value: Math.round(result.avg_order_value) || 0
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stock status - total products and inventory value
router.get('/stock-status', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    const [result] = await query(
      `SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(quantity_in_stock), 0) as total_items,
        COALESCE(SUM(quantity_in_stock * unit_price), 0) as total_value
      FROM products
      WHERE company_id = ?`,
      [companyId]
    );

    res.json({
      total_products: result.total_products || 0,
      total_items: result.total_items || 0,
      total_inventory_value: Math.round(result.total_value) || 0
    });
  } catch (error) {
    console.error('Error fetching stock status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Top products by quantity sold
router.get('/top-products', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    const results = await query(
      `SELECT 
        p.id as _id,
        p.name as product_name,
        COUNT(DISTINCT s.id) as order_count,
        COALESCE(SUM(JSON_EXTRACT(s.items, CONCAT('$[', idx, '].quantity'))), 0) as total_quantity,
        COALESCE(SUM(JSON_EXTRACT(s.items, CONCAT('$[', idx, '].item_total'))), 0) as total_revenue
      FROM products p
      JOIN sales s ON s.company_id = p.company_id
      CROSS JOIN (
        SELECT 0 as idx UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
        UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
      ) AS indices
      WHERE p.company_id = ? 
        AND s.status = 'completed'
        AND JSON_EXTRACT(s.items, CONCAT('$[', idx, '].product_id')) = p.id
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10`,
      [companyId]
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Low stock products
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    const results = await query(
      `SELECT 
        id,
        name,
        sku,
        quantity_in_stock as quantity,
        low_stock_threshold as threshold,
        unit_price as price,
        CASE 
          WHEN quantity_in_stock = 0 THEN 'critical'
          WHEN quantity_in_stock <= low_stock_threshold * 0.5 THEN 'high'
          ELSE 'medium'
        END as alert_level
      FROM products
      WHERE company_id = ? 
        AND quantity_in_stock <= low_stock_threshold
      ORDER BY quantity_in_stock ASC`,
      [companyId]
    );

    res.json({
      count: results.length,
      items: results
    });
  } catch (error) {
    console.error('Error fetching low stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sales trend - last 7 days
router.get('/sales-trend', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    const results = await query(
      `SELECT 
        DATE(order_date) as _id,
        COALESCE(SUM(total_amount), 0) as sales,
        COUNT(*) as orders
      FROM sales
      WHERE company_id = ? 
        AND order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(order_date)
      ORDER BY _id ASC`,
      [companyId]
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    res.status(500).json({ error: error.message });
  }
});

// Daily analytics - revenue and orders for today
router.get('/analytics/daily', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();
    const EXCHANGE_RATE = 3700;

    // Get today's sales data
    const [salesData] = await query(
      `SELECT 
        currency,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM sales
      WHERE company_id = ? 
        AND DATE(order_date) = CURDATE()
        AND status = 'completed'
      GROUP BY currency`,
      [companyId]
    );

    // Calculate totals for both currencies
    let totalRevenueUGX = 0;
    let totalRevenueUSD = 0;
    let totalOrders = 0;

    const salesResults = await query(
      `SELECT 
        currency,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM sales
      WHERE company_id = ? 
        AND DATE(order_date) = CURDATE()
        AND status = 'completed'
      GROUP BY currency`,
      [companyId]
    );

    salesResults.forEach(stat => {
      totalOrders += stat.total_orders;
      if (stat.currency === 'USD') {
        totalRevenueUSD += stat.total_revenue;
        totalRevenueUGX += stat.total_revenue * EXCHANGE_RATE;
      } else {
        totalRevenueUGX += stat.total_revenue;
        totalRevenueUSD += stat.total_revenue / EXCHANGE_RATE;
      }
    });

    // Get today's gross profit (simplified - from items array)
    const [profitData] = await query(
      `SELECT 
        COALESCE(SUM(JSON_EXTRACT(items, '$[*].item_profit')), 0) as gross_profit
      FROM sales
      WHERE company_id = ? 
        AND DATE(order_date) = CURDATE()
        AND status = 'completed'`,
      [companyId]
    );

    const grossProfit = profitData?.gross_profit || 0;

    // Get today's expenses
    const [expensesData] = await query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      WHERE company_id = ? 
        AND DATE(date) = CURDATE()`,
      [companyId]
    );

    const totalExpenses = expensesData?.total_expenses || 0;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      period: 'daily',
      date: new Date().toISOString().split('T')[0],
      total_revenue_ugx: Math.round(totalRevenueUGX),
      total_revenue_usd: Math.round(totalRevenueUSD * 100) / 100,
      total_orders: totalOrders,
      avg_order_value_ugx: totalOrders > 0 ? Math.round(totalRevenueUGX / totalOrders) : 0,
      avg_order_value_usd: totalOrders > 0 ? Math.round((totalRevenueUSD / totalOrders) * 100) / 100 : 0,
      gross_profit: Math.round(grossProfit),
      total_expenses: Math.round(totalExpenses),
      net_profit: Math.round(netProfit),
      exchange_rate: EXCHANGE_RATE
    });
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Period analytics - flexible time ranges
router.get('/analytics/period', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();
    const { period } = req.query;

    // Calculate date range and grouping
    let dateCondition = '';
    let groupFormat = '%Y-%m-%d';
    let periodLabel = 'Daily';

    switch (period) {
      case 'today':
        dateCondition = 'DATE(order_date) = CURDATE()';
        groupFormat = '%Y-%m-%d %H:00';
        periodLabel = 'Today (Hourly)';
        break;
      case 'yesterday':
        dateCondition = 'DATE(order_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
        groupFormat = '%Y-%m-%d %H:00';
        periodLabel = 'Yesterday (Hourly)';
        break;
      case 'week':
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        groupFormat = '%Y-%m-%d';
        periodLabel = 'Last 7 Days';
        break;
      case '2weeks':
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 14 DAY)';
        groupFormat = '%Y-%m-%d';
        periodLabel = 'Last 14 Days';
        break;
      case 'month':
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        groupFormat = '%Y-%m-%d';
        periodLabel = 'Last 30 Days';
        break;
      case '3months':
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        groupFormat = '%Y-%U';
        periodLabel = 'Last 3 Months (Weekly)';
        break;
      case '6months':
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
        groupFormat = '%Y-%U';
        periodLabel = 'Last 6 Months (Weekly)';
        break;
      case 'year':
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        groupFormat = '%Y-%m';
        periodLabel = 'Last 12 Months (Monthly)';
        break;
      default:
        dateCondition = 'order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    }

    // Get breakdown data
    const breakdown = await query(
      `SELECT 
        DATE_FORMAT(order_date, ?) as _id,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders
      FROM sales
      WHERE company_id = ? 
        AND ${dateCondition}
      GROUP BY DATE_FORMAT(order_date, ?)
      ORDER BY _id ASC`,
      [groupFormat, companyId, groupFormat]
    );

    // Get overall totals
    const EXCHANGE_RATE = 3700;
    const totals = await query(
      `SELECT 
        currency,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM sales
      WHERE company_id = ? 
        AND ${dateCondition}
      GROUP BY currency`,
      [companyId]
    );

    let totalRevenueUGX = 0;
    let totalRevenueUSD = 0;
    let totalOrders = 0;

    totals.forEach(stat => {
      totalOrders += stat.total_orders;
      if (stat.currency === 'USD') {
        totalRevenueUSD += stat.total_revenue;
        totalRevenueUGX += stat.total_revenue * EXCHANGE_RATE;
      } else {
        totalRevenueUGX += stat.total_revenue;
        totalRevenueUSD += stat.total_revenue / EXCHANGE_RATE;
      }
    });

    res.json({
      period,
      period_label: periodLabel,
      start_date: new Date(Date.now() - (period === 'today' ? 0 : 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      total_revenue_ugx: Math.round(totalRevenueUGX),
      total_revenue_usd: Math.round(totalRevenueUSD * 100) / 100,
      total_orders: totalOrders,
      avg_order_value_ugx: totalOrders > 0 ? Math.round(totalRevenueUGX / totalOrders) : 0,
      avg_order_value_usd: totalOrders > 0 ? Math.round((totalRevenueUSD / totalOrders) * 100) / 100 : 0,
      exchange_rate: EXCHANGE_RATE,
      breakdown: breakdown.map(item => ({
        date: item._id,
        revenue: item.revenue,
        orders: item.orders
      }))
    });
  } catch (error) {
    console.error('Error fetching period analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Profit analytics - product-level profit margins
router.get('/profit-analytics', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();
    const period = req.query.period || 'all';

    // Calculate date condition
    let dateCondition = '1=1';
    switch(period) {
      case 'today':
        dateCondition = 'DATE(s.order_date) = CURDATE()';
        break;
      case 'week':
        dateCondition = 's.order_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateCondition = 's.order_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case 'quarter':
        dateCondition = 's.order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        break;
      case 'year':
        dateCondition = 's.order_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
    }

    // Get product-level profit data (simplified approach)
    const salesData = await query(
      `SELECT 
        p.id as _id,
        p.name as product_name,
        p.unit_price as avg_unit_price,
        p.cost_price as avg_cost_price,
        COUNT(DISTINCT s.id) as order_count,
        COALESCE(SUM(s.total_amount), 0) as total_revenue,
        0 as total_cost,
        0 as total_profit,
        0 as profit_margin,
        0 as profit_per_unit
      FROM products p
      LEFT JOIN sales s ON s.company_id = p.company_id
      WHERE p.company_id = ? 
        AND ${dateCondition}
      GROUP BY p.id, p.name, p.unit_price, p.cost_price
      ORDER BY total_revenue DESC
      LIMIT 100`,
      [companyId]
    );

    // Calculate derived fields
    const enhancedData = salesData.map(item => {
      const costPrice = item.avg_cost_price || 0;
      const unitPrice = item.avg_unit_price || 0;
      const totalCost = costPrice * item.order_count;
      const totalProfit = item.total_revenue - totalCost;
      const profitMargin = item.total_revenue > 0 ? (totalProfit / item.total_revenue) * 100 : 0;
      const profitPerUnit = unitPrice - costPrice;

      return {
        ...item,
        total_cost: totalCost,
        total_profit: totalProfit,
        profit_margin: profitMargin,
        profit_per_unit: profitPerUnit
      };
    });

    // Calculate overall totals
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    enhancedData.forEach(item => {
      totalRevenue += item.total_revenue || 0;
      totalCost += item.total_cost || 0;
      totalProfit += item.total_profit || 0;
    });

    const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

    // Get expenses for the period
    let expenseDateCondition = '1=1';
    if (period === 'today') expenseDateCondition = 'DATE(date) = CURDATE()';
    else if (period === 'week') expenseDateCondition = 'date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    else if (period === 'month') expenseDateCondition = 'date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    else if (period === 'quarter') expenseDateCondition = 'date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
    else if (period === 'year') expenseDateCondition = 'date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';

    const [expensesData] = await query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as count
      FROM expenses
      WHERE company_id = ? 
        AND ${expenseDateCondition}`,
      [companyId]
    );

    const totalExpenses = expensesData?.total_expenses || 0;
    const expensesCount = expensesData?.count || 0;
    const netProfit = totalProfit - totalExpenses;

    // Get margin distribution
    const highMargin = enhancedData.filter(p => p.profit_margin > 30).length;
    const mediumMargin = enhancedData.filter(p => p.profit_margin > 15 && p.profit_margin <= 30).length;
    const lowMargin = enhancedData.filter(p => p.profit_margin <= 15).length;

    // Format top profitable products
    const topProfitableProducts = enhancedData
      .sort((a, b) => b.profit_margin - a.profit_margin)
      .slice(0, 10)
      .map(p => ({
        _id: p._id,
        name: p.product_name,
        profit_margin: parseFloat(p.profit_margin.toFixed(2)),
        profit: Math.round(p.profit_per_unit),
        total_sold: p.order_count,
        total_profit: Math.round(p.total_profit)
      }));

    const periodLabels = {
      today: "Today",
      week: "Last 7 Days",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year",
      all: "All Time"
    };

    res.json({
      period: period,
      period_label: periodLabels[period] || "All Time",
      total_revenue: Math.round(totalRevenue),
      total_cost: Math.round(totalCost),
      gross_profit: Math.round(totalProfit),
      total_expenses: Math.round(totalExpenses),
      expenses_count: expensesCount,
      net_profit: Math.round(netProfit),
      overall_margin: parseFloat(overallMargin.toFixed(2)),
      top_profitable_products: topProfitableProducts,
      margin_distribution: {
        high_margin: highMargin,
        medium_margin: mediumMargin,
        low_margin: lowMargin
      }
    });
  } catch (error) {
    console.error('Error fetching profit analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Weekly profit breakdown - day by day for last 7 days
router.get('/profit-weekly-breakdown', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    // Get daily breakdown for last 7 days
    const dailyData = await query(
      `SELECT 
        DATE(s.order_date) as date,
        COALESCE(SUM(s.total_amount), 0) as revenue,
        0 as cost,
        0 as gross_profit,
        COUNT(DISTINCT s.id) as order_count
      FROM sales s
      WHERE s.company_id = ? 
        AND s.order_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND s.status IN ('pending', 'completed')
      GROUP BY DATE(s.order_date)
      ORDER BY date DESC`,
      [companyId]
    );

    // Get expenses for each day
    const expensesData = await query(
      `SELECT 
        DATE(date) as date,
        COALESCE(SUM(amount), 0) as expenses
      FROM expenses
      WHERE company_id = ? 
        AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date)`,
      [companyId]
    );

    // Merge data
    const expensesMap = {};
    expensesData.forEach(e => {
      expensesMap[e.date] = e.expenses;
    });

    const weeklyData = dailyData.map((day, index) => {
      const expenses = expensesMap[day.date] || 0;
      const grossProfit = day.revenue * 0.3; // Simplified 30% margin
      const netProfit = grossProfit - expenses;
      const profitMargin = day.revenue > 0 ? (grossProfit / day.revenue) * 100 : 0;

      const dayNames = ['Today', 'Yesterday', '2 days ago', '3 days ago', '4 days ago', '5 days ago', '6 days ago'];
      const dateLabel = index < dayNames.length ? dayNames[index] : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

      return {
        date: day.date,
        date_label: dateLabel,
        full_date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        revenue: Math.round(day.revenue),
        cost: Math.round(day.revenue * 0.7), // Simplified cost
        gross_profit: Math.round(grossProfit),
        expenses: Math.round(expenses),
        net_profit: Math.round(netProfit),
        profit_margin: parseFloat(profitMargin.toFixed(2)),
        order_count: day.order_count,
        day_index: index
      };
    });

    // Calculate totals
    const weekTotals = weeklyData.reduce((acc, day) => ({
      revenue: acc.revenue + day.revenue,
      cost: acc.cost + day.cost,
      gross_profit: acc.gross_profit + day.gross_profit,
      expenses: acc.expenses + day.expenses,
      net_profit: acc.net_profit + day.net_profit,
      orders: acc.orders + day.order_count
    }), { revenue: 0, cost: 0, gross_profit: 0, expenses: 0, net_profit: 0, orders: 0 });

    const weekAverages = {
      avg_daily_revenue: Math.round(weekTotals.revenue / 7),
      avg_daily_gross_profit: Math.round(weekTotals.gross_profit / 7),
      avg_daily_net_profit: Math.round(weekTotals.net_profit / 7),
      avg_daily_orders: Math.round(weekTotals.orders / 7)
    };

    res.json({
      period: 'Last 7 Days',
      daily_breakdown: weeklyData,
      week_totals: {
        total_revenue: weekTotals.revenue,
        total_cost: weekTotals.cost,
        total_gross_profit: weekTotals.gross_profit,
        total_expenses: weekTotals.expenses,
        total_net_profit: weekTotals.net_profit,
        total_orders: weekTotals.orders,
        overall_margin: weekTotals.revenue > 0 ? parseFloat(((weekTotals.gross_profit / weekTotals.revenue) * 100).toFixed(2)) : 0
      },
      week_averages: weekAverages
    });
  } catch (error) {
    console.error('Error fetching weekly profit breakdown:', error);
    res.status(500).json({ error: error.message });
  }
});

// Product demand endpoint
router.get('/products/demand', authenticate, async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { query } = getDatabase();

    const results = await query(
      `SELECT 
        p.id,
        p.name,
        p.quantity_in_stock as current_stock,
        COUNT(DISTINCT s.id) as times_sold,
        COALESCE(SUM(s.total_amount), 0) as total_revenue
      FROM products p
      LEFT JOIN sales s ON s.company_id = p.company_id
        AND s.status = 'completed'
        AND s.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE p.company_id = ?
      GROUP BY p.id, p.name, p.quantity_in_stock
      ORDER BY times_sold DESC
      LIMIT 20`,
      [companyId]
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching product demand:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
