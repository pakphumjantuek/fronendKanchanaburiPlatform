# Kanchanaburi Platform - Backend

Backend สำหรับระบบร้านค้า คำสั่งซื้อ การชำระเงิน การจัดส่ง และการจัดการของแอดมิน พัฒนาด้วย ASP.NET Core 9, Entity Framework Core และ SQL Server

## สิ่งที่เพิ่มในรอบนี้

- ปรับ query ของ Order ที่ใช้งานบ่อยให้กรองข้อมูลใน SQL และอ่านแบบ `AsNoTracking()` แทนการโหลดทั้งตารางมา filter ในหน่วยความจำ
- เพิ่ม composite index สำหรับ `Order` ตาม `UserId`, `ShopId`, `PaymentStatus`, `OrderStatus` และ `CreatedAt`
- เพิ่ม Admin Dashboard แบบ aggregate ใน SQL
- เพิ่ม Export ข้อมูลฝั่งร้านและแอดมินเป็น CSV และ PDF
- ใช้ QuestPDF สร้าง PDF ตาราง A4 แนวนอน พร้อมหัวรายงานและเลขหน้า

> หลัง deploy ให้ apply migration `20260914000000_AddAdminDashboardIndexes` เพื่อสร้าง index ใหม่ในฐานข้อมูล

## การยืนยันตัวตน

API ที่ระบุว่า `Authorize` ต้องส่ง JWT:

```http
Authorization: Bearer {access_token}
```

API ที่ขึ้นต้นด้วย `/api/admin/` ต้องเป็นผู้ใช้ role `Admin` ส่วน API `/api/shops/mine/` จะจำกัดข้อมูลตามร้านของผู้ใช้ที่ล็อกอิน

## Admin Dashboard

```http
GET /api/admin/dashboard?from=2026-09-01&to=2026-09-14
```

พารามิเตอร์ `from` และ `to` เป็น optional; ค่าเริ่มต้นคือเดือนปัจจุบัน และเลือกช่วงได้สูงสุด 366 วัน

Response ประกอบด้วยยอดขาย, จำนวนออเดอร์และสถานะ, ยอดรอโอน, จำนวนผู้ใช้/ร้าน/สินค้าใกล้หมด, กราฟยอดขายรายวัน, ออเดอร์ล่าสุด, ร้านขายดี และ alerts

## Export ฝั่งร้านค้า

ทุก endpoint รองรับ `from`, `to` และ `format` โดย `format=csv` เป็นค่าเริ่มต้น หรือใช้ `format=pdf` เพื่อรับ PDF

| ข้อมูล | Endpoint | Filter เพิ่มเติม |
| --- | --- | --- |
| ออเดอร์ของร้าน | `GET /api/shops/mine/exports/orders` | `orderStatus`, `paymentStatus`, `payoutStatus` |
| ยอดขายรายสินค้า | `GET /api/shops/mine/exports/products` | - |
| ประวัติรับเงิน | `GET /api/shops/mine/exports/payouts` | - |

ตัวอย่าง:

```http
GET /api/shops/mine/exports/orders?from=2026-09-01&to=2026-09-14&paymentStatus=Paid&format=pdf
GET /api/shops/mine/exports/products?format=csv
```

รายงานสินค้าใช้เฉพาะออเดอร์ที่ `PaymentStatus = Paid` เพื่อให้ยอดขายไม่เกินจริง

## Export ฝั่งแอดมิน

ทุก endpoint รองรับ `from`, `to` และ `format=csv|pdf`

| ข้อมูล | Endpoint | Filter เพิ่มเติม |
| --- | --- | --- |
| ออเดอร์ทุกร้าน | `GET /api/admin/exports/orders` | `shopId`, `orderStatus`, `paymentStatus`, `payoutStatus` |
| ยอดขายแยกร้าน | `GET /api/admin/exports/shop-sales` | - |
| รายการโอนให้ร้าน | `GET /api/admin/exports/payouts` | `shopId` |
| สลิปชำระเงิน | `GET /api/admin/exports/payment-slips` | `paymentStatus` |

