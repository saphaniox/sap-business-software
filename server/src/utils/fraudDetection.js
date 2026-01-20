/**
 * Fraud Detection & Security Algorithms
 * Anomaly detection and suspicious activity monitoring
 */

/**
 * Detect anomalous transactions using statistical methods
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Suspicious transactions with risk scores
 */
export function detectFraudulentTransactions(transactions) {
  if (!transactions || transactions.length < 10) {
    return [];
  }
  
  const suspicious = [];
  
  // Calculate statistical baseline
  const amounts = transactions.map(t => t.total_amount || 0);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
  );
  
  // Analyze each transaction
  transactions.forEach(transaction => {
    const riskFactors = [];
    let riskScore = 0;
    
    // 1. Unusual amount (>3 standard deviations)
    const amount = transaction.total_amount || 0;
    const zScore = stdDev > 0 ? (amount - mean) / stdDev : 0;
    if (Math.abs(zScore) > 3) {
      riskFactors.push({
        type: 'unusual_amount',
        severity: 'high',
        message: `Transaction amount (UGX ${amount.toLocaleString()}) is ${Math.abs(zScore).toFixed(1)}σ from average`
      });
      riskScore += 30;
    }
    
    // 2. Round number amounts (potential fraud indicator)
    if (amount > 0 && amount % 100000 === 0 && amount >= 500000) {
      riskFactors.push({
        type: 'round_number',
        severity: 'low',
        message: 'Suspiciously round transaction amount'
      });
      riskScore += 10;
    }
    
    // 3. Unusual time (late night 11pm-5am)
    const hour = new Date(transaction.created_at).getHours();
    if (hour >= 23 || hour <= 5) {
      riskFactors.push({
        type: 'unusual_time',
        severity: 'medium',
        message: `Transaction at unusual hour (${hour}:00)`
      });
      riskScore += 15;
    }
    
    // 4. Very high discount (>50%)
    if (transaction.discount_percentage && transaction.discount_percentage > 50) {
      riskFactors.push({
        type: 'excessive_discount',
        severity: 'high',
        message: `Unusually high discount: ${transaction.discount_percentage}%`
      });
      riskScore += 25;
    }
    
    // 5. Missing customer information
    if (!transaction.customer_id && !transaction.customer_phone && !transaction.customer_name) {
      riskFactors.push({
        type: 'missing_customer',
        severity: 'medium',
        message: 'No customer information recorded'
      });
      riskScore += 20;
    }
    
    // 6. Negative profit margin (selling below cost)
    if (transaction.items) {
      const totalCost = transaction.items.reduce((sum, item) => 
        sum + ((item.cost_price || 0) * (item.quantity || 0)), 0
      );
      const revenue = transaction.total_amount || 0;
      if (totalCost > 0 && revenue < totalCost * 0.8) {
        riskFactors.push({
          type: 'below_cost',
          severity: 'high',
          message: 'Selling significantly below cost'
        });
        riskScore += 35;
      }
    }
    
    // 7. Rapid successive transactions (within 5 minutes)
    // This would require comparing with other transactions, handled in controller
    
    if (riskFactors.length > 0) {
      suspicious.push({
        transaction,
        riskScore,
        riskLevel: riskScore >= 50 ? 'critical' : riskScore >= 30 ? 'high' : riskScore >= 15 ? 'medium' : 'low',
        riskFactors,
        recommendation: getRiskRecommendation(riskScore, riskFactors)
      });
    }
  });
  
  // Sort by risk score (highest first)
  return suspicious.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Detect suspicious user activity patterns
 */
