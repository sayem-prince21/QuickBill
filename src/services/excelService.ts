import * as XLSX from 'xlsx';
import { storage } from './storage';
import { formatDateTime } from '../config/ui.config';

export const excelService = {
  exportCompleteReport(startDate?: string, endDate?: string): void {
    let sales = storage.getSales();
    const products = storage.getProducts();

    if (startDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      sales = sales.filter((s) => new Date(s.saleDateTime).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      sales = sales.filter((s) => new Date(s.saleDateTime).getTime() <= end);
    }

    const wb = XLSX.utils.book_new();

    // --- Worksheet 1: Sales Register ---
    const salesRegisterData = sales.map((sale) => ({
      'Invoice Number': sale.invoiceNumber,
      'Sale Date & Time': formatDateTime(sale.saleDateTime),
      'Customer Name': sale.customerName || 'Walk-in',
      'Payment Method': sale.paymentMethod,
      'Subtotal (৳)': sale.subtotal,
      'Discount (৳)': sale.discountAmount,
      'Tax (৳)': sale.taxAmount,
      'Total (৳)': sale.finalTotal,
      'Status': sale.status,
      'Cancelled At': sale.cancelledAt ? formatDateTime(sale.cancelledAt) : '',
      'Cancel Reason': sale.cancelReason || '',
    }));
    const wsSales = XLSX.utils.json_to_sheet(
      salesRegisterData.length > 0
        ? salesRegisterData
        : [{ 'Invoice Number': 'No records found for selected period' }]
    );
    wsSales['!cols'] = [
      { wch: 22 }, // Invoice
      { wch: 20 }, // Date
      { wch: 18 }, // Customer
      { wch: 16 }, // Payment Method
      { wch: 14 }, // Subtotal
      { wch: 14 }, // Discount
      { wch: 12 }, // Tax
      { wch: 14 }, // Total
      { wch: 14 }, // Status
      { wch: 20 }, // Cancelled At
      { wch: 25 }, // Cancel Reason
    ];
    XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Register');

    // --- Worksheet 2: Sale Items ---
    const saleItemsData: any[] = [];
    for (const sale of sales) {
      for (const item of sale.items) {
        saleItemsData.push({
          'Invoice Number': sale.invoiceNumber,
          'Sale Date': formatDateTime(sale.saleDateTime),
          'Product Name': item.productName,
          'SKU': item.sku,
          'Category': item.category,
          'Quantity': item.quantity,
          'Sold Unit Price (৳)': item.unitPrice,
          'Price Overridden': item.isPriceOverridden ? 'YES' : 'NO',
          'Line Total (৳)': item.lineTotal,
          'Status': sale.status,
        });
      }
    }
    const wsItems = XLSX.utils.json_to_sheet(
      saleItemsData.length > 0
        ? saleItemsData
        : [{ 'Invoice Number': 'No sale items found for selected period' }]
    );
    wsItems['!cols'] = [
      { wch: 22 },
      { wch: 20 },
      { wch: 30 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsItems, 'Sale Items');

    // --- Worksheet 3: Payment Summary ---
    const completedSales = sales.filter((s) => s.status === 'Completed');
    const paymentMethods: ('Cash' | 'bKash' | 'Nagad' | 'Other MFS')[] = [
      'Cash',
      'bKash',
      'Nagad',
      'Other MFS',
    ];

    const grandTotal = completedSales.reduce((acc, s) => acc + s.finalTotal, 0);
    const paymentSummaryData: {
      'Payment Method': string;
      'Bill Count': number;
      'Total Sales Amount (৳)': number;
      'Share of Sales (%)': number;
    }[] = paymentMethods.map((pm) => {
      const pmSales = completedSales.filter((s) => s.paymentMethod === pm);
      const totalAmount = pmSales.reduce((acc, s) => acc + s.finalTotal, 0);
      return {
        'Payment Method': pm as string,
        'Bill Count': pmSales.length,
        'Total Sales Amount (৳)': Number(totalAmount.toFixed(2)),
        'Share of Sales (%)':
          grandTotal > 0 ? Number(((totalAmount / grandTotal) * 100).toFixed(1)) : 0,
      };
    });

    // Add total row
    paymentSummaryData.push({
      'Payment Method': 'TOTAL (Completed Sales)',
      'Bill Count': completedSales.length,
      'Total Sales Amount (৳)': Number(grandTotal.toFixed(2)),
      'Share of Sales (%)': 100,
    });

    const wsPayment = XLSX.utils.json_to_sheet(paymentSummaryData);
    wsPayment['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 24 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsPayment, 'Payment Summary');

    // --- Worksheet 4: Stock Report ---
    const stockReportData = products.map((prod) => ({
      'Product Name': prod.name,
      'SKU': prod.sku,
      'Category': prod.category,
      'Current Stock': prod.currentStock,
      'Selling Price (৳)': prod.sellingPrice,
      'Cost Price (৳)': prod.costPrice || 0,
      'Low Stock Threshold': prod.lowStockThreshold,
      'Stock Status':
        prod.currentStock <= 0
          ? 'OUT OF STOCK'
          : prod.currentStock <= prod.lowStockThreshold
          ? 'LOW STOCK'
          : 'HEALTHY',
      'Active': prod.isActive ? 'Active' : 'Inactive',
    }));

    const wsStock = XLSX.utils.json_to_sheet(stockReportData);
    wsStock['!cols'] = [
      { wch: 30 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 16 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, wsStock, 'Stock Report');

    // Generate filename with date
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const filename = `QuickBilling_Report_${dateStr}.xlsx`;

    // Trigger local download
    XLSX.writeFile(wb, filename);
  },
};
