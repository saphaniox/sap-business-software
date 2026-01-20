import { query } from '../db/connection.js';

/**
 * GET /api/ai/sales-forecast
 * Get AI-powered sales forecasting with predictions
 */
export async function getSalesForecast(req, res) {
  try {
    const companyId = req.companyId;
    const { days = 30, product_id } = req.query;
    
    // Build WHERE clause
    let whereClause = 'WHERE company_id = ? AND status = ?';
    const params = [companyId, 'completed'];
    
    if (product_id) {
      // For MySQL, we'd need to search in the items JSON field
      whereClause += ' AND JSON_SEARCH(items, "one", ?) IS NOT NULL';
      params.push(product_id);
    }
    
    // Get historical sales data
    const [sales] = await query(
      `SELECT * FROM sales ${whereClause} ORDER BY created_at ASC`,
      params
    );
    
    if (sales.length < 7) {
      return res.json({
        success: true,
        message: 'Not enough data for accurate forecasting. Need at least 7 days of sales history.',
        historicalData: [],
        predictions: [],
        insights: {
          dataPoints: sales.length,
          minimumRequired: 7
        }
      });
    }
    
    // Group sales by date
    const salesByDate = {};
    sales.forEach(sale => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { total: 0, quantity: 0, count: 0 };
      }
      salesByDate[date].total += parseFloat(sale.total_amount) || 0;
      salesByDate[date].count += 1;
      
      // Parse items JSON
      const items = sale.items && typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
      if (items && Array.isArray(items)) {
        items.forEach(item => {
          salesByDate[date].quantity += item.quantity || 0;
        });
      }
    });
    
    // Convert to arrays for analysis
    const dates = Object.keys(salesByDate).sort();
    const salesData = dates.map(date => salesByDate[date].total);
    
    // Simple moving average calculation
    const movingAvg = salesData.map((_, idx, arr) => {
      if (idx < 6) return arr[idx];
      const window = arr.slice(idx - 6, idx + 1);
      return window.reduce((a, b) => a + b, 0) / window.length;
    });
    
    // Simple linear trend
    const n = salesData.length;
    const avgSales = salesData.reduce((a, b) => a + b, 0) / n;
    const trend = (salesData[n - 1] - salesData[0]) / n;
    
    // Generate predictions
    const predictions = [];
    for (let i = 1; i <= parseInt(days); i++) {
      predictions.push(Math.max(0, avgSales + (trend * i)));
    }
    
    // Calculate growth rate
    const avgRecentSales = salesData.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const avgPredictedSales = predictions.reduce((a, b) => a + b, 0) / predictions.length;
    const growthRate = avgRecentSales > 0 
      ? ((avgPredictedSales - avgRecentSales) / avgRecentSales) * 100 
      : 0;
    
    res.json({
      success: true,
      historical: {
        dates,
        sales: salesData.map(Math.round),
        movingAverage: movingAvg.map(Math.round)
      },
      forecast: {
        predictions: predictions.map(pred => ({
          predicted: Math.round(pred),
          lower: Math.round(pred * 0.8),
          upper: Math.round(pred * 1.2)
        })),
        trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
      },
      insights: {
        averageRecentSales: Math.round(avgRecentSales),
        predictedAverageSales: Math.round(avgPredictedSales),
        expectedGrowth: Math.round(growthRate * 10) / 10 + '%',
        confidence: salesData.length > 30 ? 'high' : salesData.length > 14 ? 'medium' : 'low'
      }
    });
    
  } catch (error) {
    console.error('Sales forecast error:', error);
    res.status(500).json({ error: 'Failed to generate sales forecast. Please try again.' });
  }
}

/**
 * GET /api/ai/inventory-recommendations
 * Get smart inventory recommendations with reorder suggestions
 */