ตัวอย่าง:

```http
GET /api/admin/exports/orders?shopId={shop-guid}&paymentStatus=Paid&format=pdf
GET /api/admin/exports/payment-slips?paymentStatus=PendingVerification&format=csv
```

CSV เข้ารหัส UTF-8 พร้อม BOM เพื่อให้เปิดภาษาไทยใน Microsoft Excel ได้ถูกต้อง ส่วน PDF ใช้ QuestPDF และออกแบบเป็น A4 แนวนอน

## หมายเหตุด้านประสิทธิภาพ

- รายการ export และ dashboard จำกัดช่วงวันที่ไม่เกิน 366 วัน
- Query อ่านข้อมูลใช้ `AsNoTracking()` และประมวลผลยอดรวม/การจัดกลุ่มใน SQL
- PDF ใช้ฟอนต์ `Tahoma`; server ที่รัน production ควรมีฟอนต์นี้หรือฟอนต์ไทยทดแทน

## API Routes ทั้งหมด

Base URL คือ URL ของ Backend เช่น `https://localhost:{port}` และเปิด Swagger ได้ที่ `/swagger`.

สัญลักษณ์สิทธิ์: `สาธารณะ` = ไม่ต้องส่ง token, `ผู้ใช้` = ต้องล็อกอิน (JWT), `Admin` = ต้องมี role `Admin`. พารามิเตอร์ใน `{...}` เป็น path parameter และ `guid` หมายถึง UUID/GUID

### Authentication และบัญชีผู้ใช้

Identity API ที่ ASP.NET Core สร้างจาก `MapIdentityApi`:

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| POST | `/api/register` | สาธารณะ | สมัครสมาชิก |
| POST | `/api/login` | สาธารณะ | เข้าสู่ระบบและรับ access token/refresh token |
| POST | `/api/refresh` | สาธารณะ | ต่ออายุ access token ด้วย refresh token |
| GET | `/api/confirmEmail` | สาธารณะ | ยืนยันอีเมล |
| POST | `/api/resendConfirmationEmail` | สาธารณะ | ส่งอีเมลยืนยันอีกครั้ง |
| POST | `/api/forgotPassword` | สาธารณะ | ขอรีเซ็ตรหัสผ่าน |
| POST | `/api/resetPassword` | สาธารณะ | ตั้งรหัสผ่านใหม่ |
| GET | `/api/manage/2fa` | ผู้ใช้ | ดูสถานะ 2FA |
| POST | `/api/manage/2fa` | ผู้ใช้ | ตั้งค่า 2FA |
| GET | `/api/manage/info` | ผู้ใช้ | ดูข้อมูลบัญชี |
| POST | `/api/manage/info` | ผู้ใช้ | แก้ไขข้อมูลบัญชี |
| GET | `/api/account/me` | ผู้ใช้ | ข้อมูลผู้ใช้ปัจจุบัน |
| GET | `/api/account/profile` | ผู้ใช้ | ดูโปรไฟล์ |
| PUT | `/api/account/profile` | ผู้ใช้ | แก้ไขโปรไฟล์ |

### ที่อยู่และตำแหน่ง

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| GET | `/api/user-addresses` | ผู้ใช้ | รายการที่อยู่ของฉัน |
| POST | `/api/user-addresses` | ผู้ใช้ | เพิ่มที่อยู่ |
| PUT | `/api/user-addresses/{id:guid}` | ผู้ใช้ | แก้ไขที่อยู่ |
| PATCH | `/api/user-addresses/{id:guid}/default` | ผู้ใช้ | ตั้งเป็นที่อยู่เริ่มต้น |
| DELETE | `/api/user-addresses/{id:guid}` | ผู้ใช้ | ลบที่อยู่ |
| GET | `/api/locations/districts` | สาธารณะ | รายการอำเภอ |
| POST | `/api/locations/districts` | สาธารณะ | เพิ่มอำเภอ |
| GET | `/api/locations/districts/{districtId:guid}/sub-districts` | สาธารณะ | รายการตำบลตามอำเภอ |
| POST | `/api/locations/sub-districts` | สาธารณะ | เพิ่มตำบล |

