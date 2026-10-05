export interface AdminDashboardSummary {
  totalSales: number
  totalOrders: number
  paidOrders: number
  pendingPayoutAmount: number
  totalUsers: number
  activeShops: number
  lowStockProducts: number
}

export interface AdminOrderStatusCounts {
  pendingPayment: number
  pendingVerification: number
  processing: number
  shipped: number
  completed: number
  cancelled: number
}

export interface AdminSalesTrend {
  date: string
  sales: number
  orders: number
}

export interface AdminRecentOrder {
  orderId: string
  orderNumber: string
  shopName: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
}

export interface AdminTopShop {
  shopId: string
  shopName: string
  sales: number
  paidOrders: number
}

export interface AdminDashboardAlerts {
  pendingSlips: number
  pendingPayoutOrders: number
  pendingShipmentOrders: number
}

export interface AdminDashboardReport {
  from: string
  to: string
  summary: AdminDashboardSummary
  orderStatusCounts: AdminOrderStatusCounts
  salesTrend: AdminSalesTrend[]
  recentOrders: AdminRecentOrder[]
  topShops: AdminTopShop[]
  alerts: AdminDashboardAlerts
}

export interface AdminExportParams {
  from?: string
  to?: string
  shopId?: string
  orderStatus?: string
  paymentStatus?: string
  payoutStatus?: string
  format?: 'csv' | 'pdf'
}
