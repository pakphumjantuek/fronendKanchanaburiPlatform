# ระบบผู้ดูแลระบบ (Admin System Interfaces & API Specifications)
**Kanchanaburi Tourism & Shop Platform**

เอกสารฉบับนี้รวบรวม **Interface**, **Type Definitions**, **Route Paths** และ **API Endpoints** ทั้งหมดสำหรับระบบผู้ดูแลระบบ (Admin) โดยจำแนกตามระบบย่อย (Sub-systems) ทั้ง 13 ระบบ เพื่อให้ฝั่ง Frontend และ Backend ใช้เป็นมาตรฐานเดียวกันในการพัฒนา

---

## 📑 สารบัญระบบย่อย (Sub-systems Overview)

1. [ระบบภาพรวมและรายงานผู้บริหาร (Admin Dashboard & Exports)](#1-ระบบภาพรวมและรายงานผู้บริหาร-admin-dashboard--exports)
2. [ระบบจัดการสลิปและยืนยันการชำระเงิน (Order Slip Verification)](#2-ระบบจัดการสลิปและยืนยันการชำระเงิน-order-slip-verification)
(#3-ระบบจัดการโอนเงินให้ร้านค้า-merchant-pa3. [ระบบจัดการโอนเงินให้ร้านค้า (Merchant Payout Management)]yout-management)
4. [ระบบจัดการร้านค้า (Shop Management)](#4-ระบบจัดการร้านค้า-shop-management)
5. [ระบบจัดการสินค้าในร้านค้า (Product Management)](#5-ระบบจัดการสินค้าในร้านค้า-product-management)
6. [ระบบจัดการหมวดหมู่ร้านค้า (Shop Category Management)](#6-ระบบจัดการหมวดหมู่ร้านค้า-shop-category-management)
7. [ระบบจัดการหมวดหมู่สินค้า (Product Category Management)](#7-ระบบจัดการหมวดหมู่สินค้า-product-category-management)
8. [ระบบจัดการเนื้อหา/ท่องเที่ยว (Content Management)](#8-ระบบจัดการเนื้อหาท่องเที่ยว-content-management)
9. [ระบบจัดการหมวดหมู่เนื้อหา (Content Category Management)](#9-ระบบจัดการหมวดหมู่เนื้อหา-content-category-management)
10. [ระบบจัดการแท็ก (Tag Management)](#10-ระบบจัดการแท็ก-tag-management)
11. [ระบบผูกแท็กกับเนื้อหา (Content Tag Binding)](#11-ระบบผูกแท็กกับเนื้อหา-content-tag-binding)
12. [ระบบจัดการตารางกิจกรรม/ปฏิทิน (Schedule Management)](#12-ระบบจัดการตารางกิจกรรมปฏิทิน-schedule-management)
13. [ระบบจัดการรายงานการร้องเรียน (Report & Violation Management)](#13-ระบบจัดการรายงานการร้องเรียน-report--violation-management)

---

## 🔒 ข้อกำหนดและสิทธิ์การเข้าถึง (Authentication & Standard Types)

### Route Guards & Authorization
* **Base Path**: `/admin`
* **Route Layout**: `AdminLayout.vue`
* **Required Guard**: `requiresAuth: true`, `requiresAdmin: true` (`auth.user?.role === 'Admin'`)

### Standard Generic Interface: PagedResult<T>
```typescript
export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
```

---

## 1. ระบบภาพรวมและรายงานผู้บริหาร (Admin Dashboard & Exports)

### 📍 Routes & View
* **Dashboard View**: `/admin/dashboard` (`AdminDashboardView.vue`)

### 📐 Interfaces & Types

```typescript
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
```

### 🌐 API Endpoints

| Method | Endpoint | Query Parameters | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `from?: string`, `to?: string` | `AdminDashboardReport` | ดึงข้อมูลสถิติภาพรวม ยอดขาย ออเดอร์ล่าสุด และการแจ้งเตือน |
| `GET` | `/api/admin/exports/orders` | `AdminExportParams` | `Blob` (File Download) | ส่งออกรายงานรายการสั่งซื้อ (CSV / PDF) |
| `GET` | `/api/admin/exports/shop-sales` | `AdminExportParams` | `Blob` (File Download) | ส่งออกรายงานยอดขายตามร้านค้า (CSV / PDF) |
| `GET` | `/api/admin/exports/payouts` | `AdminExportParams` | `Blob` (File Download) | ส่งออกรายงานประวัติการโอนเงินให้ร้านค้า (CSV / PDF) |
| `GET` | `/api/admin/exports/payment-slips` | `AdminExportParams` | `Blob` (File Download) | ส่งออกรายการตรวจสอบสลิปชำระเงิน (CSV / PDF) |

---

## 2. ระบบจัดการสลิปและยืนยันการชำระเงิน (Order Slip Verification)

### 📍 Routes & View
* **Orders Verification View**: `/admin/orders` (`AdminOrdersView.vue`)

### 📐 Interfaces & Types

```typescript
export interface OrderItem {
  orderItemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDto {
  orderId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  orderNumber: string
  subtotal: number
  shippingFee: number
  totalAmount: number
  shippingMethod: string
  orderStatus: string
  paymentStatus: string
  slipImageUrl?: string
  slipUploadedAt?: string
  createdAt: string
  receiverName?: string
  receiverPhone?: string
  items: OrderItem[]
}

export interface AdminPendingSlipGroup {
  slipImageUrl: string
  slipUploadedAt?: string
  totalGroupAmount: number
  buyerName?: string
  buyerPhone?: string
  orders: OrderDto[]
}

export interface VerifySlipPayload {
  orderIds: string[]
  action: 'Approve' | 'Reject'
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/admin/pending-slips` | - | `AdminPendingSlipGroup[]` | ดึงรายการกลุ่มสลิปชำระเงินที่รออนุมัติ |
| `POST` | `/api/orders/admin/verify-slip` | `VerifySlipPayload` | `{ message: string }` | อนุมัติ (`Approve`) หรือ ปฏิเสธ (`Reject`) สลิปการชำระเงิน |

---

## 3. ระบบจัดการโอนเงินให้ร้านค้า (Merchant Payout Management)

### 📍 Routes & View
* **Payouts View**: `/admin/payouts` (`AdminPayoutsView.vue`)

### 📐 Interfaces & Types

```typescript
export interface AdminMerchantPayoutGroup {
  shopId: string
  shopName: string
  shopLogoUrl?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
  totalSalesAmount: number
  paidOrdersCount: number
  orders: OrderDto[]
}

export interface MerchantPayoutRecord {
  payoutId: string
  shopId: string
  shopName?: string
  shopLogoUrl?: string
  totalAmount: number
  slipImageUrl?: string
  transactionRef?: string
  note?: string
  status: string
  createdAt: string
  ordersCount: number
  orders: OrderDto[]
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Header / Payload | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/orders/admin/payouts` | - | `AdminMerchantPayoutGroup[]` | ดึงรายการสั่งจ่ายเงินให้ร้านค้าที่รอดำเนินการ |
| `GET` | `/api/orders/admin/payouts/history` | - | `MerchantPayoutRecord[]` | ดึงประวัติการโอนเงินให้ร้านค้าที่สำเร็จแล้ว |
| `POST` | `/api/orders/admin/payouts/confirm` | `multipart/form-data`<br>- `shopId`: string<br>- `orderIds`: string (comma-separated)<br>- `transactionRef`?: string<br>- `note`?: string<br>- `slipFile`?: File | `{ message: string }` | ยืนยันการโอนเงินให้ร้านค้า พร้อมแนบหลักฐานสลิปการโอน |

---

## 4. ระบบจัดการร้านค้า (Shop Management)

### 📍 Routes & View
* **Shop List View**: `/admin/shops` (`AdminShopListView.vue`)

### 📐 Interfaces & Types

```typescript
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
  status: 'Pending' | 'Active' | 'Suspended' | 'Closed' | string
  categoryName?: string
  districtName?: string
  subDistrictName?: string
  bankName?: string
  bankAccountName?: string
  bankAccountNumber?: string
  promptPay?: string
}
```

### 🌐 API Endpoints

| Method | Endpoint | Query / Body Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/shops/admin` | Query: `search?: string`, `status?: string`, `page: number`, `pageSize: number` | `PagedResult<Shop>` | ค้นหาและดึงรายการร้านค้าทั้งหมดในระบบ |
| `PATCH` | `/api/shops/{id}/status` | Body: `{ status: string }` | `void` | อัปเดตสถานะร้านค้า (เช่น `Active`, `Suspended`, `Rejected`) |

---

## 5. ระบบจัดการสินค้าในร้านค้า (Product Management)

### 📍 Routes & View
* **Admin Shop Products View**: `/admin/shops/:shopId/products` (`AdminProductListView.vue`)

### 📐 Interfaces & Types

```typescript
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
  status: 'Active' | 'Inactive' | string
  detailImages?: string[]
}

export interface PagedProducts {
  items: Product[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
```

### 🌐 API Endpoints

| Method | Endpoint | Query / Body Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products/admin` | Query: `shopId: string`, `status?: string`, `page: number`, `pageSize: number` | `PagedProducts` | ดึงรายการสินค้าของร้านค้าที่ระบุ |
| `PATCH` | `/api/products/{id}/status` | Body: `{ status: 'Active' \| 'Inactive' }` | `void` | เปลี่ยนสถานะการมองเห็น/วางขายของสินค้า |

---

## 6. ระบบจัดการหมวดหมู่ร้านค้า (Shop Category Management)

### 📍 Routes & Views
* **List View**: `/admin/categories` (`AdminShopCategoriesView.vue`)
* **Create View**: `/admin/categories/new` (`AdminShopCategoryFormView.vue`)
* **Edit View**: `/admin/categories/:id/edit` (`AdminShopCategoryFormView.vue`)

### 📐 Interfaces & Types

```typescript
export interface ShopCategory {
  shopCategoryId: string
  categoryName: string
  description?: string
  status: 'Active' | 'Inactive' | string
  hasImage: boolean
}

export interface PagedCategories {
  items: ShopCategory[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/shop-categories` | Query: `page: number`, `pageSize: number` | `PagedResult<ShopCategory>` | ดึงรายการหมวดหมู่ร้านค้า |
| `GET` | `/api/shop-categories/{id}` | - | `ShopCategory` | ดึงรายละเอียดหมวดหมู่ร้านค้าตาม ID |
| `POST` | `/api/shop-categories` | Body: `{ categoryName: string, description: string }` | `ShopCategory` | สร้างหมวดหมู่ร้านค้าใหม่ |
| `PUT` | `/api/shop-categories/{id}` | Body: `{ categoryName: string, description: string, status: string }` | `void` | แก้ไขหมวดหมู่ร้านค้า |
| `DELETE` | `/api/shop-categories/{id}` | - | `void` | ลบหมวดหมู่ร้านค้า |
| `POST` | `/api/shop-categories/{id}/image` | `multipart/form-data` (`image`: File) | `void` | อัปโหลดรูปภาพหมวดหมู่ร้านค้า |
| `DELETE` | `/api/shop-categories/{id}/image` | - | `void` | ลบรูปภาพหมวดหมู่ร้านค้า |
| `GET` | `/api/shop-categories/{id}/image` | - | `Image File` | แสดงรูปภาพหมวดหมู่ร้านค้า |

---

## 7. ระบบจัดการหมวดหมู่สินค้า (Product Category Management)

### 📍 Routes & Views
* **List View**: `/admin/product-categories` (`AdminProductCategoriesView.vue`)
* **Create View**: `/admin/product-categories/new` (`AdminProductCategoryFormView.vue`)
* **Edit View**: `/admin/product-categories/:id/edit` (`AdminProductCategoryFormView.vue`)

### 📐 Interfaces & Types

```typescript
export interface ProductCategory {
  productCategoryId: string
  categoryName: string
  description?: string
  status: 'Active' | 'Inactive' | string
}

export interface PagedProductCategories {
  items: ProductCategory[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/product-categories` | Query: `page: number`, `pageSize: number` | `PagedProductCategories` | ดึงรายการหมวดหมู่สินค้า |
| `GET` | `/api/product-categories/{id}` | - | `ProductCategory` | ดึงข้อมูลหมวดหมู่สินค้าตาม ID |
| `POST` | `/api/product-categories` | Body: `{ categoryName: string, description: string }` | `void` | เพิ่มหมวดหมู่สินค้าใหม่ |
| `PUT` | `/api/product-categories/{id}` | Body: `{ categoryName: string, description: string, status: string }` | `void` | อัปเดตข้อมูลหมวดหมู่สินค้า |
| `DELETE` | `/api/product-categories/{id}` | - | `void` | ลบหมวดหมู่สินค้า |

---

## 8. ระบบจัดการเนื้อหา/ท่องเที่ยว (Content Management)

### 📍 Routes & Views
* **List View**: `/admin/contents` (`AdminContentsView.vue`)
* **Create View**: `/admin/contents/new` (`AdminContentFormView.vue`)
* **Edit View**: `/admin/contents/:id/edit` (`AdminContentFormView.vue`)

### 📐 Interfaces & Types

```typescript
export type ContentStatus = 'Draft' | 'Pending' | 'Published' | 'Archived'

export interface Content {
  contentId: string
  createdByUserId: string
  shopId?: string
  shopName?: string
  contentCategoryId: string
  contentCategoryName?: string
  districtId?: string
  districtName?: string
  subDistrictId?: string
  subDistrictName?: string
  title: string
  summary?: string
  latitude?: number
  longitude?: number
  youtubeUrl?: string
  status: ContentStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContentFormData {
  title: string
  summary: string
  contentCategoryId: string | null
  shopId: string | null
  districtId: string | null
  subDistrictId: string | null
  latitude: number | null
  longitude: number | null
  youtubeUrl: string
  status: ContentStatus
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/contents/admin` | Query: `status?: string`, `page: number`, `pageSize: number` | `PagedResult<Content>` | ดึงรายการบทความ/สถานที่ท่องเที่ยวในระบบ Admin |
| `GET` | `/api/contents/admin/{id}` | - | `Content` | ดึงรายละเอียดเนื้อหาตาม ID |
| `POST` | `/api/contents` | Body: `Omit<ContentFormData, 'status'>` | `Content` | สร้างบทความ/สถานที่ท่องเที่ยวใหม่ |
| `PUT` | `/api/contents/{id}` | Body: `ContentFormData` | `void` | แก้ไขข้อมูลบทความ/สถานที่ท่องเที่ยว |
| `DELETE` | `/api/contents/{id}` | - | `void` | เก็บกรุเนื้อหา (Archive Content) |
| `GET` | `/api/locations/districts` | - | `District[]` | ดึงรายการอำเภอในจังหวัดกาญจนบุรี |
| `GET` | `/api/locations/districts/{districtId}/sub-districts` | - | `SubDistrict[]` | ดึงรายการตำบลตามอำเภอ |

---

## 9. ระบบจัดการหมวดหมู่เนื้อหา (Content Category Management)

### 📍 Routes & Views
* **List View**: `/admin/content-categories` (`AdminContentCategoriesView.vue`)
* **Create View**: `/admin/content-categories/new` (`AdminContentCategoryFormView.vue`)
* **Edit View**: `/admin/content-categories/:id/edit` (`AdminContentCategoryFormView.vue`)

### 📐 Interfaces & Types

```typescript
export interface ContentCategory {
  contentCategoryId: string
  categoryName: string
  description?: string
  status: 'Active' | 'Inactive'
}

export interface ContentCategoryFormData {
  categoryName: string
  description: string
  status: 'Active' | 'Inactive'
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/content-categories/admin` | Query: `status?: string`, `page: number`, `pageSize: number` | `PagedResult<ContentCategory>` | ดึงรายการหมวดหมู่เนื้อหาทั้งหมด |
| `GET` | `/api/content-categories/admin/{id}` | - | `ContentCategory` | ดึงข้อมูลหมวดหมู่เนื้อหาตาม ID |
| `POST` | `/api/content-categories` | Body: `{ categoryName: string, description: string }` | `ContentCategory` | เพิ่มหมวดหมู่เนื้อหาใหม่ |
| `PUT` | `/api/content-categories/{id}` | Body: `ContentCategoryFormData` | `void` | แก้ไขหมวดหมู่เนื้อหา |
| `DELETE` | `/api/content-categories/{id}` | - | `void` | ลบหมวดหมู่เนื้อหา |

---

## 10. ระบบจัดการแท็ก (Tag Management)

### 📍 Routes & Views
* **List View**: `/admin/tags` (`AdminTagsView.vue`)
* **Create View**: `/admin/tags/new` (`AdminTagFormView.vue`)
* **Edit View**: `/admin/tags/:id/edit` (`AdminTagFormView.vue`)

### 📐 Interfaces & Types

```typescript
export interface Tag {
  tagId: string
  tagName: string
  status: 'Active' | 'Inactive'
}
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tags/admin` | Query: `status?: string`, `page: number`, `pageSize: number` | `PagedResult<Tag>` | ดึงรายการแท็กคำค้นหาทั้งหมด |
| `GET` | `/api/tags/admin/{id}` | - | `Tag` | ดึงข้อมูลแท็กตาม ID |
| `POST` | `/api/tags` | Body: `{ tagName: string }` | `Tag` | สร้างแท็กใหม่ |
| `PUT` | `/api/tags/{id}` | Body: `{ tagName: string, status: 'Active' \| 'Inactive' }` | `void` | แก้ไขข้อมูลแท็ก |
| `DELETE` | `/api/tags/{id}` | - | `void` | ลบแท็ก |

---

## 11. ระบบผูกแท็กกับเนื้อหา (Content Tag Binding)

### 📍 Usage
* ใช้ร่วมกับฟอร์มจัดการเนื้อหาในฝั่งผู้ดูแลระบบ (`AdminContentTagApi`)

### 📐 Interfaces & Types

```typescript
export interface ContentOption {
  contentId: string
  title: string
  status: string
}

export interface TagOption {
  tagId: string
  tagName: string
  status: string
}

export interface ContentTag {
  contentId: string
  tagId: string
  tagName: string
}
```

### 🌐 API Endpoints

| Method | Endpoint | Query / Body Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/contents/admin` | Query: `page: 1`, `pageSize: 100` | `PagedResult<ContentOption>` | ดึงรายชื่อเนื้อหาเพื่อนำไปเลือกผูกแท็ก |
| `GET` | `/api/tags` | - | `TagOption[]` | ดึงรายการแท็กทั้งหมดที่เปิดใช้งานอยู่ |
| `GET` | `/api/content-tags` | Query: `contentId: string` | `ContentTag[]` | ดึงแท็กทั้งหมดที่ถูกผูกไว้กับเนื้อหาชิ้นนี้ |
| `PUT` | `/api/content-tags/{contentId}` | Body: `{ tagIds: string[] }` | `ContentTag[]` | อัปเดตแท็กของเนื้อหาแบบแทนที่ทั้งหมด (Replace All Tags) |

---

## 12. ระบบจัดการตารางกิจกรรม/ปฏิทิน (Schedule Management)

### 📍 Routes & Views
* **List View**: `/admin/schedules` (`AdminSchedulesView.vue`)
* **Create View**: `/admin/schedules/new` (`AdminScheduleFormView.vue`)
* **Edit View**: `/admin/schedules/:id/edit` (`AdminScheduleFormView.vue`)

### 📐 Interfaces & Types

```typescript
export type ScheduleStatus = 'Active' | 'Inactive' | 'Cancelled'

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
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/schedules/admin` | Query: `contentId?: string` | `Schedule[]` | ดึงรายการตารางกิจกรรมทั้งหมด |
| `GET` | `/api/schedules/admin/{id}` | - | `Schedule` | ดึงรายละเอียดตารางกิจกรรมตาม ID |
| `POST` | `/api/schedules` | Body: `Omit<ScheduleFormData, 'status'>` | `Schedule` | สร้างตารางกิจกรรมใหม่ |
| `PUT` | `/api/schedules/{id}` | Body: `ScheduleFormData` | `void` | แก้ไขข้อมูลตารางกิจกรรม |
| `DELETE` | `/api/schedules/{id}` | - | `void` | ยกเลิก/ลบตารางกิจกรรม |

---

## 13. ระบบจัดการรายงานการร้องเรียน (Report & Violation Management)

### 📍 Routes & View
* **Reports View**: `/admin/reports` (`AdminReportsView.vue`)

### 📐 Interfaces & Types

```typescript
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
```

### 🌐 API Endpoints

| Method | Endpoint | Request Body / Params | Response Body | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/admin` | Query: `status?: ReportStatus` | `Report[]` | ดึงรายการการรายงาน/ร้องเรียนเนื้อหาหรือรีวิว |
| `PATCH` | `/api/reports/{reportId}/status` | Body: `{ status: ReportStatus }` | `Report` | อัปเดตสถานะการดำเนินการของรายงานร้องเรียน |

---

## 🛠️ Summary Matrix of Admin System Endpoints

| ระบบย่อย (Sub-system) | จำนวน Endpoints | เมธอด HTTP ที่ใช้ | ไฟล์ API อ้างอิง |
| :--- | :---: | :--- | :--- |
| **1. Admin Dashboard & Exports** | 5 | `GET` | `src/features/admin/api/adminDashboardApi.ts` |
| **2. Order Slip Verification** | 2 | `GET`, `POST` | `src/features/admin/orders/views/AdminOrdersView.vue` |
| **3. Merchant Payout Management** | 3 | `GET`, `POST` | `src/features/admin/payouts/views/AdminPayoutsView.vue` |
| **4. Shop Management** | 2 | `GET`, `PATCH` | `src/features/admin/shops/api/adminShopApi.ts` |
| **5. Product Management** | 2 | `GET`, `PATCH` | `src/features/admin/products/api/adminProductApi.ts` |
| **6. Shop Category Management** | 8 | `GET`, `POST`, `PUT`, `DELETE` | `src/features/admin/shop-categories/api/adminShopCategoryApi.ts` |
| **7. Product Category Management** | 5 | `GET`, `POST`, `PUT`, `DELETE` | `src/features/admin/product-categories/api/adminProductCategoryApi.ts` |
| **8. Content Management** | 7 | `GET`, `POST`, `PUT`, `DELETE` | `src/features/admin/contents/api/adminContentApi.ts` |
| **9. Content Category Management** | 5 | `GET`, `POST`, `PUT`, `DELETE` | `src/features/admin/content-categories/api/adminContentCategoryApi.ts` |
| **10. Tag Management** | 5 | `GET`, `POST`, `PUT`, `DELETE` | `src/features/admin/tags/api/adminTagApi.ts` |
| **11. Content Tag Binding** | 4 | `GET`, `PUT` | `src/features/admin/content-tags/api/adminContentTagApi.ts` |
| **12. Schedule Management** | 5 | `GET`, `POST`, `PUT`, `DELETE` | `src/features/admin/schedules/api/adminScheduleApi.ts` |
| **13. Report & Violation Management** | 2 | `GET`, `PATCH` | `src/features/admin/reports/api/adminReportApi.ts` |
