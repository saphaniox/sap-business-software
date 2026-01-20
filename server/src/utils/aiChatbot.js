/**
 * AI Chatbot Assistant
 * Natural language processing for business queries
 */

/**
 * Process user query and generate intelligent response
 * @param {String} query - User's question
 * @param {Object} businessData - Current business metrics
 * @returns {Object} Response with answer and suggestions
 */
export function processQuery(query, businessData) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Sales-related queries
  if (matchesPattern(normalizedQuery, ['sales', 'revenue', 'income', 'earnings'])) {
    return handleSalesQuery(normalizedQuery, businessData);
  }
  
  // Inventory-related queries
  if (matchesPattern(normalizedQuery, ['stock', 'inventory', 'products', 'items'])) {
    return handleInventoryQuery(normalizedQuery, businessData);
  }
  
  // Customer-related queries
  if (matchesPattern(normalizedQuery, ['customer', 'client', 'buyer'])) {
    return handleCustomerQuery(normalizedQuery, businessData);
  }
  
  // Performance queries
  if (matchesPattern(normalizedQuery, ['performance', 'growth', 'trend', 'doing'])) {
    return handlePerformanceQuery(normalizedQuery, businessData);
  }
  
  // Recommendations
  if (matchesPattern(normalizedQuery, ['recommend', 'suggest', 'advice', 'should', 'what to do'])) {
    return handleRecommendationQuery(normalizedQuery, businessData);
  }
  
  // Best/worst performers
  if (matchesPattern(normalizedQuery, ['best', 'top', 'worst', 'bottom', 'performing'])) {
    return handleTopBottomQuery(normalizedQuery, businessData);
  }
  
  // Forecasting
  if (matchesPattern(normalizedQuery, ['forecast', 'predict', 'future', 'expect', 'next'])) {
    return handleForecastQuery(normalizedQuery, businessData);
  }
  
  // Help and capabilities
  if (matchesPattern(normalizedQuery, ['help', 'can you', 'what can', 'capabilities'])) {
    return getCapabilities();
  }
  
  // Default response with suggestions
  return {
    answer: "I'm your AI business assistant! I can help you with sales analysis, inventory management, customer insights, and business recommendations. What would you like to know?",
    type: 'help',
    suggestions: [
      "What are my total sales this month?",
      "Which products are low in stock?",
      "Who are my top customers?",
      "What's my sales forecast?",
      "Give me business recommendations"
    ]
  };
}

function matchesPattern(query, keywords) {
  return keywords.some(keyword => query.includes(keyword));
}

function handleSalesQuery(query, data) {
  const { totalSales, totalOrders, averageOrderValue, recentTrend } = data.sales || {};
  
  if (query.includes('today') || query.includes('daily')) {
    return {
      answer: `Today's sales performance:\n• Total Sales: UGX ${(totalSales || 0).toLocaleString()}\n• Number of Orders: ${totalOrders || 0}\n• Average Order Value: UGX ${(averageOrderValue || 0).toLocaleString()}\n\nYour sales are ${recentTrend || 'stable'} compared to yesterday.`,
      type: 'sales',
      data: { totalSales, totalOrders, averageOrderValue },
      suggestions: [
        "Show me sales forecast",
        "Compare with last week",
        "Top selling products"
      ]
    };
  }
  
  if (query.includes('week') || query.includes('month')) {
    const period = query.includes('week') ? 'this week' : 'this month';
    return {
      answer: `Sales performance for ${period}:\n• Total Revenue: UGX ${(totalSales || 0).toLocaleString()}\n• Total Orders: ${totalOrders || 0}\n• Average per Order: UGX ${(averageOrderValue || 0).toLocaleString()}\n\n${recentTrend === 'increasing' ? '📈 Sales are growing!' : recentTrend === 'decreasing' ? '📉 Sales need attention.' : '➡️ Sales are stable.'}`,
      type: 'sales',
      data: { totalSales, totalOrders },
      suggestions: [
        "What can I do to improve sales?",
        "Show top customers",
        "Sales forecast"
      ]
    };
  }
  
  return {
    answer: `Your current sales summary:\n• Total Revenue: UGX ${(totalSales || 0).toLocaleString()}\n• Orders: ${totalOrders || 0}\n• Average Value: UGX ${(averageOrderValue || 0).toLocaleString()}\n\nTrend: ${recentTrend || 'Not enough data'}`,
    type: 'sales',
    suggestions: ["Sales forecast", "Top products", "Customer insights"]
  };
}

