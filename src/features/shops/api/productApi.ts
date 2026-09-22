import http from '@/shared/api/http'

// ==========================================
// 1. PRODUCT CONTRACTS & TYPES
// ==========================================
export interface Product {
  productId: string
  shopId: string
  shopName?: string
  productCategoryId: string
  productName: string
  description?: string
  price: number
  quantity: number
  imageUrl?: string
  status: string
  detailImages?: string[]
  activeDeal?: ProductDeal | null
}
export interface ProductDeal { productDealId: string; dealType: string; discountType: string; discountValue: number; remainingQuantity: number; endsAt: string }

export interface ProductCategory {
  productCategoryId: string
  categoryName: string
  status: string
}

export interface ProductFormData {
  shopId: string
  productCategoryId: string | null
  productName: string
  description: string
  price: number | null
  quantity: number | null
  imageUrl: string
  status: string
}

export interface ProductReview {
  reviewId: string
  userName: string
  rating: number
  comment: string
  reply?: string | null
  createdAt: string
}

export interface ProductReviews {
  totalCount: number
  averageRating: number
  ratingCounts?: Record<number, number>
  reviews: ProductReview[]
}

export interface CreateProductReviewData {
  orderId: string
  productId: string
  rating: number
  comment: string
}

// ==========================================
// 2. PUBLIC PRODUCT APIS
// ==========================================
export async function getPublicProducts() {
  const { data } = await http.get<Product[]>('/products')
  return data
}

export async function getShopProducts(shopId: string) {
  return (await getPublicProducts()).filter((product) => product.shopId === shopId)
}

export async function getProductCategories() {
  const { data } = await http.get<{ items: ProductCategory[] }>('/product-categories', {
    params: { page: 1, pageSize: 100 },
  })
  return data.items.filter((category) => category.status === 'Active')
}

export async function getPublicProduct(id: string) {
  const { data } = await http.get<Product>(`/products/${id}`)
  return data
}

export async function getProductReviews(productId: string) {
  const { data } = await http.get<ProductReviews>(`/product-reviews/${productId}`)
  return data
}

export async function createProductReview(reviewData: CreateProductReviewData) {
  const { data } = await http.post<ProductReview>('/product-reviews', reviewData)
  return data
}

export async function getMyReviewedProducts(orderId: string) {
  const { data } = await http.get<string[]>('/product-reviews/my-reviews', { params: { orderId } })
  return data
}

// ==========================================
// 3. MERCHANT PRODUCT APIS
// ==========================================
export async function getProducts() {
  const { data } = await http.get<Product[]>('/products')
  return data
}

export async function getProduct(id: string) {
  const { data } = await http.get<Product>(`/products/${id}`)
  return data
}

export async function createProduct(data: ProductFormData) {
  const { data: product } = await http.post<Product>('/products', data)
  return product
}

export async function updateProduct(id: string, data: ProductFormData) {
  await http.put(`/products/${id}`, data)
}

export async function removeProduct(id: string) {
  await http.delete(`/products/${id}`)
}

export async function uploadCoverImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await http.post<Product>(`/products/${id}/cover-image`, formData)
  return data
}

export async function uploadDetailImages(id: string, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  await http.post(`/products/${id}/detail-images`, formData)
}
