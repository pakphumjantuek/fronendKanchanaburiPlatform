import http from '@/shared/api/http'

export type ExportFormat = 'csv' | 'pdf'
export type MerchantExportType = 'orders' | 'products' | 'payouts'

export interface MerchantExportParams {
  from?: string
  to?: string
  orderStatus?: string
  paymentStatus?: string
  payoutStatus?: string
  format?: ExportFormat
}

const exportPaths: Record<MerchantExportType, string> = {
  orders: '/shops/mine/exports/orders',
  products: '/shops/mine/exports/products',
  payouts: '/shops/mine/exports/payouts',
}

function downloadFile(data: Blob, filename: string) {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export async function exportMerchantReport(
  type: MerchantExportType,
  params: MerchantExportParams,
): Promise<void> {
  const format = params.format ?? 'csv'
  const response = await http.get(exportPaths[type], {
    params: { ...params, format },
    responseType: 'blob',
  })

  downloadFile(response.data, `merchant-${type}-${new Date().toISOString().slice(0, 10)}.${format}`)
}