function handleInventoryQuery(query, data) {
  const { totalProducts, lowStockCount, outOfStockCount, totalValue } = data.inventory || {};
  
  if (query.includes('low') || query.includes('reorder') || query.includes('running out')) {
    return {
      answer: `Inventory Alert:\n• ${lowStockCount || 0} products are low in stock\n• ${outOfStockCount || 0} products are out of stock\n\n${lowStockCount > 0 ? '⚠️ Immediate action needed to reorder items!' : '✅ All stock levels are healthy.'}`,
      type: 'inventory',
      urgent: lowStockCount > 0,
      data: { lowStockCount, outOfStockCount },
      suggestions: [
        "Show me which products to reorder",
        "What's my inventory value?",
        "Stock forecast"
      ]
    };
  }
  
  if (query.includes('value') || query.includes('worth')) {
    return {
      answer: `Your inventory is worth approximately UGX ${(totalValue || 0).toLocaleString()}.\n\nYou have ${totalProducts || 0} products in your catalog.\n• Low Stock: ${lowStockCount || 0}\n• Out of Stock: ${outOfStockCount || 0}`,
      type: 'inventory',
      data: { totalValue, totalProducts },
      suggestions: [
        "Which products are most valuable?",
        "Show slow-moving items",
        "Reorder recommendations"
      ]
    };
  }
  
  return {
    answer: `Inventory Overview:\n• Total Products: ${totalProducts || 0}\n• Total Value: UGX ${(totalValue || 0).toLocaleString()}\n• Low Stock Items: ${lowStockCount || 0}\n• Out of Stock: ${outOfStockCount || 0}\n\n${lowStockCount > 0 ? 'Consider reviewing your reorder points.' : 'Inventory levels look good!'}`,
    type: 'inventory',
    suggestions: ["Low stock items", "Inventory forecast", "ABC analysis"]
  };
}

function handleCustomerQuery(query, data) {
  const { totalCustomers, activeCustomers, topCustomer, atRiskCount } = data.customers || {};
  
  if (query.includes('top') || query.includes('best') || query.includes('loyal')) {
    return {
      answer: `Your top customers:\n• ${topCustomer?.name || 'No data'} - UGX ${(topCustomer?.totalSpent || 0).toLocaleString()} total spent\n• Total Customers: ${totalCustomers || 0}\n• Active: ${activeCustomers || 0}\n\nYour best customers drive ${Math.round((topCustomer?.totalSpent / (data.sales?.totalSales || 1)) * 100)}% of revenue!`,
      type: 'customers',
      data: { topCustomer, totalCustomers },
      suggestions: [
        "Show customer segmentation",
        "At-risk customers",
        "Customer lifetime value"
      ]
    };
  }
  
  if (query.includes('risk') || query.includes('churn') || query.includes('losing')) {
    return {
      answer: `Customer Retention Alert:\n• ${atRiskCount || 0} customers are at risk of churning\n• Active Customers: ${activeCustomers || 0} out of ${totalCustomers || 0}\n\n${atRiskCount > 0 ? '⚠️ Consider re-engagement campaigns for at-risk customers!' : '✅ Customer retention is healthy.'}`,
      type: 'customers',
      urgent: atRiskCount > 5,
      data: { atRiskCount, activeCustomers },
      suggestions: [
        "Show at-risk customers",
        "Re-engagement strategies",
        "Customer insights"
      ]
    };
  }
  
  return {
    answer: `Customer Overview:\n• Total Customers: ${totalCustomers || 0}\n• Active: ${activeCustomers || 0}\n• At Risk: ${atRiskCount || 0}\n\nCustomer retention rate: ${Math.round((activeCustomers / (totalCustomers || 1)) * 100)}%`,
    type: 'customers',
    suggestions: ["Top customers", "Customer segmentation", "Growth strategies"]
  };
}

function handlePerformanceQuery(query, data) {
  const { growthRate, profitMargin, trend } = data.performance || {};
  
  return {
    answer: `Business Performance:\n• Growth Rate: ${growthRate || 'N/A'}\n• Profit Margin: ${profitMargin || 'N/A'}\n• Trend: ${trend || 'Stable'}\n\n${parseFloat(growthRate) > 0 ? '📈 Your business is growing!' : parseFloat(growthRate) < 0 ? '📉 Performance needs attention.' : 'Performance is steady.'}`,
    type: 'performance',
    data: { growthRate, profitMargin, trend },
    suggestions: [
      "What can I improve?",
      "Sales forecast",
      "Cost optimization"
    ]
  };
}