### ร้านค้าและหมวดหมู่ร้าน

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| GET | `/api/shops` | สาธารณะ | ค้นหา/แสดงร้าน (`page`, `pageSize`, `categoryId`, `search`) |
| GET | `/api/shops/{id:guid}` | สาธารณะ | รายละเอียดร้าน |
| GET | `/api/shops/mine` | ผู้ใช้ | ร้านของฉัน |
| GET | `/api/shops/mine/dashboard` | ผู้ใช้ | Dashboard ร้านของฉัน |
| GET | `/api/shops/admin` | Admin | รายการร้านสำหรับผู้ดูแล (`page`, `pageSize`, `status`, `search`) |
| GET | `/api/shops/admin/{id:guid}` | Admin | รายละเอียดร้านสำหรับผู้ดูแล |
| POST | `/api/shops` | ผู้ใช้ | สร้าง/ยื่นขอเปิดร้าน |
| PUT | `/api/shops/{id:guid}` | ผู้ใช้ | แก้ไขร้าน |
| PATCH | `/api/shops/{id:guid}/status` | ผู้ใช้ | เปลี่ยนสถานะร้าน |
| POST | `/api/shops/{id:guid}/cover-image` | ผู้ใช้ | อัปโหลดรูปปกร้าน (`multipart/form-data`, `file`) |
| POST | `/api/shops/{id:guid}/background-image` | ผู้ใช้ | อัปโหลดภาพพื้นหลังร้าน (`multipart/form-data`, `file`) |
| DELETE | `/api/shops/{id:guid}` | ผู้ใช้ | ลบร้าน |
| GET | `/api/shop-categories` | สาธารณะ | หมวดหมู่ร้าน (`page`, `pageSize`) |
| GET | `/api/shop-categories/{id:guid}` | สาธารณะ | หมวดหมู่ร้านตาม ID |
| GET | `/api/shop-categories/{id:guid}/image` | สาธารณะ | รูปหมวดหมู่ร้าน |
| POST | `/api/shop-categories` | Admin | เพิ่มหมวดหมู่ร้าน |
| PUT | `/api/shop-categories/{id:guid}` | Admin | แก้ไขหมวดหมู่ร้าน |
| POST | `/api/shop-categories/{id:guid}/image` | Admin | อัปโหลดรูปหมวดหมู่ (`multipart/form-data`, `image`) |
| DELETE | `/api/shop-categories/{id:guid}/image` | Admin | ลบรูปหมวดหมู่ |
| DELETE | `/api/shop-categories/{id:guid}` | Admin | ลบหมวดหมู่ร้าน |
| GET | `/api/shop-reviews/{shopId:guid}` | สาธารณะ | รีวิวของร้าน |