export async function getInventoryRecommendations(req, res) {
  try {
    const companyId = req.companyId;
    
    // Get all products
    const [products] = await query(
      'SELECT * FROM products WHERE company_id = ?',
      [companyId]
    );
    
    // Get sales history for the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const [sales] = await query(
      'SELECT * FROM sales WHERE company_id = ? AND created_at >= ? AND status = ?',
      [companyId, sixtyDaysAgo, 'completed']
    );
    
    // Calculate recommendations for each product
    const recommendations = [];
    
    for (const product of products) {
      // Parse items from sales and find this product
      let totalSold = 0;
      let salesCount = 0;
      
      sales.forEach(sale => {
        const items = sale.items && typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;
        if (items && Array.isArray(items)) {
          const item = items.find(i => i.product_id === product.id);
          if (item) {
            totalSold += item.quantity || 0;
            salesCount++;
          }
        }
      });
      
      const avgDailySales = salesCount > 0 ? totalSold / 60 : 0;
      const daysUntilStockout = avgDailySales > 0 ? product.quantity / avgDailySales : 999;
      
      const recommendation = {
        product_id: product.id,
        product_name: product.name,
        current_stock: product.quantity,
        avg_daily_sales: Math.round(avgDailySales * 10) / 10,
        days_until_stockout: Math.round(daysUntilStockout),
        status: 'ok',
        action: 'monitor',
        reorder_quantity: 0
      };
      
      // Determine status and action
      if (daysUntilStockout < 7) {
        recommendation.status = 'critical';
        recommendation.action = 'reorder_immediately';
        recommendation.reorder_quantity = Math.ceil(avgDailySales * 30); // 30 days worth
      } else if (daysUntilStockout < 14) {
        recommendation.status = 'warning';
        recommendation.action = 'reorder_soon';
        recommendation.reorder_quantity = Math.ceil(avgDailySales * 30);
      } else if (product.quantity === 0) {
        recommendation.status = 'out_of_stock';
        recommendation.action = 'restock';
        recommendation.reorder_quantity = Math.ceil(avgDailySales * 30);
      }
      
      if (recommendation.status !== 'ok' || avgDailySales > 0) {
        recommendations.push(recommendation);
      }
    }
    
    // Sort by urgency
    recommendations.sort((a, b) => {
      const urgency = { critical: 3, out_of_stock: 2, warning: 1, ok: 0 };
      return urgency[b.status] - urgency[a.status];
    });
    
    res.json({
      success: true,
      recommendations: recommendations.slice(0, 50),
      summary: {
        total_products: products.length,
        critical: recommendations.filter(r => r.status === 'critical').length,
        warning: recommendations.filter(r => r.status === 'warning').length,
        out_of_stock: recommendations.filter(r => r.status === 'out_of_stock').length
      }
    });
    
  } catch (error) {
    console.error('Inventory recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate inventory recommendations.' });
  }
}

/**
 * GET /api/ai/customer-insights
 * Get AI-powered customer analytics and segmentation
 */
export async function getCustomerInsights(req, res) {
  try {
    const companyId = req.companyId;
    
    // Get all customers
    const [customers] = await query(
      'SELECT * FROM customers WHERE company_id = ?',
      [companyId]
    );
    
    // Get sales for each customer
    const customerInsights = [];
    
    for (const customer of customers) {
      const [sales] = await query(
        'SELECT * FROM sales WHERE company_id = ? AND customer_id = ? AND status = ?',
        [companyId, customer.id, 'completed']
      );
      
      const totalSpent = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
      const avgOrderValue = sales.length > 0 ? totalSpent / sales.length : 0;
      
      // Calculate recency (days since last purchase)
      const lastPurchaseDate = sales.length > 0 
        ? Math.max(...sales.map(s => new Date(s.created_at).getTime()))
        : null;
      const daysSinceLastPurchase = lastPurchaseDate
        ? Math.floor((Date.now() - lastPurchaseDate) / (1000 * 60 * 60 * 24))
        : 999;
      
      // Simple RFM segmentation
      let segment = 'inactive';
      if (sales.length > 10 && daysSinceLastPurchase < 30) {
        segment = 'champion';
      } else if (sales.length > 5 && daysSinceLastPurchase < 60) {
        segment = 'loyal';
      } else if (sales.length > 2 && daysSinceLastPurchase < 90) {
        segment = 'active';
      } else if (daysSinceLastPurchase < 180) {
        segment = 'at_risk';
      }
      
      customerInsights.push({
        customer_id: customer.id,
        customer_name: customer.name,
        email: customer.email,
        total_orders: sales.length,
        total_spent: Math.round(totalSpent),
        avg_order_value: Math.round(avgOrderValue),
        days_since_last_purchase: daysSinceLastPurchase,
        segment,
        lifetime_value: Math.round(totalSpent)
      });
    }
    
    // Sort by lifetime value
    customerInsights.sort((a, b) => b.lifetime_value - a.lifetime_value);
    
    // Calculate segment summary
    const segmentSummary = {
      champion: customerInsights.filter(c => c.segment === 'champion').length,
      loyal: customerInsights.filter(c => c.segment === 'loyal').length,
      active: customerInsights.filter(c => c.segment === 'active').length,
      at_risk: customerInsights.filter(c => c.segment === 'at_risk').length,
      inactive: customerInsights.filter(c => c.segment === 'inactive').length
    };
    
    res.json({
      success: true,
      customers: customerInsights.slice(0, 100),
      segments: segmentSummary,
      top_customers: customerInsights.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ error: 'Failed to generate customer insights.' });
  }
}