export function detectSuspiciousUserActivity(userActivities) {
  const suspicious = [];
  
  userActivities.forEach(user => {
    const flags = [];
    let riskScore = 0;
    
    // Multiple failed login attempts
    if (user.failedLogins && user.failedLogins > 5) {
      flags.push('Multiple failed login attempts');
      riskScore += 25;
    }
    
    // Access from unusual locations
    if (user.unusualLocations && user.unusualLocations.length > 0) {
      flags.push(`Access from ${user.unusualLocations.length} unusual locations`);
      riskScore += 20;
    }
    
    // Excessive data deletion
    if (user.deletedRecords && user.deletedRecords > 50) {
      flags.push('Excessive record deletions');
      riskScore += 30;
    }
    
    // After-hours activity
    if (user.afterHoursActivity && user.afterHoursActivity > 10) {
      flags.push('Frequent after-hours access');
      riskScore += 15;
    }
    
    // Permission escalation attempts
    if (user.permissionEscalationAttempts && user.permissionEscalationAttempts > 0) {
      flags.push('Permission escalation attempts');
      riskScore += 40;
    }
    
    if (flags.length > 0) {
      suspicious.push({
        userId: user.id,
        username: user.username,
        riskScore,
        riskLevel: riskScore >= 50 ? 'critical' : riskScore >= 30 ? 'high' : 'medium',
        flags,
        recommendation: getUserRiskRecommendation(riskScore)
      });
    }
  });
  
  return suspicious.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Analyze inventory discrepancies
 */
export function detectInventoryDiscrepancies(products, transactions) {
  const discrepancies = [];
  
  products.forEach(product => {
    const issues = [];
    let severityScore = 0;
    
    // Negative stock (should never happen)
    const stock = product.quantity_in_stock || product.quantity || 0;
    if (stock < 0) {
      issues.push({
        type: 'negative_stock',
        message: `Stock is negative: ${stock}`
      });
      severityScore += 50;
    }
    
    // Stock level doesn't match transaction history
    const productTransactions = transactions.filter(t => 
      t.items?.some(item => item.product_id === product._id?.toString())
    );
    
    if (productTransactions.length > 10) {
      const totalSold = productTransactions.reduce((sum, t) => {
        const item = t.items.find(i => i.product_id === product._id?.toString());
        return sum + (item?.quantity || 0);
      }, 0);
      
      // If sold quantity seems inconsistent with current stock
      const initialStock = product.initial_stock || 0;
      const expectedStock = initialStock - totalSold;
      const difference = Math.abs(expectedStock - stock);
      
      if (difference > stock * 0.2 && difference > 10) {
        issues.push({
          type: 'stock_mismatch',
          message: `Expected stock: ${expectedStock}, Actual: ${stock}, Difference: ${difference}`
        });
        severityScore += 30;
      }
    }
    
    // Unusual stock adjustments
    if (product.manual_adjustments && product.manual_adjustments.length > 5) {
      issues.push({
        type: 'excessive_adjustments',
        message: `${product.manual_adjustments.length} manual stock adjustments`
      });
      severityScore += 20;
    }
    
    if (issues.length > 0) {
      discrepancies.push({
        productId: product._id,
        productName: product.name,
        currentStock: stock,
        severityScore,
        severityLevel: severityScore >= 40 ? 'critical' : severityScore >= 20 ? 'high' : 'medium',
        issues,
        recommendation: 'Conduct physical inventory count and reconcile records'
      });
    }
  });
  
  return discrepancies.sort((a, b) => b.severityScore - a.severityScore);
}

/**
 * Detect duplicate or suspicious customer records
 */
export function detectDuplicateCustomers(customers) {
  const duplicates = [];
  const phoneMap = {};
  const nameMap = {};
  
  customers.forEach(customer => {
    const phone = customer.phone?.trim().toLowerCase();
    const name = customer.name?.trim().toLowerCase();
    
    // Check for duplicate phone numbers
    if (phone) {
      if (phoneMap[phone]) {
        duplicates.push({
          type: 'duplicate_phone',
          customers: [phoneMap[phone], customer],
          message: `Duplicate phone number: ${phone}`,
          recommendation: 'Merge customer records'
        });
      } else {
        phoneMap[phone] = customer;
      }
    }
    
    // Check for very similar names
    if (name) {
      const similar = Object.keys(nameMap).find(existingName => {
        const similarity = calculateStringSimilarity(name, existingName);
        return similarity > 0.85;
      });
      
      if (similar) {
        duplicates.push({
          type: 'similar_name',
          customers: [nameMap[similar], customer],
          message: `Similar customer names: "${nameMap[similar].name}" and "${customer.name}"`,
          recommendation: 'Review and merge if same customer'
        });
      } else {
        nameMap[name] = customer;
      }
    }
  });
  
  return duplicates;
}

/**
 * Calculate string similarity (Levenshtein distance)
 */
function calculateStringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function getRiskRecommendation(riskScore, riskFactors) {
  if (riskScore >= 50) {
    return 'URGENT: Review this transaction immediately. Multiple high-risk indicators detected.';
  } else if (riskScore >= 30) {
    return 'High Priority: Investigate this transaction and verify with customer.';
  } else if (riskScore >= 15) {
    return 'Medium Priority: Flag for periodic review.';
  } else {
    return 'Low Priority: Monitor for patterns.';
  }
}

function getUserRiskRecommendation(riskScore) {
  if (riskScore >= 50) {
    return 'CRITICAL: Suspend user access and conduct security audit immediately.';
  } else if (riskScore >= 30) {
    return 'High Risk: Review user activity logs and consider restricting permissions.';
  } else {
    return 'Medium Risk: Monitor user activity closely.';
  }
}

export default {
  detectFraudulentTransactions,
  detectSuspiciousUserActivity,
  detectInventoryDiscrepancies,
  detectDuplicateCustomers
};
