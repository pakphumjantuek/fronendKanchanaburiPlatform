# ออเดอร์ การจัดส่ง และรีวิวสินค้า (Flutter API Guide)

เอกสารสำหรับ Flutter ใช้ API ชุดเดียวกับเว็บ โดย base URL คือ `.../api` และทุก endpoint ด้านล่างต้องส่ง Bearer token

## สถานะที่แสดงในแอป

| ค่า API | ข้อความภาษาไทย | ผู้ดำเนินการ |
| --- | --- | --- |
| `Pending` | รอยืนยันออเดอร์ | ร้านค้า |
| `Confirmed` | ยืนยันออเดอร์แล้ว | ร้านค้า |
| `Processing` | กำลังเตรียมจัดส่ง | ร้านค้า |
| `Shipped` | จัดส่งแล้ว | ร้านค้า |
| `Completed` | สำเร็จสมบูรณ์ | ลูกค้า |
| `Cancelled` | ยกเลิกแล้ว | ร้านค้า / ผู้ดูแลระบบ |

`PaymentStatus` เป็นข้อมูลการชำระเงินแยกจาก `OrderStatus` ร้านค้าไม่ต้องเปลี่ยนสถานะการชำระเงินเอง

## ลำดับการทำงาน

```text
ชำระเงินสำเร็จ
  → Pending (รอยืนยัน)
  → Confirmed (ยืนยันออเดอร์แล้ว)
  → Processing (เตรียมจัดส่ง)
  → Shipped (จัดส่งแล้ว)
  → Completed (ลูกค้ายืนยันรับสินค้าแล้ว)
```

ร้านค้าเปลี่ยนได้เฉพาะ `Pending → Confirmed/Cancelled` และ `Confirmed → Processing` เท่านั้น ส่วนการเปลี่ยนเป็น `Shipped` ต้องบันทึกเลขพัสดุผ่าน endpoint การจัดส่ง

## ข้อมูลออเดอร์

`GET /orders/{orderId}`

ใช้สำหรับหน้ารายละเอียดออเดอร์ของลูกค้าหรือร้านเจ้าของออเดอร์ ผลลัพธ์สำคัญ:

```json
{
  "orderId": "guid",
  "orderNumber": "ORD-...",
  "orderStatus": "Shipped",
  "paymentStatus": "Paid",
  "receiverName": "ชื่อลูกค้า",
  "receiverPhone": "0812345678",
  "shippingAddress": "ที่อยู่จัดส่ง",
  "shippingMethod": "Delivery",
  "items": [
    {
      "orderItemId": "guid",
      "productId": "guid",
      "productName": "สินค้าตัวอย่าง",
      "imageUrl": "/uploads/products/example.jpg",
      "quantity": 2,
      "unitPrice": 90,
      "totalPrice": 180
    }
  ],
  "shipment": {
    "shippingProvider": "Flash Express",
    "trackingNumber": "TH123456789",
    "shippingStatus": "Shipped",
    "shippedAt": "2026-09-22T10:00:00Z",
    "deliveredAt": null
  }
}
```

ถ้า `imageUrl` ขึ้นต้นด้วย `/` ให้ต่อกับ API origin โดยตัด `/api` ออกก่อน เช่น `https://host/uploads/...`

## รายการออเดอร์ของร้านค้า

`GET /orders/shop/mine`

ร้านค้าจะได้รับเฉพาะออเดอร์ที่ `paymentStatus = Paid` พร้อม `items` และรูปสินค้า จึงไม่ต้องแสดงหรือจัดการขั้นตอน “รอชำระเงิน”

Query ที่ใช้ได้:

| Query | ตัวอย่าง | ความหมาย |
| --- | --- | --- |
| `status` | `Pending`, `Confirmed`, `Processing`, `Shipped` | กรองตามขั้นตอนงานของร้าน |
| `search` | `ORD-2569` | ค้นหาเลขคำสั่งซื้อ |
| `startDate` | `2026-09-01` | วันเริ่มต้น |
| `endDate` | `2026-09-30` | วันสิ้นสุด (Backend รวมทั้งวันให้อัตโนมัติ) |

## การทำงานของร้านค้า

### 1. ยืนยันออเดอร์ / เตรียมจัดส่ง

`PATCH /orders/{orderId}/status`

```json
{ "status": "Confirmed" }
```

หลังยืนยันแล้วให้เรียกอีกครั้งเพื่อเตรียมจัดส่ง:

```json
{ "status": "Processing" }
```

ร้านค้าสามารถยกเลิกได้เฉพาะขณะ `Pending`:

```json
{ "status": "Cancelled" }
```

ห้ามส่ง `paymentStatus` จากแอปร้านค้า เพราะ Backend จะปฏิเสธ

### 2. บันทึกการจัดส่ง

`PUT /orders/{orderId}/shipment`

เรียกได้เฉพาะออเดอร์ `Processing` และชำระเงินแล้ว ระบบจะเปลี่ยนออเดอร์เป็น `Shipped`

```json
{
  "shippingProvider": "Flash Express",
  "trackingNumber": "TH123456789"
}
```

## ลูกค้ายืนยันรับสินค้า

`PATCH /orders/{orderId}/shipment/status`

ลูกค้าเจ้าของออเดอร์เรียกได้เฉพาะออเดอร์ที่ `Paid` และ `Shipped`

```json
{ "status": "Completed" }
```

ระบบบันทึก `shipment.deliveredAt` และเปลี่ยน `orderStatus` เป็น `Completed` หรือ “สำเร็จสมบูรณ์” หลังจากนั้นร้านไม่สามารถเปลี่ยนสถานะต่อได้

## รีวิวสินค้า

รีวิวผูกกับ `orderId` และ `productId` เพื่อให้ลูกค้าซื้อสินค้าเดิมคนละออเดอร์แล้วรีวิวได้แยกกัน

### ตรวจว่าสินค้าใดในออเดอร์รีวิวแล้ว

`GET /product-reviews/my-reviews?orderId={orderId}`

คืน `string[]` ของ `productId` ที่ผู้ใช้รีวิวแล้วในออเดอร์นี้เท่านั้น

### สร้างหรือแก้ไขรีวิวของสินค้าในออเดอร์

`POST /product-reviews`

```json
{
  "orderId": "guid",
  "productId": "guid",
  "rating": 5,
  "comment": "สินค้าได้รับครบถ้วน คุณภาพดี"
}
```

Backend ตรวจว่า:

- ผู้ใช้เป็นเจ้าของ `orderId`
- ออเดอร์มีสถานะ `Completed`
- `productId` อยู่ในรายการสินค้าของออเดอร์นั้น
- หนึ่งสินค้าในหนึ่งออเดอร์มีรีวิวเดียว; ส่งซ้ำจะอัปเดตรีวิวเดิม

หน้าจอ Flutter ต้องแสดงปุ่ม “เขียนรีวิวสินค้า” เฉพาะเมื่อ `orderStatus == "Completed"`

## ข้อกำหนดก่อน Deploy

ต้อง apply migrations ฝั่ง Backend ก่อนใช้งานจริง:

- `AddOrderItemProductDeal` — เพิ่มการอ้างอิงดีลใน `OrderItems`
- `AddReviewOrderReference` — เพิ่ม `Reviews.OrderId` เพื่อแยกรีวิวรายออเดอร์