/**
 * GET /api/ai/fraud-detection
 * Detect potentially fraudulent activities
 */
export async function getFraudDetection(req, res) {
  try {
    const companyId = req.companyId;
    
    // Get recent sales (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const [sales] = await query(
      'SELECT * FROM sales WHERE company_id = ? AND created_at >= ?',
      [companyId, ninetyDaysAgo]
    );
    
    const fraudAlerts = [];
    
    // Detect unusual transaction amounts
    const amounts = sales.map(s => parseFloat(s.total_amount || 0));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length);
    
    sales.forEach(sale => {
      const amount = parseFloat(sale.total_amount || 0);
      const zScore = (amount - avgAmount) / stdDev;
      
      if (Math.abs(zScore) > 3) {
        fraudAlerts.push({
          type: 'unusual_amount',
          severity: 'high',
          sale_id: sale.id,
          customer_id: sale.customer_id,
          amount,
          avg_amount: Math.round(avgAmount),
          description: `Transaction amount is ${Math.abs(zScore).toFixed(1)}x standard deviations from average`,
          date: sale.created_at
        });
      }
    });
    
    // Detect duplicate customers (same name or email)
    const [customers] = await query(
      'SELECT * FROM customers WHERE company_id = ?',
      [companyId]
    );
    
    const customersByName = {};
    customers.forEach(customer => {
      const name = (customer.name || '').toLowerCase().trim();
      if (name) {
        if (!customersByName[name]) {
          customersByName[name] = [];
        }
        customersByName[name].push(customer);
      }
    });
    
    Object.entries(customersByName).forEach(([name, dupes]) => {
      if (dupes.length > 1) {
        fraudAlerts.push({
          type: 'duplicate_customer',
          severity: 'medium',
          customer_ids: dupes.map(d => d.id),
          name,
          count: dupes.length,
          description: `${dupes.length} customers with the same name detected`
        });
      }
    });
    
    // Detect inventory discrepancies (products with negative stock)
    const [products] = await query(
      'SELECT * FROM products WHERE company_id = ? AND quantity < 0',
      [companyId]
    );
    
    products.forEach(product => {
      fraudAlerts.push({
        type: 'inventory_discrepancy',
        severity: 'high',
        product_id: product.id,
        product_name: product.name,
        quantity: product.quantity,
        description: 'Product has negative stock quantity'
      });
    });
    
    res.json({
      success: true,
      alerts: fraudAlerts.slice(0, 50),
      summary: {
        total_alerts: fraudAlerts.length,
        high_severity: fraudAlerts.filter(a => a.severity === 'high').length,
        medium_severity: fraudAlerts.filter(a => a.severity === 'medium').length,
        by_type: {
          unusual_amount: fraudAlerts.filter(a => a.type === 'unusual_amount').length,
          duplicate_customer: fraudAlerts.filter(a => a.type === 'duplicate_customer').length,
          inventory_discrepancy: fraudAlerts.filter(a => a.type === 'inventory_discrepancy').length
        }
      }
    });
    
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({ error: 'Failed to run fraud detection.' });
  }
}
