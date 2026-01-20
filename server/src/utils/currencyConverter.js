// Currency exchange rates (base: USD)
// For production, use a real API like exchangerate-api.com
const exchangeRates = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'UGX': 3700,
  'KES': 129,
  'TZS': 2520,
  'RWF': 1250,
  'NGN': 1550,
  'ZAR': 18.5,
  'GHS': 12.8,
  'JPY': 149,
  'CNY': 7.24,
  'INR': 83.2,
  'AUD': 1.52,
  'CAD': 1.35
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = exchangeRates[fromCurrency] || exchangeRates['USD'];
  const toRate = exchangeRates[toCurrency] || exchangeRates['USD'];
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate;
  const convertedAmount = amountInUSD * toRate;
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert all monetary fields in products collection
 */
export async function convertProductPrices(db, oldCurrency, newCurrency) {
  const productsCollection = db.collection('products');
  const products = await productsCollection.find({}).toArray();
  
  const bulkOps = products.map(product => {
    const newUnitPrice = convertCurrency(
      product.unit_price?.$numberDecimal 
        ? parseFloat(product.unit_price.$numberDecimal) 
        : product.unit_price,
      oldCurrency,
      newCurrency
    );
    
    const newCostPrice = convertCurrency(
      product.cost_price?.$numberDecimal 
        ? parseFloat(product.cost_price.$numberDecimal) 
        : product.cost_price,
      oldCurrency,
      newCurrency
    );
    
    const newProfit = newUnitPrice - newCostPrice;
    const newProfitMargin = newUnitPrice > 0 ? ((newProfit / newUnitPrice) * 100) : 0;
    
    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            unit_price: newUnitPrice,
            cost_price: newCostPrice,
            profit: newProfit,
            profit_margin: newProfitMargin
          }
        }
      }
    };
  });
  
  if (bulkOps.length > 0) {
    await productsCollection.bulkWrite(bulkOps);
  }
  
  return products.length;
}

/**
 * Convert all monetary fields in sales collection
 */
export async function convertSalesPrices(db, oldCurrency, newCurrency) {
  const salesCollection = db.collection('sales');
  const sales = await salesCollection.find({}).toArray();
  
  const bulkOps = sales.map(sale => {
    const newTotalAmount = convertCurrency(
      sale.total_amount?.$numberDecimal 
        ? parseFloat(sale.total_amount.$numberDecimal) 
        : sale.total_amount,
      oldCurrency,
      newCurrency
    );
    
    const newItems = sale.items?.map(item => ({
      ...item,
      unit_price: convertCurrency(item.unit_price, oldCurrency, newCurrency),
      total_price: convertCurrency(item.total_price, oldCurrency, newCurrency)
    })) || [];
    
    return {
      updateOne: {
        filter: { _id: sale._id },
        update: {
          $set: {
            total_amount: newTotalAmount,
            items: newItems
          }
        }
      }
    };
  });
  
  if (bulkOps.length > 0) {
    await salesCollection.bulkWrite(bulkOps);
  }
  
  return sales.length;
}

/**
 * Convert all monetary fields in expenses collection
 */
export async function convertExpensesPrices(db, oldCurrency, newCurrency) {
  const expensesCollection = db.collection('expenses');
  const expenses = await expensesCollection.find({}).toArray();
  
  const bulkOps = expenses.map(expense => {
    const newAmount = convertCurrency(
      expense.amount?.$numberDecimal 
        ? parseFloat(expense.amount.$numberDecimal) 
        : expense.amount,
      oldCurrency,
      newCurrency
    );
    
    return {
      updateOne: {
        filter: { _id: expense._id },
        update: {
          $set: {
            amount: newAmount
          }
        }
      }
    };
  });
  
  if (bulkOps.length > 0) {
    await expensesCollection.bulkWrite(bulkOps);
  }
  
  return expenses.length;
}

/**
 * Convert all monetary fields in invoices collection
 */
export async function convertInvoicesPrices(db, oldCurrency, newCurrency) {
  const invoicesCollection = db.collection('invoices');
  const invoices = await invoicesCollection.find({}).toArray();
  
  const bulkOps = invoices.map(invoice => {
    const newSubtotal = convertCurrency(
      invoice.subtotal?.$numberDecimal 
        ? parseFloat(invoice.subtotal.$numberDecimal) 
        : invoice.subtotal,
      oldCurrency,
      newCurrency
    );
    
    const newTax = convertCurrency(
      invoice.tax?.$numberDecimal 
        ? parseFloat(invoice.tax.$numberDecimal) 
        : invoice.tax,
      oldCurrency,
      newCurrency
    );
    
    const newTotal = convertCurrency(
      invoice.total?.$numberDecimal 
        ? parseFloat(invoice.total.$numberDecimal) 
        : invoice.total,
      oldCurrency,
      newCurrency
    );
    
    const newAmountPaid = convertCurrency(
      invoice.amount_paid?.$numberDecimal 
        ? parseFloat(invoice.amount_paid.$numberDecimal) 
        : invoice.amount_paid,
      oldCurrency,
      newCurrency
    );
    
    const newItems = invoice.items?.map(item => ({
      ...item,
      unit_price: convertCurrency(item.unit_price, oldCurrency, newCurrency),
      total: convertCurrency(item.total, oldCurrency, newCurrency)
    })) || [];
    
    return {
      updateOne: {
        filter: { _id: invoice._id },
        update: {
          $set: {
            subtotal: newSubtotal,
            tax: newTax,
            total: newTotal,
            amount_paid: newAmountPaid,
            balance: newTotal - newAmountPaid,
            items: newItems
          }
        }
      }
    };
  });
  
  if (bulkOps.length > 0) {
    await invoicesCollection.bulkWrite(bulkOps);
  }
  
  return invoices.length;
}

export default {
  convertCurrency,
  convertProductPrices,
  convertSalesPrices,
  convertExpensesPrices,
  convertInvoicesPrices,
  exchangeRates
};