function handleRecommendationQuery(query, data) {
  const recommendations = [];
  
  if (data.inventory?.lowStockCount > 0) {
    recommendations.push(`🔴 URGENT: Reorder ${data.inventory.lowStockCount} low-stock items to avoid stockouts`);
  }
  
  if (data.customers?.atRiskCount > 5) {
    recommendations.push(`⚠️ Re-engage ${data.customers.atRiskCount} at-risk customers with special offers`);
  }
  
  if (data.sales?.recentTrend === 'decreasing') {
    recommendations.push('📉 Review pricing strategy and run promotional campaigns');
  }
  
  if (data.performance?.profitMargin && parseFloat(data.performance.profitMargin) < 20) {
    recommendations.push('💰 Analyze costs and optimize pricing to improve margins');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Your business metrics look healthy!');
    recommendations.push('💡 Consider expanding your product range');
    recommendations.push('📊 Focus on customer retention programs');
  }
  
  return {
    answer: `AI Recommendations for Your Business:\n\n${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n\n')}`,
    type: 'recommendations',
    recommendations,
    suggestions: [
      "Sales strategies",
      "Inventory optimization",
      "Customer retention"
    ]
  };
}

function handleTopBottomQuery(query, data) {
  if (query.includes('product')) {
    return {
      answer: `Top Performing Products:\n${data.topProducts?.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} - ${p.quantitySold || 0} units sold`).join('\n') || 'No product data available'}\n\nFocus on promoting these bestsellers!`,
      type: 'products',
      suggestions: ["Slow-moving products", "Inventory forecast", "Pricing analysis"]
    };
  }
  
  if (query.includes('customer')) {
    return {
      answer: `Top Customers:\n${data.topCustomers?.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} - UGX ${(c.totalSpent || 0).toLocaleString()}`).join('\n') || 'No customer data'}\n\nReward your loyal customers!`,
      type: 'customers',
      suggestions: ["Customer segmentation", "Loyalty program", "VIP benefits"]
    };
  }
  
  return {
    answer: "I can show you top products, customers, or sales periods. What would you like to see?",
    type: 'clarification',
    suggestions: ["Top products", "Top customers", "Best sales days"]
  };
}

function handleForecastQuery(query, data) {
  const { predictedSales, growthRate, confidence } = data.forecast || {};
  
  return {
    answer: `Sales Forecast (Next 30 Days):\n• Predicted Revenue: UGX ${(predictedSales || 0).toLocaleString()}\n• Expected Growth: ${growthRate || 'N/A'}\n• Confidence: ${confidence || 'Medium'}\n\n${parseFloat(growthRate) > 0 ? '📈 Positive growth expected!' : 'Prepare for steady performance.'}`,
    type: 'forecast',
    data: { predictedSales, growthRate, confidence },
    suggestions: [
      "View detailed forecast",
      "Inventory planning",
      "Sales strategies"
    ]
  };
}

function getCapabilities() {
  return {
    answer: `I'm your AI Business Assistant! I can help you with:\n\n📊 Sales Analysis\n• Track sales performance\n• Compare periods\n• Identify trends\n\n📦 Inventory Management\n• Monitor stock levels\n• Reorder recommendations\n• Value tracking\n\n👥 Customer Insights\n• Top customers analysis\n• Churn risk detection\n• Segmentation\n\n🎯 Business Recommendations\n• Growth strategies\n• Cost optimization\n• Performance improvement\n\n🔮 Forecasting\n• Sales predictions\n• Demand forecasting\n• Trend analysis\n\nJust ask me anything about your business!`,
    type: 'capabilities',
    suggestions: [
      "What are my sales today?",
      "Show low stock items",
      "Who are my top customers?",
      "Give me recommendations"
    ]
  };
}

/**
 * Generate contextual follow-up questions
 */
export function generateFollowUps(responseType, businessData) {
  const followUps = {
    sales: [
      "How do my sales compare to last month?",
      "What's driving my sales growth?",
      "Show me sales by product category"
    ],
    inventory: [
      "Which products should I reorder first?",
      "What's my inventory turnover rate?",
      "Show ABC analysis of inventory"
    ],
    customers: [
      "How can I retain at-risk customers?",
      "What's the lifetime value of my customers?",
      "Show customer purchase patterns"
    ],
    performance: [
      "How can I improve my profit margins?",
      "What are my biggest expenses?",
      "Show performance trends"
    ]
  };
  
  return followUps[responseType] || [
    "What are my sales today?",
    "Show inventory status",
    "Customer insights"
  ];
}

export default {
  processQuery,
  generateFollowUps
};
