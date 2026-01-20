import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Export Utilities for CSV, Excel, and PDF exports
 * Provides consistent export functionality across all tables
 */

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  // Extract headers from columns
  const headers = columns.map(col => col.title || col.dataIndex);
  
  // Create CSV rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.dataIndex];
      
      // Handle different value types
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (data, columns, filename = 'export.csv') => {
  const csv = convertToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Download Excel file using XLSX library
 */
export const downloadExcel = async (data, columns, filename = 'export.xlsx') => {
  try {
    // Dynamically import xlsx to reduce bundle size
    const XLSX = await import('xlsx');
    
    // Prepare data with headers
    const headers = columns.reduce((acc, col) => {
      acc[col.dataIndex] = col.title || col.dataIndex;
      return acc;
    }, {});

    const worksheetData = [headers, ...data];
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate and download
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Excel export error:', error);
    // Fallback to CSV
    downloadCSV(data, columns, filename.replace('.xlsx', '.csv'));
  }
};

/**
 * Download PDF file
 */
export const downloadPDF = (data, columns, filename = 'export.pdf', options = {}) => {
  const {
    title = 'Export Report',
    orientation = 'landscape',
    pageSize = 'a4',
    companyInfo = null
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });

  // Add title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 20);

  // Add company info if provided
  if (companyInfo) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let yPos = 30;
    if (companyInfo.name) {
      doc.text(companyInfo.name, 14, yPos);
      yPos += 5;
    }
    if (companyInfo.date) {
      doc.text(`Date: ${companyInfo.date}`, 14, yPos);
      yPos += 5;
    }
  }

  // Prepare table data
  const headers = columns.map(col => col.title || col.dataIndex);
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.dataIndex];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    })
  );

  // Add table
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: companyInfo ? 45 : 30,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 10 }
  });

  // Add footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(filename);
};

/**
 * Export with user choice
 */
