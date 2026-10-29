import { storage } from './storage';
import { DashboardMetrics, PaymentSummaryReport, PaymentSummaryRow } from '../types/reports';
import { PaymentMethod } from '../types/sale';

const ALL_PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Other MFS'];

export const reportsService = {
  getDashboardMetrics(): DashboardMetrics {
    const sales = storage.getSales();
    const products = storage.getProducts();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

    // Only consider Completed sales for financial totals
    const completedSales = sales.filter((s) => s.status === 'Completed');
    const todayCompletedSales = completedSales.filter((s) => {
      const time = new Date(s.saleDateTime).getTime();
      return time >= startOfToday && time <= endOfToday;
    });

    const todaySalesTotal = Number(
      todayCompletedSales.reduce((acc, s) => acc + s.finalTotal, 0).toFixed(2)
    );
    const todayBillCount = todayCompletedSales.length;
    const todayAverageBill =
      todayBillCount > 0 ? Number((todaySalesTotal / todayBillCount).toFixed(2)) : 0;

    const lowStockCount = products.filter(
      (p) => p.isActive && p.currentStock <= p.lowStockThreshold
    ).length;

    // Sales by payment method for today
    const todaySalesByPayment: Record<PaymentMethod, number> = {
      Cash: 0,
      bKash: 0,
      Nagad: 0,
      'Other MFS': 0,
    };

    const todayBillsByPayment: Record<PaymentMethod, number> = {
      Cash: 0,
      bKash: 0,
      Nagad: 0,
      'Other MFS': 0,
    };

    for (const sale of todayCompletedSales) {
      if (todaySalesByPayment[sale.paymentMethod] !== undefined) {
        todaySalesByPayment[sale.paymentMethod] = Number(
          (todaySalesByPayment[sale.paymentMethod] + sale.finalTotal).toFixed(2)
        );
        todayBillsByPayment[sale.paymentMethod] += 1;
      }
    }

    // Top selling products from all completed sales
    const productStats: Record<
      string,
      { productId: string; productName: string; category: string; quantitySold: number; totalRevenue: number }
    > = {};

    for (const sale of completedSales) {
      for (const item of sale.items) {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            category: item.category,
            quantitySold: 0,
            totalRevenue: 0,
          };
        }
        productStats[item.productId].quantitySold += item.quantity;
        productStats[item.productId].totalRevenue += item.lineTotal;
      }
    }

    const topSellingProducts = Object.values(productStats)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        totalRevenue: Number(p.totalRevenue.toFixed(2)),
      }));

    // Recent 6 sales (including cancelled so cashier sees recent activity)
    const recentSales = sales.slice(0, 6).map((s) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      saleDateTime: s.saleDateTime,
      finalTotal: s.finalTotal,
      paymentMethod: s.paymentMethod,
      status: s.status,
      itemCount: s.itemCount,
      products: s.items.map((it) => ({
        productName: it.productName,
        quantity: it.quantity,
      })),
    }));

    return {
      todaySalesTotal,
      todayBillCount,
      todayAverageBill,
      lowStockCount,
      totalProductsCount: products.filter((p) => p.isActive).length,
      todaySalesByPayment,
      todayBillsByPayment,
      topSellingProducts,
      recentSales,
    };
  },

  getPaymentSummaryReport(startDate?: string, endDate?: string): PaymentSummaryReport {
    let sales = storage.getSales();

    // Payment summary must strictly reflect COMPLETED sales
    sales = sales.filter((s) => s.status === 'Completed');

    if (startDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      sales = sales.filter((s) => new Date(s.saleDateTime).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      sales = sales.filter((s) => new Date(s.saleDateTime).getTime() <= end);
    }

    const grandTotal = Number(sales.reduce((acc, s) => acc + s.finalTotal, 0).toFixed(2));
    const totalBills = sales.length;

    const rows: PaymentSummaryRow[] = ALL_PAYMENT_METHODS.map((method) => {
      const methodSales = sales.filter((s) => s.paymentMethod === method);
      const totalAmount = Number(methodSales.reduce((acc, s) => acc + s.finalTotal, 0).toFixed(2));
      const billCount = methodSales.length;
      const percentageOfTotal =
        grandTotal > 0 ? Number(((totalAmount / grandTotal) * 100).toFixed(1)) : 0;

      return {
        paymentMethod: method,
        billCount,
        totalAmount,
        percentageOfTotal,
      };
    });

    let dateRangeLabel = 'All Time';
    if (startDate && endDate) {
      dateRangeLabel = `${startDate} to ${endDate}`;
    } else if (startDate) {
      dateRangeLabel = `From ${startDate}`;
    } else if (endDate) {
      dateRangeLabel = `Until ${endDate}`;
    }

    return {
      dateRangeLabel,
      startDate: startDate || '',
      endDate: endDate || '',
      rows,
      totalBills,
      grandTotal,
    };
  },
};
