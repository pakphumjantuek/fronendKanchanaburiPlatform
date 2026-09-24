export type ExportFormat = 'csv' | 'pdf'
export type MerchantExportType = 'orders' | 'products' | 'payouts'

export interface MerchantExportParams {
  from?: string
  to?: string
  orderStatus?: string
  format?: ExportFormat
}
export interface ExportOption {
  value: MerchantExportType
  title: string
  description: string
  icon: string
}