### สินค้า ตะกร้า และรีวิวสินค้า

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| GET | `/api/products` | สาธารณะ | รายการสินค้า |
| GET | `/api/products/{id:guid}` | สาธารณะ | รายละเอียดสินค้า |
| GET | `/api/products/admin` | Admin | รายการสินค้าสำหรับผู้ดูแล (`shopId`, `status`, `page`, `pageSize`) |
| POST | `/api/products` | ผู้ใช้ | เพิ่มสินค้า |
| PUT | `/api/products/{id:guid}` | ผู้ใช้ | แก้ไขสินค้า |
| PATCH | `/api/products/{id:guid}/status` | Admin | เปลี่ยนสถานะสินค้า |
| DELETE | `/api/products/{id:guid}` | ผู้ใช้ | ลบสินค้า |
| POST | `/api/products/{id:guid}/cover-image` | ผู้ใช้ | อัปโหลดรูปปก (`multipart/form-data`, `file`) |
| POST | `/api/products/{id:guid}/detail-images` | ผู้ใช้ | อัปโหลดรูปประกอบ (`multipart/form-data`, `files`) |
| DELETE | `/api/products/{productId:guid}/detail-images/{imageIndex:int}` | ผู้ใช้ | ลบรูปประกอบสินค้า |
| GET | `/api/product-categories` | สาธารณะ | หมวดหมู่สินค้า (`page`, `pageSize`) |
| GET | `/api/product-categories/{id:guid}` | สาธารณะ | หมวดหมู่สินค้าตาม ID |
| POST | `/api/product-categories` | Admin | เพิ่มหมวดหมู่สินค้า |
| PUT | `/api/product-categories/{id:guid}` | Admin | แก้ไขหมวดหมู่สินค้า |
| DELETE | `/api/product-categories/{id:guid}` | Admin | ลบหมวดหมู่สินค้า |
| GET | `/api/cart` | ผู้ใช้ | ตะกร้าสินค้าปัจจุบัน |
| POST | `/api/cart/items` | ผู้ใช้ | เพิ่มสินค้าในตะกร้า |
| PUT | `/api/cart/items/{id:guid}` | ผู้ใช้ | แก้ไขรายการในตะกร้า |
| DELETE | `/api/cart/items/{id:guid}` | ผู้ใช้ | ลบรายการจากตะกร้า |
| GET | `/api/product-reviews/{productId:guid}` | สาธารณะ | รีวิวของสินค้า |
| GET | `/api/product-reviews/my-reviews` | ผู้ใช้ | ID สินค้าที่ฉันรีวิวแล้ว |
| POST | `/api/product-reviews` | ผู้ใช้ | สร้างรีวิวสินค้า |

### คำสั่งซื้อ การชำระเงิน และการจ่ายเงินให้ร้าน

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| POST | `/api/orders/checkout` | ผู้ใช้ | สร้างคำสั่งซื้อจากตะกร้า |
| GET | `/api/orders/mine` | ผู้ใช้ | คำสั่งซื้อของฉัน |
| GET | `/api/orders/{id:guid}` | ผู้ใช้ | รายละเอียดคำสั่งซื้อ |
| GET | `/api/orders/shop/mine` | ผู้ใช้ | ออเดอร์ของร้านฉัน (`orderStatus`, `paymentStatus`) |
| PATCH | `/api/orders/{id:guid}/status` | ผู้ใช้ | ปรับสถานะออเดอร์ |
| PUT | `/api/orders/{id:guid}/shipment` | ผู้ใช้ | บันทึกข้อมูลการจัดส่ง |
| PATCH | `/api/orders/{id:guid}/shipment/status` | ผู้ใช้ | ปรับสถานะการจัดส่ง |
| GET | `/api/orders/admin/pending-slips` | Admin | กลุ่มสลิปรอตรวจสอบ |
| POST | `/api/orders/admin/verify-slip` | Admin | ยืนยัน/ปฏิเสธสลิป |
| GET | `/api/orders/admin/payouts` | Admin | รายการรอจ่ายให้ร้าน |
| POST | `/api/orders/admin/payouts/confirm` | Admin | ยืนยันการจ่ายเงินให้ร้าน |
| GET | `/api/orders/admin/payouts/history` | Admin | ประวัติการจ่ายเงินให้ร้าน |
| GET | `/api/orders/merchant/payouts` | ผู้ใช้ | รายการรับเงินของร้าน |
| GET | `/api/shops/mine/payouts` | ผู้ใช้ | Alias ของรายการรับเงินร้าน |
| POST | `/api/payments/orders/{orderId:guid}/intent` | ผู้ใช้ | สร้าง Stripe Payment Intent สำหรับออเดอร์ |
| POST | `/api/payments/orders/{orderId:guid}/sync` | ผู้ใช้ | ซิงก์สถานะการจ่ายเงินของออเดอร์ |
| GET | `/api/payments/orders/summary` | ผู้ใช้ | สรุปหลายออเดอร์ (`orderIds`) |
| POST | `/api/payments/batch/intent` | ผู้ใช้ | สร้าง Payment Intent สำหรับหลายออเดอร์ |
| POST | `/api/payments/batch/sync` | ผู้ใช้ | ซิงก์สถานะการจ่ายเงินหลายออเดอร์ |
| POST | `/api/payments/webhook` | สาธารณะ* | Stripe webhook; ตรวจสอบลายเซ็นจาก Stripe |

