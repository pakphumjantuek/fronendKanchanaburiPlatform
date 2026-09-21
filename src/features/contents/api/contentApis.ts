import http from '@/shared/api/http'
import type { PagedResult } from '@/shared/interface/PagedResult'

// ==========================================
// 1. MASTER & LOCATION TYPES & APIS
// ==========================================
export interface District {
  districtId: string
  districtName: string
}

export interface SubDistrict {
  subDistrictId: string
  subDistrictName: string
}

export interface Tag {
  tagId: string
  tagName: string
}

export interface ContentCategory {
  contentCategoryId: string
  categoryName: string
  description?: string
  status?: string
}

export interface ContentTag {
  tagId: string
  tagName: string
  status: string
}

export interface ContentShopOption {
  shopId: string
  shopName: string
}

export async function getContentCategories() {
  const { data } = await http.get<PagedResult<ContentCategory>>('/content-categories', {
    params: { page: 1, pageSize: 100 },
  })
  return data.items
}

export async function getDistricts() {
  const { data } = await http.get<District[]>('/locations/districts')
  return data
}

export async function getSubDistricts(districtId: string) {
  const { data } = await http.get<SubDistrict[]>(`/locations/districts/${districtId}/sub-districts`)
  return data
}

export async function getTags() {
  const { data } = await http.get<Tag[]>('/tags')
  return data
}

export async function getShops() {
  const { data } = await http.get<PagedResult<ContentShopOption> | ContentShopOption[]>('/shops', {
    params: { page: 1, pageSize: 200 },
  })
  if (data && typeof data === 'object' && 'items' in data) {
    return data.items || []
  }
  return (data as ContentShopOption[]) || []
}

// ==========================================
// 2. PUBLIC CONTENT TYPES & APIS
// ==========================================
export interface PublicContent {
  contentId: string
  shopId?: string
  contentCategoryId: string
  contentCategoryName?: string
  districtId?: string
  districtName?: string
  subDistrictId?: string
  subDistrictName?: string
  shopName?: string
  title: string
  summary?: string
  latitude?: number | null
  longitude?: number | null
  youtubeUrl?: string
  status: string
  publishedAt?: string
  createdAt: string
  updatedAt?: string
  viewCount?: number
  tags: ContentTag[]
}

export interface PublicContentParams {
  search?: string
  categoryId?: string
  districtId?: string
  subDistrictId?: string
  tagId?: string
  shopId?: string
  sortBy?: string
  page?: number
  pageSize?: number
}

export async function getPublicContents(params: PublicContentParams) {
  const { data } = await http.get<PagedResult<PublicContent>>('/contents', { params })
  return data
}

export async function getPublicContent(id: string) {
  const { data } = await http.get<PublicContent>(`/contents/${id}`)
  return data
}

export interface ContentSchedule {
  scheduleId: string
  title: string
  startDateTime: string
  endDateTime?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  description?: string | null
  status: string
}

export async function getContentSchedules(contentId: string) {
  const { data } = await http.get<ContentSchedule[]>('/schedules', { params: { contentId } })
  return data
}

export async function getMyContentSchedules(contentId: string) {
  const { data } = await http.get<ContentSchedule[]>('/schedules/mine', {
    params: { contentId },
  })
  return data
}

export interface ContentShopProduct {
  productId: string
  shopId: string
  productName: string
  description?: string
  price: number
  quantity: number
  imageUrl?: string
}

export async function getContentShopProducts(contentId: string) {
  const { data } = await http.get<ContentShopProduct[]>(`/contents/${contentId}/shop-products`, {
    params: { take: 4 },
  })
  return data
}

export async function recordContentView(contentId: string) {
  await http.post(`/content-views/${contentId}`)
}

export async function getContentFavoriteStatus(contentId: string) {
  const { data } = await http.get<{ isFavorite: boolean }>(`/content-favorites/${contentId}`)
  return data.isFavorite
}

export async function addContentFavorite(contentId: string) {
  await http.post(`/content-favorites/${contentId}`)
}

export async function removeContentFavorite(contentId: string) {
  await http.delete(`/content-favorites/${contentId}`)
}

export interface ContentReview {
  reviewId: string
  comment: string
  userName: string
  createdAt: string
}

export interface ContentReviews {
  totalCount: number
  reviews: ContentReview[]
}

export async function getContentReviews(contentId: string) {
  const { data } = await http.get<ContentReviews>(`/content-reviews/${contentId}`)
  return data
}

export async function getMyContentReview(contentId: string) {
  try {
    const { data } = await http.get<ContentReview>(`/content-reviews/mine/${contentId}`)
    return data
  } catch {
    return null
  }
}

export async function saveContentReview(contentId: string, data: { comment: string }) {
  const { data: result } = await http.post<ContentReview>(`/content-reviews/${contentId}`, data)
  return result
}

export async function deleteContentReview(reviewId: string) {
  await http.delete(`/content-reviews/${reviewId}`)
}

export async function createReport(data: {
  contentId?: string
  reviewId?: string
  reason: string
  description?: string
}) {
  await http.post('/reports', data)
}

// ==========================================
// 3. USER / MERCHANT CONTENT TYPES & APIS
// ==========================================
export type SubmissionStatus = 'Draft' | 'Pending' | 'Published' | 'Archived'

export interface UserContent {
  contentId: string
  shopId?: string | null
  contentCategoryId: string
  contentCategoryName?: string
  districtId?: string | null
  districtName?: string
  subDistrictId?: string | null
  subDistrictName?: string
  title: string
  summary?: string | null
  latitude?: number | null
  longitude?: number | null
  youtubeUrl?: string | null
  status: SubmissionStatus
  createdAt: string
  updatedAt: string
}

export interface UserContentFormData {
  title: string
  summary: string
  contentCategoryId: string | null
  shopId?: string | null
  districtId: string | null
  subDistrictId: string | null
  latitude: number | null
  longitude: number | null
  youtubeUrl: string
  status?: SubmissionStatus
}

export async function getMyContents(params: { page: number; pageSize: number }) {
  const { data } = await http.get<PagedResult<UserContent>>('/contents/mine', { params })
  return data
}

export async function getMyContent(id: string) {
  const { data } = await http.get<UserContent>(`/contents/mine/${id}`)
  return data
}

export async function createMyContent(data: UserContentFormData) {
  const payload = {
    ...data,
    status: data.status || 'Published',
  }
  const { data: result } = await http.post<UserContent>('/contents', payload)
  return result
}

export async function updateMyContent(id: string, data: UserContentFormData) {
  const payload = {
    ...data,
    status: data.status || 'Published',
  }
  await http.put(`/contents/${id}`, payload)
}

export async function archiveMyContent(id: string) {
  await http.delete(`/contents/${id}`)
}
