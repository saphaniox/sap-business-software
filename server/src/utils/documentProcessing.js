/**
 * Smart Document Processing & OCR Utilities
 * Handles receipt scanning, invoice processing, and automatic data extraction
 */

/**
 * Process uploaded document image and extract text
 * Note: For production, integrate with Tesseract.js or cloud OCR service
 * This implementation provides structure for OCR integration
 */
const processDocument = async (imagePath, documentType = 'receipt') => {
  try {
    // Placeholder for OCR integration
    // In production, use: const Tesseract = require('tesseract.js');
    
    const result = {
      success: true,
      documentType,
      extractedText: '',
      structuredData: {},
      confidence: 0,
      timestamp: new Date().toISOString()
    };

    // Process based on document type
    switch (documentType) {
      case 'receipt':
        result.structuredData = await extractReceiptData(imagePath);
        break;
      case 'invoice':
        result.structuredData = await extractInvoiceData(imagePath);
        break;
      case 'id_card':
        result.structuredData = await extractIDCardData(imagePath);
        break;
      case 'generic':
        result.structuredData = await extractGenericData(imagePath);
        break;
      default:
        result.structuredData = await extractGenericData(imagePath);
    }

    return result;
  } catch (error) {
    console.error('Document processing error:', error);
    return {
      success: false,
      error: error.message,
      documentType
    };
  }
};

/**
 * Extract structured data from receipt
 */
const extractReceiptData = async (imagePath) => {
  // Placeholder for OCR-based extraction
  // This would use Tesseract.js or similar in production
  
  return {
    merchantName: '',
    merchantAddress: '',
    merchantPhone: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    date: '',
    receiptNumber: '',
    paymentMethod: ''
  };
};

/**
 * Extract structured data from invoice
 */
const extractInvoiceData = async (imagePath) => {
  return {
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    supplierName: '',
    supplierAddress: '',
    supplierPhone: '',
    supplierEmail: '',
    customerName: '',
    customerAddress: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    notes: ''
  };
};

/**
 * Extract data from ID cards (for customer registration)
 */
const extractIDCardData = async (imagePath) => {
  return {
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    expiryDate: '',
    nationality: ''
  };
};

/**
 * Extract generic text from any document
 */
const extractGenericData = async (imagePath) => {
  return {
    text: '',
    lines: [],
    confidence: 0
  };
};

/**
 * Validate extracted data against business rules
 */
const validateExtractedData = (data, documentType) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  switch (documentType) {
    case 'receipt':
      if (!data.total || data.total <= 0) {
        validation.errors.push('Invalid or missing total amount');
        validation.isValid = false;
      }
      if (!data.date) {
        validation.warnings.push('Receipt date not found');
      }
      if (!data.items || data.items.length === 0) {
        validation.warnings.push('No items extracted from receipt');
      }
      break;

    case 'invoice':
      if (!data.invoiceNumber) {
        validation.errors.push('Invoice number is required');
        validation.isValid = false;
      }
      if (!data.total || data.total <= 0) {
        validation.errors.push('Invalid or missing total amount');
        validation.isValid = false;
      }
      if (!data.supplierName) {
        validation.warnings.push('Supplier name not found');
      }
      break;
  }

  return validation;
};

/**
 * Smart suggestions based on extracted data
 */