export const exportData = (data, columns, filename, format) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}`;

  switch (format.toLowerCase()) {
    case 'csv':
      downloadCSV(data, columns, `${fullFilename}.csv`);
      break;
    case 'excel':
    case 'xlsx':
      downloadExcel(data, columns, `${fullFilename}.xlsx`);
      break;
    case 'pdf':
      downloadPDF(data, columns, `${fullFilename}.pdf`, {
        title: filename.replace(/_/g, ' ').toUpperCase()
      });
      break;
    default:
      console.error('Unsupported export format:', format);
  }
};

/**
 * Generate sales report PDF
 */
export const generateSalesReport = (salesData, options = {}) => {
  const {
    startDate,
    endDate,
    companyInfo = {}
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('SALES REPORT', 105, 20, { align: 'center' });

  // Company Info
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  if (companyInfo.name) {
    doc.text(companyInfo.name, 105, 30, { align: 'center' });
  }
  
  // Date Range
  doc.setFontSize(9);
  if (startDate && endDate) {
    doc.text(`Period: ${startDate} to ${endDate}`, 105, 38, { align: 'center' });
  } else {
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' });
  }

  // Summary Statistics
  const totalSales = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalProfit = salesData.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const avgSale = salesData.length > 0 ? totalSales / salesData.length : 0;

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 14, 50);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 14, 57);
  doc.text(`Total Profit: $${totalProfit.toFixed(2)}`, 14, 63);
  doc.text(`Average Sale: $${avgSale.toFixed(2)}`, 14, 69);
  doc.text(`Number of Transactions: ${salesData.length}`, 14, 75);

  // Sales Table
  const tableData = salesData.map(sale => [
    sale.date || '',
    sale.invoice_number || sale.id || '',
    sale.customer_name || 'Walk-in',
    `$${(sale.total || 0).toFixed(2)}`,
    `$${(sale.profit || 0).toFixed(2)}`,
    sale.payment_method || 'Cash'
  ]);

  doc.autoTable({
    head: [['Date', 'Invoice', 'Customer', 'Total', 'Profit', 'Payment']],
    body: tableData,
    startY: 85,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate inventory report PDF
 */
export const generateInventoryReport = (products, options = {}) => {
  const { companyInfo = {} } = options;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('INVENTORY REPORT', 148, 20, { align: 'center' });

  // Company Info & Date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  if (companyInfo.name) {
    doc.text(companyInfo.name, 148, 30, { align: 'center' });
  }
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 148, 38, { align: 'center' });

  // Inventory Summary
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockItems = products.filter(p => p.stock <= p.reorder_level).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 14, 50);
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Products: ${totalProducts}`, 14, 57);
  doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, 14, 63);
  doc.text(`Low Stock Items: ${lowStockItems}`, 14, 69);
  doc.text(`Out of Stock: ${outOfStock}`, 14, 75);

  // Products Table
  const tableData = products.map(product => [
    product.name || '',
    product.sku || product.id || '',
    product.category || 'N/A',
    product.stock || 0,
    product.reorder_level || 0,
    `$${(product.price || 0).toFixed(2)}`,
    `$${((product.stock || 0) * (product.price || 0)).toFixed(2)}`,
    product.stock === 0 ? 'Out' : product.stock <= product.reorder_level ? 'Low' : 'OK'
  ]);

  doc.autoTable({
    head: [['Product', 'SKU', 'Category', 'Stock', 'Reorder', 'Price', 'Value', 'Status']],
    body: tableData,
    startY: 85,
    styles: {
      fontSize: 7,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [46, 204, 113],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      7: {
        cellPadding: 2,
        fontSize: 7,
        fontStyle: 'bold'
      }
    },
    didParseCell: function(data) {
      if (data.column.index === 7 && data.section === 'body') {
        if (data.cell.raw === 'Out') {
          data.cell.styles.textColor = [231, 76, 60];
        } else if (data.cell.raw === 'Low') {
          data.cell.styles.textColor = [243, 156, 18];
        } else {
          data.cell.styles.textColor = [46, 204, 113];
        }
      }
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      148,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Print POS-style receipt
 */
export const printReceipt = (saleData, companyInfo = {}) => {
  const receiptWindow = window.open('', '_blank');
  
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${saleData.invoice_number}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          margin: 0 auto;
          padding: 10px;
          font-size: 12px;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .company-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .receipt-info {
          margin: 10px 0;
          font-size: 11px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        .items-table td {
          padding: 3px 0;
        }
        .items-table .item-name {
          width: 50%;
        }
        .items-table .item-qty {
          width: 15%;
          text-align: center;
        }
        .items-table .item-price {
          width: 35%;
          text-align: right;
        }
        .totals {
          border-top: 1px dashed #000;
          margin-top: 10px;
          padding-top: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .grand-total {
          font-size: 16px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        .receipt-footer {
          text-align: center;
          margin-top: 15px;
          border-top: 2px dashed #000;
          padding-top: 10px;
          font-size: 11px;
        }
        .no-print {
          text-align: center;
          margin-top: 20px;
        }
        .no-print button {
          padding: 10px 20px;
          margin: 5px;
          cursor: pointer;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-header">
        <div class="company-name">${companyInfo.name || 'BUSINESS NAME'}</div>
        <div>${companyInfo.address || ''}</div>
        <div>${companyInfo.phone || ''}</div>
        <div>${companyInfo.email || ''}</div>
      </div>

      <div class="receipt-info">
        <div><strong>RECEIPT</strong></div>
        <div>Invoice: ${saleData.invoice_number || 'N/A'}</div>
        <div>Date: ${saleData.date || new Date().toLocaleString()}</div>
        <div>Cashier: ${saleData.seller_name || 'N/A'}</div>
        ${saleData.customer_name ? `<div>Customer: ${saleData.customer_name}</div>` : ''}
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <td class="item-name"><strong>Item</strong></td>
            <td class="item-qty"><strong>Qty</strong></td>
            <td class="item-price"><strong>Amount</strong></td>
          </tr>
        </thead>
        <tbody>
          ${(saleData.items || []).map(item => `
            <tr>
              <td class="item-name">${item.product_name}</td>
              <td class="item-qty">${item.quantity}</td>
              <td class="item-price">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
            ${item.price ? `
              <tr>
                <td colspan="2" style="font-size: 10px; color: #666;">@ $${item.price.toFixed(2)} each</td>
                <td></td>
              </tr>
            ` : ''}
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${(saleData.subtotal || saleData.total || 0).toFixed(2)}</span>
        </div>
        ${saleData.tax ? `
          <div class="total-row">
            <span>Tax:</span>
            <span>$${saleData.tax.toFixed(2)}</span>
          </div>
        ` : ''}
        ${saleData.discount ? `
          <div class="total-row">
            <span>Discount:</span>
            <span>-$${saleData.discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>TOTAL:</span>
          <span>$${(saleData.total || 0).toFixed(2)}</span>
        </div>
        ${saleData.payment_method ? `
          <div class="total-row" style="margin-top: 10px;">
            <span>Payment Method:</span>
            <span>${saleData.payment_method}</span>
          </div>
        ` : ''}
        ${saleData.paid ? `
          <div class="total-row">
            <span>Paid:</span>
            <span>$${saleData.paid.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Change:</span>
            <span>$${(saleData.paid - saleData.total).toFixed(2)}</span>
          </div>
        ` : ''}
      </div>

      <div class="receipt-footer">
        <div>Thank you for your business!</div>
        <div style="margin-top: 5px;">Please come again</div>
        ${companyInfo.website ? `<div style="margin-top: 5px;">${companyInfo.website}</div>` : ''}
      </div>

      <div class="no-print">
        <button onclick="window.print()">Print Receipt</button>
        <button onclick="window.close()">Close</button>
      </div>
    </body>
    </html>
  `;

  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
  
  // Auto print after a short delay
  setTimeout(() => {
    receiptWindow.print();
  }, 500);
};

export default {
  convertToCSV,
  downloadCSV,
  downloadExcel,
  downloadPDF,
  exportData,
  generateSalesReport,
  generateInventoryReport,
  printReceipt
};
