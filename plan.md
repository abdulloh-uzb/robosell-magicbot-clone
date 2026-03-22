# Tasks

## 1. Telegram Integration
- Telegram guruh yoki kanal dashboard ga ulansin
- Kanalga dashboard dan post yozsa bo'lsin
- Guruhga kelgan har bir message real-time dashboard ga tushsin
- Dashboard dan shu messagelarga javob yozsa bo'lsin
- Real-time: yangi message kelganda sahifa refresh qilmasdan ko'rinsin (WebSocket yoki polling)

## 2. Instagram Integration
- Instagram akkaunt dashboard ga ulansin
- DM lardagi messagelar dashboard ga tushsin
- Leadlar dashboard ga tushsin
- Dashboard dan javob yozsa bo'lsin
- Real-time: yangi DM kelganda sahifa refresh qilmasdan ko'rinsin (WebSocket yoki polling)

## 3. Product Variants & Images
- Har bir productning variantlari bo'lsin (rang, o'lcham va h.k.)
- Har bir variant uchun alohida narx va soni bo'lsin
- Productga rasm qo'shish imkoni bo'lsin (dashboard da)
- Har bir variantga ham alohida rasm qo'ysa bo'lsin
- O'zgarishlar online do'konda ham real-time aks etsin:
  - Variant tanlaganda narx va mavjudlik yangilansin
  - Rasm gallereyasi ishlash kerak
  - Stokda yo'q variantlar disabled ko'rinsin

## 4. Online Store & Order System
- Avval codebaseda buyurtma sistemasi borligini tekshir
- Yo'q bo'lsa qo'sh:

  **Online do'kon (mijoz tomoni):**
  - Mijoz productlarni ko'rsin, variant tanlashsin
  - Buyurtma berishdan oldin telefon raqam va lokatsiya kiritsin
  - Buyurtma tasdiqlangach mijozga confirmation ko'rinsin

  **Dashboard (do'kon egasi tomoni):**
  - Yangi buyurtma kelganda real-time notification kelsin (refresh kerak emas)
  - Buyurtmani ko'rish: mijoz ma'lumotlari, lokatsiya, buyurtma tarkibi
  - Buyurtma statusini boshqarish (yangi → jarayonda → yetkazildi)
  - Status o'zgarganda mijoz do'konida ham real-time yangilansin

## 5. Analitika / Statistika
- Dashboard da umumiy statistika ko'rinsin:
  - Kunlik / haftalik / oylik buyurtmalar soni
  - Eng ko'p sotilgan productlar
  - Buyurtma statuslari bo'yicha breakdown
  - Telegram va Instagram dan kelgan leadlar soni

## 6. Multi-til (uz / ru / en)
- Dashboard va online do'kon ko'p tilni qo'llasin
- Til almashtirgich bo'lsin (uz / ru / en)
- Barcha statik textlar tarjima fayllariga ko'chirilsin

## Real-time texnologiya
- Laravel Reverb yoki Pusher ishlatilsin
- Barcha real-time qismlar (chat, buyurtmalar, statuslar) bitta WebSocket connection orqali ishlash kerak

## Boshlashdan oldin
- Codebaseni to'liq o'rganib chiq
- Hozir real-time uchun qanday texnologiya ishlatilganini tekshir (Reverb, Pusher, polling?)
- Tasklarni qaysi tartibda bajarish mantiqli ekanligini aniqla