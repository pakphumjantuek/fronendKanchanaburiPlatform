# เวลาหมดอายุการชำระเงิน (Flutter API Guide)

หลัง checkout แต่ละออเดอร์มีเวลาชำระ **30 นาที** โดย API ส่ง `paymentExpiresAt` ในข้อมูลออเดอร์

```json
{
  "orderId": "guid",
  "orderStatus": "Pending",
  "paymentStatus": "Pending",
  "createdAt": "2026-09-21T04:49:53",
  "paymentExpiresAt": "2026-09-21T05:19:53"
}
```

## สิ่งที่ Flutter ต้องทำ

- อ่าน `paymentExpiresAt` เป็น UTC หาก API ไม่มี suffix timezone แล้วแสดงเป็นเวลาไทย UTC+7
- แสดง countdown จากเวลาปัจจุบันถึง `paymentExpiresAt` เฉพาะเมื่อ `orderStatus = Pending` และ `paymentStatus = Pending`
- แสดงข้อความ `กรุณาชำระภายใน HH:MM:SS นาที`
- เมื่อหมดเวลา ซ่อนหรือปิดปุ่มชำระเงิน และแสดง `หมดเวลาชำระเงินแล้ว สินค้าถูกคืนเข้าสต็อก`
- ใช้ `paymentExpiresAt` เป็นเวลาอ้างอิงเสมอ; ไม่ควรคำนวณจาก `createdAt` เมื่อมีค่านี้

## สถานะหมดเวลา

เมื่อ Backend หมดเวลาอัตโนมัติ จะส่งสถานะ:

```json
{
  "orderStatus": "Expired",
  "paymentStatus": "Expired"
}
```

`Expired` คือระบบยกเลิกเพราะไม่ชำระภายในเวลา ต่างจาก `Cancelled` ซึ่งเป็นการยกเลิกคำสั่งซื้อทั่วไป
