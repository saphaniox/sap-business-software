/**
 * AI Analytics Utilities
 * Advanced algorithms for sales forecasting, inventory optimization, and business intelligence
 */

/**
 * Calculate moving average for time series data
 * @param {Array} data - Array of numbers
 * @param {Number} period - Period for moving average
 * @returns {Array} Moving averages
 */
export function calculateMovingAverage(data, period = 7) {
  if (!data || data.length < period) return data;
  
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Linear regression for trend prediction
 * @param {Array} x - Independent variable (time)
 * @param {Array} y - Dependent variable (sales)
 * @returns {Object} Slope and intercept
 */
export function linearRegression(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Predict future values using linear regression
 * @param {Object} regression - Regression parameters
 * @param {Number} futurePoints - Number of future points to predict
 * @param {Number} lastX - Last x value
 * @returns {Array} Predicted values
 */
export function predictFuture(regression, futurePoints, lastX) {
  const predictions = [];
  for (let i = 1; i <= futurePoints; i++) {
    const x = lastX + i;
    const y = regression.slope * x + regression.intercept;
    predictions.push(Math.max(0, y)); // Ensure non-negative
  }
  return predictions;
}

/**
 * Calculate exponential smoothing for forecasting
 * @param {Array} data - Historical data
 * @param {Number} alpha - Smoothing factor (0-1)
 * @returns {Array} Smoothed values
 */
export function exponentialSmoothing(data, alpha = 0.3) {
  if (!data || data.length === 0) return [];
  
  const smoothed = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
  }
  return smoothed;
}

/**
 * Detect seasonality patterns in sales data
 * @param {Array} data - Time series data
 * @param {Number} period - Expected seasonal period (e.g., 7 for weekly)
 * @returns {Object} Seasonality analysis
 */
export function detectSeasonality(data, period = 7) {
  if (data.length < period * 2) {
    return { hasSeasonality: false, confidence: 0 };
  }
  
  const cycles = Math.floor(data.length / period);
  const seasonalAverages = Array(period).fill(0);
  const counts = Array(period).fill(0);
  
  for (let i = 0; i < data.length; i++) {
    const position = i % period;
    seasonalAverages[position] += data[i];
    counts[position]++;
  }
  
  for (let i = 0; i < period; i++) {
    seasonalAverages[i] = counts[i] > 0 ? seasonalAverages[i] / counts[i] : 0;
  }
  
  // Calculate variance to determine if seasonality exists
  const mean = seasonalAverages.reduce((a, b) => a + b, 0) / period;
  const variance = seasonalAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;
  
  return {
    hasSeasonality: coefficientOfVariation > 0.1,
    confidence: Math.min(coefficientOfVariation * 100, 100),
    pattern: seasonalAverages,
    peakDay: seasonalAverages.indexOf(Math.max(...seasonalAverages)),
    lowDay: seasonalAverages.indexOf(Math.min(...seasonalAverages))
  };
}

/**
 * Calculate sales velocity (rate of change)
 * @param {Array} sales - Sales data over time
 * @param {Number} period - Period to calculate velocity
 * @returns {Number} Sales velocity
 */
export function calculateSalesVelocity(sales, period = 7) {
  if (sales.length < period) return 0;
  
  const recent = sales.slice(-period);
  const older = sales.slice(-period * 2, -period);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 
    ? older.reduce((a, b) => a + b, 0) / older.length 
    : recentAvg;
  
  return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
}

/**
 * Identify trending products
 * @param {Array} products - Products with sales history
 * @returns {Array} Trending products sorted by growth
 */
export function identifyTrendingProducts(products) {
  return products
    .map(product => {
      const velocity = calculateSalesVelocity(product.salesHistory || [], 7);
      const recentSales = product.salesHistory 
        ? product.salesHistory.slice(-7).reduce((a, b) => a + b, 0) 
        : 0;
      
      return {
        ...product,
        velocity,
        recentSales,
        trendScore: velocity * 0.7 + (recentSales / 100) * 0.3
      };
    })
    .filter(p => p.velocity > 10) // At least 10% growth
    .sort((a, b) => b.trendScore - a.trendScore);
}

/**
 * Calculate optimal reorder point using Wilson EOQ model
 * @param {Object} params - Product parameters
 * @returns {Object} Reorder recommendations
 */
export function calculateReorderPoint(params) {
  const {
    averageDailySales,
    leadTimeDays = 7,
    safetyStockDays = 3,
    currentStock,
    orderingCost = 10000, // Fixed cost per order
    holdingCostPercent = 0.20 // 20% annual holding cost
  } = params;
  
  // Reorder point = (Average daily sales × Lead time) + Safety stock
  const reorderPoint = Math.ceil(averageDailySales * (leadTimeDays + safetyStockDays));
  
  // Economic Order Quantity (EOQ)
  const annualDemand = averageDailySales * 365;
  const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / (holdingCostPercent * params.unitCost || 1000)));
  
  // Days until stockout
  const daysUntilStockout = currentStock > 0 
    ? Math.floor(currentStock / averageDailySales) 
    : 0;
  
  return {
    reorderPoint,
    recommendedOrderQuantity: eoq,
    currentStock,
    daysUntilStockout,
    shouldReorder: currentStock <= reorderPoint,
    urgency: daysUntilStockout <= leadTimeDays ? 'high' : daysUntilStockout <= leadTimeDays * 2 ? 'medium' : 'low'
  };
}