const generateSmartSuggestions = (extractedData, documentType, existingData = {}) => {
  const suggestions = [];

  if (documentType === 'receipt' || documentType === 'invoice') {
    // Suggest matching existing products
    if (extractedData.items && existingData.products) {
      extractedData.items.forEach(item => {
        const matches = findMatchingProducts(item, existingData.products);
        if (matches.length > 0) {
          suggestions.push({
            type: 'product_match',
            item: item.description,
            matches: matches.map(m => ({ id: m._id, name: m.name, similarity: m.similarity }))
          });
        }
      });
    }

    // Suggest customer matches
    if (extractedData.customerName && existingData.customers) {
      const customerMatches = findMatchingCustomers(extractedData.customerName, existingData.customers);
      if (customerMatches.length > 0) {
        suggestions.push({
          type: 'customer_match',
          extractedName: extractedData.customerName,
          matches: customerMatches.map(c => ({ id: c._id, name: c.name, phone: c.phone }))
        });
      }
    }

    // Suggest creating new products for unmatched items
    if (extractedData.items) {
      const unmatchedItems = extractedData.items.filter(item => {
        const matches = findMatchingProducts(item, existingData.products || []);
        return matches.length === 0;
      });

      if (unmatchedItems.length > 0) {
        suggestions.push({
          type: 'new_products',
          items: unmatchedItems.map(item => ({
            name: item.description,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }
    }
  }

  return suggestions;
};

/**
 * Find matching products using fuzzy matching
 */
const findMatchingProducts = (extractedItem, products) => {
  const matches = [];
  const searchTerm = extractedItem.description?.toLowerCase() || '';

  products.forEach(product => {
    const productName = product.name.toLowerCase();
    const similarity = calculateStringSimilarity(searchTerm, productName);

    if (similarity > 0.7) {
      matches.push({
        ...product,
        similarity: similarity
      });
    }
  });

  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
};

/**
 * Find matching customers
 */
const findMatchingCustomers = (extractedName, customers) => {
  const matches = [];
  const searchTerm = extractedName.toLowerCase();

  customers.forEach(customer => {
    const customerName = customer.name.toLowerCase();
    const similarity = calculateStringSimilarity(searchTerm, customerName);

    if (similarity > 0.7) {
      matches.push({
        ...customer,
        similarity: similarity
      });
    }
  });

  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
};

/**
 * Calculate string similarity using Levenshtein distance
 */
const calculateStringSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
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
};

/**
 * Auto-create expense entry from receipt
 */
const createExpenseFromReceipt = (receiptData, companyId, userId) => {
  return {
    company_id: companyId,
    date: receiptData.date || new Date().toISOString(),
    category: 'Supplies', // Default category
    description: `Expense from receipt: ${receiptData.merchantName || 'Unknown'}`,
    amount: receiptData.total,
    payment_method: receiptData.paymentMethod || 'Cash',
    receipt_number: receiptData.receiptNumber || '',
    notes: `Auto-created from OCR. Merchant: ${receiptData.merchantName}`,
    created_by: userId,
    created_at: new Date().toISOString(),
    metadata: {
      source: 'ocr',
      merchantName: receiptData.merchantName,
      merchantPhone: receiptData.merchantPhone,
      items: receiptData.items
    }
  };
};

/**
 * Auto-create purchase order from invoice
 */
const createPurchaseFromInvoice = (invoiceData, companyId, userId) => {
  return {
    company_id: companyId,
    supplier: invoiceData.supplierName,
    supplier_contact: invoiceData.supplierPhone || invoiceData.supplierEmail || '',
    invoice_number: invoiceData.invoiceNumber,
    invoice_date: invoiceData.invoiceDate || new Date().toISOString(),
    due_date: invoiceData.dueDate || '',
    items: invoiceData.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.price,
      total: item.quantity * item.price
    })),
    subtotal: invoiceData.subtotal,
    tax: invoiceData.tax,
    discount: invoiceData.discount,
    total: invoiceData.total,
    notes: invoiceData.notes || 'Auto-created from OCR',
    created_by: userId,
    created_at: new Date().toISOString(),
    metadata: {
      source: 'ocr',
      supplierAddress: invoiceData.supplierAddress
    }
  };
};

/**
 * Get document processing statistics
 */
const getProcessingStats = async (db, companyId, dateRange = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // In production, track OCR usage in a dedicated collection
    // For now, return placeholder stats
    
    return {
      totalProcessed: 0,
      successRate: 0,
      documentTypes: {
        receipts: 0,
        invoices: 0,
        idCards: 0,
        generic: 0
      },
      autoCreatedEntries: {
        expenses: 0,
        purchases: 0
      },
      averageConfidence: 0,
      processingTime: {
        average: 0,
        total: 0
      }
    };
  } catch (error) {
    console.error('Error getting processing stats:', error);
    return null;
  }
};

export {
  processDocument,
  extractReceiptData,
  extractInvoiceData,
  extractIDCardData,
  extractGenericData,
  validateExtractedData,
  generateSmartSuggestions,
  createExpenseFromReceipt,
  createPurchaseFromInvoice,
  getProcessingStats,
  calculateStringSimilarity
};
