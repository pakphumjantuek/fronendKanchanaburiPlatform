# Kanchanaburi Platform - Frontend

ระบบแพลตฟอร์มท่องเที่ยวและร้านค้าจังหวัดกาญจนบุรี (Frontend Web Application) พัฒนาด้วย Vue 3, Vite, TypeScript, Pinia, Vuetify และ Tailwind CSS

---

## 📁 Full Project Folder Structure (โครงสร้างไฟล์และโฟลเดอร์ทั้งหมด)

```text
fronendKanchanaburiPlatform/
├── backend/
│   └── README.md
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── base.css
│   │   ├── logo.svg
│   │   ├── main.css
│   │   └── รูปปก.png
│   ├── components/
│   │   ├── common/
│   │   │   ├── input/
│   │   │   │   ├── AppFileInput.vue
│   │   │   │   ├── AppSelect.vue
│   │   │   │   ├── AppTextarea.vue
│   │   │   │   └── AppTextField.vue
│   │   │   ├── map/
│   │   │   │   └── LocationPickerMap.vue
│   │   │   ├── AppButton.vue
│   │   │   ├── AppConfirmModal.vue
│   │   │   ├── AppDataTable.vue
│   │   │   ├── AppSearch.vue
│   │   │   └── CheckoutModal.vue
│   │   ├── AdminNavMenu.vue
│   │   └── GlobalModal.vue
│   ├── features/
│   │   ├── admin/
│   │   │   ├── api/
│   │   │   │   └── adminDashboardApi.ts
│   │   │   ├── content-categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminContentCategoryApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminContentCategoriesView.vue
│   │   │   │       └── AdminContentCategoryFormView.vue
│   │   │   ├── content-tags/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminContentTagApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminContentTagsView.vue
│   │   │   ├── contents/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminContentApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminContentFormView.vue
│   │   │   │       └── AdminContentsView.vue
│   │   │   ├── dashboard/
│   │   │   │   └── views/
│   │   │   │       └── AdminDashboardView.vue
│   │   │   ├── orders/
│   │   │   │   └── views/
│   │   │   │       └── AdminOrdersView.vue
│   │   │   ├── payouts/
│   │   │   │   └── views/
│   │   │   │       └── AdminPayoutsView.vue
│   │   │   ├── product-categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminProductCategoryApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminProductCategoriesView.vue
│   │   │   │       └── AdminProductCategoryFormView.vue
│   │   │   ├── products/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminProductApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminProductListView.vue
│   │   │   ├── reports/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminReportApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminReportsView.vue
│   │   │   ├── schedules/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminScheduleApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminScheduleFormView.vue
│   │   │   │       └── AdminSchedulesView.vue
│   │   │   ├── shop-categories/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminShopCategoryApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminShopCategoriesView.vue
│   │   │   │       └── AdminShopCategoryFormView.vue
│   │   │   ├── shops/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminShopApi.ts
│   │   │   │   └── views/
│   │   │   │       └── AdminShopListView.vue
│   │   │   ├── tags/
│   │   │   │   ├── api/
│   │   │   │   │   └── adminTagApi.ts
│   │   │   │   └── views/
│   │   │   │       ├── AdminTagFormView.vue
│   │   │   │       └── AdminTagsView.vue
│   │   │   └── views/
│   │   │       └── AdminLayout.vue
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── authApi.ts
│   │   │   │   └── getApiErrorMessage.ts
│   │   │   ├── stores/
│   │   │   │   └── auth.ts
│   │   │   └── views/
│   │   │       ├── LoginView.vue
│   │   │       └── RegisterView.vue
│   │   ├── cart/
│   │   │   ├── api/
│   │   │   │   ├── cartApi.ts
│   │   │   │   └── userAddressApi.ts
│   │   │   ├── components/
│   │   │   │   ├── cart/
│   │   │   │   │   ├── CartAddressSection.vue
│   │   │   │   │   ├── CartEmptyState.vue
│   │   │   │   │   ├── CartHeroBanner.vue
│   │   │   │   │   ├── CartItemRow.vue
│   │   │   │   │   └── CartSummaryCard.vue
│   │   │   │   ├── order-detail/
│   │   │   │   │   ├── OrderCostSummary.vue
│   │   │   │   │   ├── OrderDetailHeader.vue
│   │   │   │   │   ├── OrderItemsList.vue
│   │   │   │   │   ├── OrderProgressTimeline.vue
│   │   │   │   │   ├── OrderShippingInfo.vue
│   │   │   │   │   └── WriteReviewModal.vue
│   │   │   │   ├── orders/
│   │   │   │   │   ├── OrderCard.vue
│   │   │   │   │   ├── OrdersFilterTabs.vue
│   │   │   │   │   └── OrdersHeroBanner.vue
│   │   │   │   └── payment/
│   │   │   │       ├── PaymentBankTransfer.vue
│   │   │   │       ├── PaymentCardForm.vue
│   │   │   │       ├── PaymentMethodTabs.vue
│   │   │   │       └── PaymentPromptpayQr.vue
│   │   │   └── views/
│   │   │       ├── CartView.vue
│   │   │       ├── OrderDetailView.vue
│   │   │       ├── OrdersView.vue
│   │   │       └── PaymentView.vue
│   │   ├── contents/
│   │   │   ├── api/
│   │   │   │   ├── contentApis.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   └── categoryRules.ts
│   │   │   ├── public/
│   │   │   │   ├── api/
│   │   │   │   │   └── contentApi.ts
│   │   │   │   ├── detail/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ContentDetailHeader.vue
│   │   │   │   │   │   ├── ContentDetailHero.vue
│   │   │   │   │   │   ├── ContentDetailRelated.vue
│   │   │   │   │   │   ├── ContentDetailReviews.vue
│   │   │   │   │   │   ├── ContentDetailSidebar.vue
│   │   │   │   │   │   ├── ContentDetailTabs.vue
│   │   │   │   │   │   ├── ContentLocationMap.vue
│   │   │   │   │   │   └── ContentReportModal.vue
│   │   │   │   │   └── views/
│   │   │   │   │       └── ContentDetailView.vue
│   │   │   │   └── list/
│   │   │   │       ├── components/
│   │   │   │       │   ├── ContentCard.vue
│   │   │   │       │   ├── ContentCategoryBar.vue
│   │   │   │       │   ├── ContentFilterSection.vue
│   │   │   │       │   ├── ContentHeroBanner.vue
│   │   │   │       │   └── ContentMapView.vue
│   │   │   │       └── views/
│   │   │   │           └── ContentListView.vue
│   │   │   └── user/
│   │   │       ├── api/
│   │   │       │   └── userContentApi.ts
│   │   │       └── views/
│   │   │           ├── MyContentsView.vue
│   │   │           └── UserContentFormView.vue
│   │   ├── profile/
│   │   │   ├── api/
│   │   │   │   └── profileApi.ts
│   │   │   ├── components/
│   │   │   │   ├── ProfileAddressList.vue
│   │   │   │   ├── ProfileFavoritesList.vue
│   │   │   │   ├── ProfileHistoryList.vue
│   │   │   │   ├── ProfileInfoForm.vue
│   │   │   │   ├── ProfileMyContents.vue
│   │   │   │   ├── ProfileMyShop.vue
│   │   │   │   ├── ProfileOrdersList.vue
│   │   │   │   └── ProfileSidebar.vue
│   │   │   └── views/
│   │   │       └── ProfileView.vue
│   │   └── shops/
│   │       ├── api/
│   │       │   ├── index.ts
│   │       │   ├── productApi.ts
│   │       │   └── shopApi.ts
│   │       ├── merchant/
│   │       │   ├── api/
│   │       │   │   ├── productApi.ts
│   │       │   │   └── shopApi.ts
│   │       │   ├── contents/
│   │       │   │   ├── MerchantContentFormView.vue
│   │       │   │   └── MerchantContentsView.vue
│   │       │   ├── dashboard/
│   │       │   │   └── views/
│   │       │   │       └── MerchantDashboardView.vue
│   │       │   ├── exports/
│   │       │   │   ├── api/
│   │       │   │   │   └── merchantExportApi.ts
│   │       │   │   └── views/
│   │       │   │       └── MerchantExportsView.vue
│   │       │   ├── layout/
│   │       │   │   └── ShopManageLayout.vue
│   │       │   ├── orders/
│   │       │   │   ├── components/
│   │       │   │   │   ├── MerchantOrderCard.vue
│   │       │   │   │   └── ShipmentFulfillmentForm.vue
│   │       │   │   └── MerchantOrdersView.vue
│   │       │   ├── payouts/
│   │       │   │   └── views/
│   │       │   │       └── MerchantPayoutsView.vue
│   │       │   ├── products/
│   │       │   │   ├── ProductFormView.vue
│   │       │   │   └── ProductListView.vue
│   │       │   └── shop/
│   │       │       ├── MyShopView.vue
│   │       │       └── ShopApplicationView.vue
│   │       ├── public/
│   │       │   ├── api/
│   │       │   │   ├── productApi.ts
│   │       │   │   └── shopApi.ts
│   │       │   ├── components/
│   │       │   │   ├── ShopCard.vue
│   │       │   │   ├── ShopCategoryBar.vue
│   │       │   │   ├── ShopDistrictFilterBar.vue
│   │       │   │   ├── ShopFeaturedSection.vue
│   │       │   │   ├── ShopFilterSection.vue
│   │       │   │   ├── ShopHeroBanner.vue
│   │       │   │   └── ShopMapView.vue
│   │       │   ├── detail/
│   │       │   │   ├── product/
│   │       │   │   │   ├── components/
│   │       │   │   │   │   ├── ProductGallery.vue
│   │       │   │   │   │   ├── ProductInfoPanel.vue
│   │       │   │   │   │   └── ProductSellerCard.vue
│   │       │   │   │   └── views/
│   │       │   │   │       └── ProductDetailView.vue
│   │       │   │   ├── shop/
│   │       │   │   │   ├── components/
│   │       │   │   │   │   ├── ShopDetailAbout.vue
│   │       │   │   │   │   ├── ShopDetailCampaign.vue
│   │       │   │   │   │   ├── ShopDetailContents.vue
│   │       │   │   │   │   ├── ShopDetailGuarantees.vue
│   │       │   │   │   │   ├── ShopDetailHeader.vue
│   │       │   │   │   │   ├── ShopDetailHighlights.vue
│   │       │   │   │   │   ├── ShopDetailInfoBar.vue
│   │       │   │   │   │   ├── ShopDetailMapCard.vue
│   │       │   │   │   │   ├── ShopDetailMobileBar.vue
│   │       │   │   │   │   ├── ShopDetailNearbyShops.vue
│   │       │   │   │   │   ├── ShopDetailProducts.vue
│   │       │   │   │   │   └── ShopDetailReviews.vue
│   │       │   │   │   └── views/
│   │       │   │   │       └── ShopDetailView.vue
│   │       │   │   ├── shop-contents/
│   │       │   │   │   └── views/
│   │       │   │   │       └── ShopContentsView.vue
│   │       │   │   └── shop-products/
│   │       │   │       └── views/
│   │       │   │           └── ShopProductsView.vue
│   │       │   └── list/
│   │       │       ├── components/
│   │       │       │   ├── ShopCardItem.vue
│   │       │       │   ├── ShopListFeaturedSection.vue
│   │       │       │   ├── ShopListSidebarFilter.vue
│   │       │       │   ├── ShopMapTopFilter.vue
│   │       │       │   └── ShopMerchantCtaBanner.vue
│   │       │       └── views/
│   │       │           └── ShopListView.vue
│   │       └── shared/
│   │           └── types/
│   │               ├── product.ts
│   │               └── shop.ts
│   ├── plugins/
│   │   ├── confirmState.ts
│   │   ├── sweetalert.ts
│   │   └── vuetify.ts
│   ├── router/
│   │   └── index.ts
│   ├── shared/
│   │   ├── api/
│   │   │   └── http.ts
│   │   ├── components/
│   │   │   ├── AppDateRangeFilter.vue
│   │   │   ├── AppDisplayToolbar.vue
│   │   │   ├── AppEmptyState.vue
│   │   │   ├── AppPageHeader.vue
│   │   │   ├── AppPagination.vue
│   │   │   └── AppStatCard.vue
│   │   ├── composables/
│   │   │   ├── formatDate.ts
│   │   │   ├── useLocations.ts
│   │   │   ├── useModal.ts
│   │   │   └── usePagination.ts
│   │   └── interface/
│   │       └── PagedResult.ts
│   ├── stores/
│   │   └── cart.ts
│   ├── types/
│   │   └── sweetalert.d.ts
│   ├── views/
│   │   ├── Footer.vue
│   │   ├── HomeView.vue
│   │   └── Navbar.vue
│   ├── App.vue
│   └── main.ts
├── .env
├── .gitignore
├── .prettierrc.json
├── env.d.ts
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🛠️ รายละเอียดของโครงสร้างโฟลเดอร์หลัก (Folder Breakdown)

### 🔹 `src/features/`
จัดเก็บโค้ดจำแนกตามฟังก์ชันทางธุรกิจ (Domain-Driven / Feature-Driven Structure) เพื่อให้ง่ายต่อการดูแลรักษาและขยายระบบในอนาคต:
- **`admin/`**: หน้าจอและการจัดการระบบหลังบ้านทั้งหมด เช่น สินค้า, หมวดหมู่, คำสั่งซื้อ, การจ่ายเงิน, รายงานภาพรวม
- **`auth/`**: หน้าเข้าสู่ระบบ ลงทะเบียน และจัดการ state สิทธิ์ผู้ใช้งาน
- **`shops/`**: หน้าแสดงร้านค้าสำหรับผู้ซื้อ และระบบจัดการร้านค้าสำหรับผู้ประกอบการ
- **`contents/`**: ข่าวสาร บทความ และสถานที่ท่องเที่ยว
- **`cart/`**: ระบบตะกร้าและการสั่งซื้อสินค้า
- **`profile/`**: ข้อมูลส่วนตัวของผู้ใช้งานและการตั้งค่าบัญชี

### 🔹 `src/shared/`
โมดูลและฟังก์ชันส่วนกลางที่สามารถเรียกใช้งานได้จากทุก Feature:
- **`api/http.ts`**: Axios instance พร้อมการจัดการ Request / Response Interceptors
- **`composables/`**: Logic หรือ Custom Hooks ที่ใช้ซ้ำได้ เช่น การทำ Pagination, การจัดการ Modal, การแปลงรูปแบบวันที่
- **`components/`**: UI Components ส่วนกลางที่ไม่ผูกติดกับ Business Logic Specific

### 🔹 `src/plugins/`
การคอนฟิกไลบรารีภายนอกที่ลงทะเบียนเข้ากับ Vue App Instance เช่น Vuetify สำหรับ UI Components และ SweetAlert2 สำหรับ Alert Dialogs

---

## 🚀 การติดตั้งและเรียกใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันระบบในโหมด Development
```bash
npm run dev
```

### 3. สร้าง Production Build
```bash
npm run build
```

---

## ⚡ Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API + Script Setup)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Framework / Styling**: [Vuetify 3](https://vuetifyjs.com/), [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons & Alerts**: [@mdi/font](https://materialdesignicons.com/), [Notivue](https://notivue.domak2.com/), SweetAlert2
