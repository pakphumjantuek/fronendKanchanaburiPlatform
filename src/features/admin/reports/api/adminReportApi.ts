import http from '@/shared/api/http'

export type ReportStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Dismissed'
export interface Report {
  reportId: string
  contentId?: string
  reviewId?: string
  targetLabel: string
  reason: string
  description?: string
  status: ReportStatus
  createdAt: string
}
export async function getReports(status?: ReportStatus | null) {
  const { data } = await http.get<Report[]>('/reports/admin', { params: { status } })
  return data
}
export async function updateReportStatus(reportId: string, status: ReportStatus) {
  const { data } = await http.patch<Report>(`/reports/${reportId}/status`, { status })
  return data
}
