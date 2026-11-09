import { FAQItem, Testimonial } from '../types';

export const mockFaq: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'website',
    question: {
      uz: 'Raqamli veb-taklifnoma qanday ishlaydi?',
      ru: 'Как работает цифровое веб-приглашение?',
      en: 'How does a digital web invitation work?',
    },
    answer: {
      uz: 'Siz tanlagan shablon asosida shaxsiy havola (masalan, taklifim.uz/i/nodir-malika) yaratiladi. Mehmonlar havolani bosganda, ularning telefonida audio, fotoalbom, xarita va RSVP tashrif tasdiqlash imkoniyati bo‘lgan go‘zal interaktiv sahifa ochiladi.',
      ru: 'Создаётся уникальная ссылка (например, taklifim.uz/i/nodir-malika). Переходя по ней, гости открывают на своём телефоне персональную интерактивную страницу с музыкой, галереей, локацией на карте и кнопкой подтверждения присутствия.',
      en: 'A personalized link is generated for your event. When guests tap the link on mobile or desktop, an elegant webpage opens featuring music, interactive map directions, photo galleries, and instant RSVP attendance confirmation.',
    },
  },
  {
    id: 'faq-2',
    category: 'website',
    question: {
      uz: 'Mehmonlarim RSVP orqali javob berishsa, buni qayerda ko‘raman?',
      ru: 'Где я увижу ответы гостей на RSVP?',
      en: 'Where do I view guest RSVP responses?',
    },
    answer: {
      uz: 'Taklifim mijoz kabinetida (Dashboard) maxsus «Mehmonlar ro‘yxati» bo‘limi mavjud. U yerda kimlar qatnashishi, necha kishi bo‘lib kelishi, ularning taom tanlovi va ezgu tilaklari jadval ko‘rinishida jamlanadi.',
      ru: 'В личном кабинете на платформе доступна вкладка «Список гостей (RSVP)». Там отображаются все подтверждения: кто придёт, количество гостей, предпочтения по блюдам и тёплые пожелания.',
      en: 'In your Taklifim Customer Dashboard under "Guest List (RSVP)", all confirmations, companion counts, dietary selections, and congratulations are automatically cataloged and exportable.',
    },
  },
  {
    id: 'faq-3',
    category: 'video',
    question: {
      uz: 'Video taklifnoma buyurtmasi qancha vaqtda tayyor bo‘ladi?',
      ru: 'Сколько времени занимает создание видеоприглашения?',
      en: 'How long does custom video invitation creation take?',
    },
    answer: {
      uz: 'Video taklifnomalar fotosuratlaringiz va matnlaringiz qabul qilingandan so‘ng 24 dan 48 soatgacha bo‘lgan vaqt ichida Full HD / 4K formatda tayyorlanadi va Telegram orqali yuboriladi.',
      ru: 'После отправки фотографий и текста ваше видеоприглашение создаётся за 24–48 часов в качестве Full HD или 4K и отправляется в Telegram.',
      en: 'Video invitations are delivered within 24 to 48 hours in Full HD or 4K format directly via Telegram or email once photos and details are submitted.',
    },
  },
  {
    id: 'faq-4',
    category: 'general',
    question: {
      uz: 'Taklifnomani bir nechta tilda yaratish mumkinmi?',
      ru: 'Можно ли создать приглашение на нескольких языках?',
      en: 'Can invitations be presented in multiple languages?',
    },
    answer: {
      uz: 'Ha! Taklifim o‘zbekcha, ruscha va inglizcha tillarni to‘liq qo‘llab-quvvatlaydi. Mehmon taklifnoma sahifasida o‘zi xohlagan tilni bir zumda tanlashi mumkin.',
      ru: 'Да! Платформа Taklifim полностью поддерживает узбекский, русский и английский языки. Гости могут переключать язык приглашения в один клик.',
      en: 'Yes! Taklifim natively supports Uzbek, Russian, and English. Guests can effortlessly switch languages directly from the invitation header.',
    },
  },
  {
    id: 'faq-5',
    category: 'payment',
    question: {
      uz: 'To‘lov usullari qanday?',
      ru: 'Какие способы оплаты поддерживаются?',
      en: 'What payment methods are supported?',
    },
    answer: {
      uz: 'Ushbu prototipda barcha to‘lovlar demonstratsion rejimda ishlaydi. Kelgusida Payme, Click va Uzum Bank orqali xavfsiz onlayn to‘lovlar yo‘lga qo‘yiladi.',
      ru: 'В данной демонстрационной версии платежи имитируются в безопасном демо-режиме. В рабочей версии будут доступны Payme, Click и Uzum Bank.',
      en: 'In this demonstration version, checkouts run in simulated demo mode. Integration with regional payment gateways (Payme, Click, Uzum) is planned.',
    },
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Farrux & Kamola Zokirovalar',
    event: {
      uz: 'Nikoh to‘yi',
      ru: 'Свадебное торжество',
      en: 'Wedding Celebration',
    },
    text: {
      uz: '«Aurelia» shablonidan foydalandik. Qog‘oz taklifnomalarga qaraganda ancha qulay, mehmonlarimiz musiqasi va xaritasini ko‘rib juda hayratda qolishdi!',
      ru: 'Выбрали шаблон Aurelia. Намного удобнее бумажных открыток, гости были в восторге от музыки и карты локации!',
      en: 'We chose the Aurelia template. Far more practical than paper cards, and our guests were mesmerized by the music and map integration!',
    },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-2',
    name: 'Dilnoza Karimova',
    event: {
      uz: 'Yubiley kechasi',
      ru: 'Юбилейный вечер',
      en: 'Anniversary Soirée',
    },
    text: {
      uz: 'Menga eng yoqqan tomoni — mehmonlar RSVP orqali aniq kimlar kelishini oldindan bildirishdi. Restoranga stollarni rejalashtirishda juda asqotdi.',
      ru: 'Больше всего понравилось, что гости подтвердили присутствие онлайн. Это очень помогло при рассадке в ресторане!',
      en: 'The RSVP feature was a lifesaver for restaurant seating and planning headcount accurately.',
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-3',
    name: 'Alisher & Shahnoza',
    event: {
      uz: 'Zamonaviy to‘y',
      ru: 'Современная свадьба',
      en: 'Modern Wedding',
    },
    text: {
      uz: 'Dizayn juda nafis, Liquid Glass uslubi zamonaviy smartfonlarda Apple interfeysiday mayin va tezkor ochilar ekan. 10/10!',
      ru: 'Дизайн потрясающий, стеклянный стиль Liquid Glass на смартфонах выглядит как нативное приложение Apple!',
      en: 'The Liquid Glass aesthetic feels like an Apple native app on mobile. Smooth, fast, and exquisite!',
    },
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
];

export const mockStats = {
  totalInvitations: 3420,
  totalTemplates: 8,
  totalGuests: 84500,
  totalViews: 412000,
  isDemoNotice: 'Ushbu ko‘rsatkichlar platformaning demonstratsion ma’lumotlari hisoblanadi.',
};
