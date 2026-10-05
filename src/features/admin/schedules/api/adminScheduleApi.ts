import http from '@/shared/api/http'
import type { Schedule, ScheduleFormData } from '../interface/types'

export async function getSchedules(contentId?: string) {
  const { data } = await http.get<Schedule[]>('/schedules/admin', { params: { contentId } })
  return data
}
export async function getSchedule(id: string) {
  const { data } = await http.get<Schedule>(`/schedules/admin/${id}`)
  return data
}
export async function createSchedule(data: Omit<ScheduleFormData, 'status'>) {
  const { data: result } = await http.post<Schedule>('/schedules', data)
  return result
}
export async function updateSchedule(id: string, data: ScheduleFormData) {
  await http.put(`/schedules/${id}`, data)
}
export async function archiveSchedule(id: string) {
  await http.delete(`/schedules/${id}`)
}