### เนื้อหา หมวดหมู่ แท็ก กำหนดการ และการมีส่วนร่วม

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| GET | `/api/contents` | สาธารณะ | ค้นหาเนื้อหา (`page`, `pageSize`, `categoryId`, `tag`, `search`, `shopId`) |
| GET | `/api/contents/{id:guid}` | สาธารณะ | รายละเอียดเนื้อหา |
| GET | `/api/contents/{id:guid}/shop-products` | สาธารณะ | สินค้าร้านที่เกี่ยวข้อง (`take`) |
| GET | `/api/contents/mine` | ผู้ใช้ | เนื้อหาของฉัน (`page`, `pageSize`) |
| GET | `/api/contents/mine/{id:guid}` | ผู้ใช้ | เนื้อหาของฉันตาม ID |
| GET | `/api/contents/admin` | Admin | รายการเนื้อหาสำหรับผู้ดูแล (`page`, `pageSize`, `status`, `search`) |
| GET | `/api/contents/admin/{id:guid}` | Admin | รายละเอียดเนื้อหาสำหรับผู้ดูแล |
| POST | `/api/contents` | ผู้ใช้ | สร้างเนื้อหา |
| PUT | `/api/contents/{id:guid}` | ผู้ใช้ | แก้ไขเนื้อหา |
| DELETE | `/api/contents/{id:guid}` | ผู้ใช้ | ลบเนื้อหา |
| GET | `/api/content-categories` | สาธารณะ | หมวดหมู่เนื้อหา (`page`, `pageSize`) |
| GET | `/api/content-categories/{id:guid}` | สาธารณะ | หมวดหมู่เนื้อหาตาม ID |
| GET | `/api/content-categories/admin` | Admin | หมวดหมู่เนื้อหาสำหรับผู้ดูแล (`page`, `pageSize`, `search`) |
| GET | `/api/content-categories/admin/{id:guid}` | Admin | รายละเอียดหมวดหมู่เนื้อหา |
| POST | `/api/content-categories` | Admin | เพิ่มหมวดหมู่เนื้อหา |
| PUT | `/api/content-categories/{id:guid}` | Admin | แก้ไขหมวดหมู่เนื้อหา |
| DELETE | `/api/content-categories/{id:guid}` | Admin | ลบหมวดหมู่เนื้อหา |
| GET | `/api/tags` | สาธารณะ | รายการแท็ก |
| GET | `/api/tags/{id:guid}` | สาธารณะ | แท็กตาม ID |
| GET | `/api/tags/admin` | Admin | แท็กสำหรับผู้ดูแล (`page`, `pageSize`, `search`) |
| GET | `/api/tags/admin/{id:guid}` | Admin | รายละเอียดแท็ก |
| POST | `/api/tags` | Admin | สร้างแท็ก |
| PUT | `/api/tags/{id:guid}` | Admin | แก้ไขแท็ก |
| DELETE | `/api/tags/{id:guid}` | Admin | ลบแท็ก |
| GET | `/api/schedules` | สาธารณะ | กำหนดการ (`contentId`, `shopId`, `from`, `to`) |
| GET | `/api/schedules/{id:guid}` | สาธารณะ | กำหนดการตาม ID |
| GET | `/api/schedules/admin` | Admin | กำหนดการสำหรับผู้ดูแล (`contentId`) |
| GET | `/api/schedules/admin/{id:guid}` | Admin | รายละเอียดกำหนดการ |
| POST | `/api/schedules` | ผู้ใช้ | สร้างกำหนดการ |
| PUT | `/api/schedules/{id:guid}` | ผู้ใช้ | แก้ไขกำหนดการ |
| DELETE | `/api/schedules/{id:guid}` | ผู้ใช้ | ลบกำหนดการ |
| POST | `/api/content-views/{contentId:guid}` | สาธารณะ | บันทึกการเข้าชมเนื้อหา |
| GET | `/api/content-views/history` | ผู้ใช้ | ประวัติการเข้าชม (`take`) |
| GET | `/api/content-favorites` | ผู้ใช้ | เนื้อหาที่ฉันบันทึกไว้ |
| GET | `/api/content-favorites/{contentId:guid}` | ผู้ใช้ | สถานะรายการโปรด |
| POST | `/api/content-favorites/{contentId:guid}` | ผู้ใช้ | เพิ่มรายการโปรด |
| DELETE | `/api/content-favorites/{contentId:guid}` | ผู้ใช้ | ลบรายการโปรด |
| GET | `/api/content-reviews/{contentId:guid}` | สาธารณะ | รีวิวเนื้อหา |
| GET | `/api/content-reviews/mine/{contentId:guid}` | ผู้ใช้ | รีวิวของฉันสำหรับเนื้อหานี้ |
| POST | `/api/content-reviews/{contentId:guid}` | ผู้ใช้ | สร้างหรือแทนที่รีวิว |
| PUT | `/api/content-reviews/{reviewId:guid}` | ผู้ใช้ | แก้ไขรีวิว |
| DELETE | `/api/content-reviews/{reviewId:guid}` | ผู้ใช้ | ลบรีวิว |
| GET | `/api/content-tags` | Admin | ความสัมพันธ์เนื้อหา-แท็ก (`contentId`) |
| POST | `/api/content-tags` | Admin | ผูกแท็กกับเนื้อหา |
| PUT | `/api/content-tags/{contentId:guid}` | Admin | แทนที่แท็กทั้งหมดของเนื้อหา |
| DELETE | `/api/content-tags/{contentId:guid}/{tagId:guid}` | Admin | เอาแท็กออกจากเนื้อหา |

