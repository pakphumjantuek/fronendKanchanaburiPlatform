export interface Shop {
  shopId: string
  ownerUserId?: string
  shopCategoryId: string
  districtId: string
  subDistrictId: string
  shopName: string
  description?: string
  phone?: string
  email?: string
  address?: string
  coverImageUrl?: string
  backgroundImageUrl?: string
  openingTime?: string
  closingTime?: string
  latitude?: number | null
  longitude?: number | null
  status: string
  categoryName?: string
  districtName?: string
  subDistrictName?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
}

export interface ShopCategory {
  shopCategoryId: string
  categoryName: string
  status: string
  hasImage?: boolean
}

export interface District {
  districtId: string
  districtName: string
}

export interface SubDistrict {
  districtId: string
  subDistrictId: string
  subDistrictName: string
  postalCode?: string
}

export interface ShopReview {
  reviewId: string
  userName?: string
  reviewerName?: string
  rating: number
  comment: string
  reply?: string | null
  createdAt: string
}

export interface ShopReviews {
  totalCount: number
  averageRating: number
  reviews: ShopReview[]
}