/**
 * Detect anomalies in sales data (for fraud detection)
 * @param {Array} data - Sales data
 * @param {Number} threshold - Standard deviations for anomaly
 * @returns {Array} Anomaly indices
 */
export function detectAnomalies(data, threshold = 2) {
  if (data.length < 10) return [];
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  const anomalies = [];
  data.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push({
        index,
        value,
        zScore,
        deviation: value - mean,
        severity: zScore > 3 ? 'critical' : 'warning'
      });
    }
  });
  
  return anomalies;
}

/**
 * Calculate customer lifetime value prediction
 * @param {Object} customer - Customer data
 * @returns {Object} CLV prediction
 */
export function predictCustomerLifetimeValue(customer) {
  const {
    totalPurchases = 0,
    averageOrderValue = 0,
    purchaseFrequency = 0, // Purchases per month
    customerAgeDays = 90
  } = customer;
  
  // Simple CLV calculation
  const monthlyValue = averageOrderValue * purchaseFrequency;
  const estimatedLifetimeMonths = 24; // Assume 2-year customer lifetime
  const clv = monthlyValue * estimatedLifetimeMonths;
  
  // Churn risk based on recency
  const daysSinceLastPurchase = customer.daysSinceLastPurchase || 0;
  const expectedPurchaseInterval = purchaseFrequency > 0 ? 30 / purchaseFrequency : 30;
  const churnRisk = daysSinceLastPurchase > expectedPurchaseInterval * 2 ? 'high' : 
                     daysSinceLastPurchase > expectedPurchaseInterval ? 'medium' : 'low';
  
  return {
    estimatedCLV: Math.round(clv),
    segment: clv > 1000000 ? 'premium' : clv > 500000 ? 'high-value' : 'standard',
    churnRisk,
    monthlyValue: Math.round(monthlyValue),
    recommendedAction: churnRisk === 'high' ? 'Re-engagement campaign' : 
                        clv > 1000000 ? 'VIP treatment' : 'Standard nurturing'
  };
}

/**
 * Segment customers using RFM analysis
 * @param {Array} customers - Customer data
 * @returns {Array} Segmented customers
 */
export function segmentCustomersRFM(customers) {
  // Calculate quartiles for R, F, M
  const recencies = customers.map(c => c.daysSinceLastPurchase || 999).sort((a, b) => a - b);
  const frequencies = customers.map(c => c.totalPurchases || 0).sort((a, b) => b - a);
  const monetaries = customers.map(c => c.totalSpent || 0).sort((a, b) => b - a);
  
  const getQuartile = (arr, value, reverse = false) => {
    const q1 = arr[Math.floor(arr.length * 0.25)];
    const q2 = arr[Math.floor(arr.length * 0.50)];
    const q3 = arr[Math.floor(arr.length * 0.75)];
    
    if (reverse) {
      if (value <= q1) return 4;
      if (value <= q2) return 3;
      if (value <= q3) return 2;
      return 1;
    } else {
      if (value >= q3) return 4;
      if (value >= q2) return 3;
      if (value >= q1) return 2;
      return 1;
    }
  };
  
  return customers.map(customer => {
    const r = getQuartile(recencies, customer.daysSinceLastPurchase || 999, true);
    const f = getQuartile(frequencies, customer.totalPurchases || 0);
    const m = getQuartile(monetaries, customer.totalSpent || 0);
    
    const score = r + f + m;
    let segment;
    
    if (r >= 4 && f >= 4 && m >= 4) segment = 'Champions';
    else if (r >= 3 && f >= 3 && m >= 3) segment = 'Loyal Customers';
    else if (r >= 4 && f <= 2) segment = 'New Customers';
    else if (r <= 2 && f >= 3) segment = 'At Risk';
    else if (r <= 1 && f >= 3) segment = 'Cant Lose Them';
    else if (r <= 2 && f <= 2) segment = 'Hibernating';
    else if (r <= 1 && f <= 1) segment = 'Lost';
    else segment = 'Potential Loyalists';
    
    return {
      ...customer,
      rfmScore: { r, f, m, total: score },
      segment
    };
  });
}

/**
 * Generate personalized product recommendations
 * @param {Object} customer - Customer data
 * @param {Array} allProducts - All available products
 * @param {Array} allSales - All sales data
 * @returns {Array} Recommended products
 */
export function generateProductRecommendations(customer, allProducts, allSales) {
  // Find products frequently bought together
  const customerPurchases = allSales
    .filter(sale => sale.customer_id === customer._id.toString())
    .flatMap(sale => sale.items.map(item => item.product_id));
  
  const productCoPurchases = {};
  
  allSales.forEach(sale => {
    const products = sale.items.map(item => item.product_id);
    products.forEach((prod1, i) => {
      products.forEach((prod2, j) => {
        if (i !== j) {
          const key = `${prod1}-${prod2}`;
          productCoPurchases[key] = (productCoPurchases[key] || 0) + 1;
        }
      });
    });
  });
  
  // Score products
  const recommendations = allProducts
    .filter(product => !customerPurchases.includes(product._id.toString()))
    .map(product => {
      let score = 0;
      customerPurchases.forEach(purchasedId => {
        const key = `${purchasedId}-${product._id.toString()}`;
        score += productCoPurchases[key] || 0;
      });
      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return recommendations.map(item => ({
    ...item.product,
    recommendationReason: `Customers who bought similar items also purchased this`,
    confidenceScore: Math.min(item.score * 10, 100)
  }));
}
