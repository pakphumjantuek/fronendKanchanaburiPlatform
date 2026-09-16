import http from '@/shared/api/http'

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

/**
 * Fetch Admin Dashboard report from backend API
 */
export async function getAdminDashboardReport(
  from?: string,
  to?: string,
): Promise<AdminDashboardReport> {
  const params: Record<string, string> = {}

  if (from) params.from = from
  if (to) params.to = to

  const { data } = await http.get<AdminDashboardReport>('/admin/dashboard', { params })

  return data
}

/**
 * Download file helper for Blob responses
 */
function downloadFile(data: Blob, defaultFilename: string) {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', defaultFilename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Export all orders (CSV/PDF)
 */
export async function exportAdminOrders(params: AdminExportParams): Promise<void> {
  const format = params.format || 'csv'
  const response = await http.get('/admin/exports/orders', {
    params: { ...params, format },
    responseType: 'blob',
  })
  const filename = `admin-orders-${new Date().toISOString().slice(0, 10)}.${format}`
  downloadFile(response.data, filename)
}

/**
 * Export sales by shop (CSV/PDF)
 */
export async function exportAdminShopSales(params: AdminExportParams): Promise<void> {
  const format = params.format || 'csv'
  const response = await http.get('/admin/exports/shop-sales', {
    params: { ...params, format },
    responseType: 'blob',
  })
  const filename = `admin-shop-sales-${new Date().toISOString().slice(0, 10)}.${format}`
  downloadFile(response.data, filename)
}

/**
 * Export payouts history (CSV/PDF)
 */
export async function exportAdminPayouts(params: AdminExportParams): Promise<void> {
  const format = params.format || 'csv'
  const response = await http.get('/admin/exports/payouts', {
    params: { ...params, format },
    responseType: 'blob',
  })
  const filename = `admin-payouts-${new Date().toISOString().slice(0, 10)}.${format}`
  downloadFile(response.data, filename)
}

/**
 * Export payment slips (CSV/PDF)
 */
export async function exportAdminPaymentSlips(params: AdminExportParams): Promise<void> {
  const format = params.format || 'csv'
  const response = await http.get('/admin/exports/payment-slips', {
    params: { ...params, format },
    responseType: 'blob',
  })
  const filename = `admin-payment-slips-${new Date().toISOString().slice(0, 10)}.${format}`
  downloadFile(response.data, filename)
}
