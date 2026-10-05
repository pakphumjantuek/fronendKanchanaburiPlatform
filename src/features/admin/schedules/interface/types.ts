export interface Schedule {
  scheduleId: string
  contentId: string
  contentTitle?: string
  title: string
  startDateTime: string
  endDateTime?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  description?: string | null
  status: ScheduleStatus
  createdAt: string
}

export interface ScheduleFormData {
  contentId: string | null
  title: string
  startDateTime: string
  endDateTime?: string | null
  address?: string | null
  latitude: number | null
  longitude: number | null
  description?: string | null
  status?: ScheduleStatus
}
export type ScheduleStatus = 'Active' | 'Inactive' | 'Cancelled'