### รายงาน แดชบอร์ด และ Export

| Method | Route | สิทธิ์ | หน้าที่ |
| --- | --- | --- | --- |
| POST | `/api/reports` | ผู้ใช้ | แจ้งรายงานเนื้อหา/รายการ |
| GET | `/api/reports/admin` | Admin | รายการรายงาน (`status`) |
| PATCH | `/api/reports/{reportId:guid}/status` | Admin | เปลี่ยนสถานะรายงาน |
| GET | `/api/admin/dashboard` | Admin | Dashboard ผู้ดูแล (`from`, `to`) |
| GET | `/api/shops/mine/exports/orders` | สาธารณะ** | Export ออเดอร์ร้าน (`from`, `to`, `orderStatus`, `paymentStatus`, `payoutStatus`, `format`) |
| GET | `/api/shops/mine/exports/products` | สาธารณะ** | Export ยอดขายรายสินค้า (`from`, `to`, `format`) |
| GET | `/api/shops/mine/exports/payouts` | สาธารณะ** | Export ประวัติรับเงิน (`from`, `to`, `format`) |
| GET | `/api/admin/exports/orders` | Admin | Export ออเดอร์ทั้งหมด (`from`, `to`, `shopId`, `orderStatus`, `paymentStatus`, `payoutStatus`, `format`) |
| GET | `/api/admin/exports/shop-sales` | Admin | Export ยอดขายแยกร้าน (`from`, `to`, `format`) |
| GET | `/api/admin/exports/payouts` | Admin | Export รายการโอนให้ร้าน (`from`, `to`, `shopId`, `format`) |
| GET | `/api/admin/exports/payment-slips` | Admin | Export สลิปชำระเงิน (`from`, `to`, `paymentStatus`, `format`) |

\* แม้ route จะไม่บังคับ JWT แต่เป็น endpoint สำหรับ Stripe เท่านั้นและตรวจสอบ webhook signature ในระบบ

\** ปัจจุบัน Controller ของ merchant export มี `[Authorize]` ถูกคอมเมนต์ไว้ จึงเข้าถึงได้โดยไม่ต้องส่ง JWT ตามโค้ดจริง; ควรเปิดใช้ `[Authorize]` ก่อนใช้งานจริงเพื่อป้องกันข้อมูลร้านค้า
