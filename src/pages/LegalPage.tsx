import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { ShieldCheck, FileText } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const { path } = useRouter();
  const [tab, setTab] = useState<'privacy' | 'terms'>(
    path.includes('/terms') ? 'terms' : 'privacy'
  );

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-[#231E1B]">
            {tab === 'privacy' ? 'Maxfiylik Siyosati' : 'Foydalanish Shartlari'}
          </h1>
          <p className="text-xs text-[#7A6A63]">
            Oxirgi yangilanish: 2026-yil 1-avgust
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl glass-panel text-xs font-semibold">
            <button
              onClick={() => setTab('privacy')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'privacy' ? 'bg-[#231E1B] text-white shadow-xs' : 'text-[#5C4F48]'
              }`}
            >
              Maxfiylik Siyosati (Privacy)
            </button>
            <button
              onClick={() => setTab('terms')}
              className={`px-4 py-2 rounded-xl transition-all ${
                tab === 'terms' ? 'bg-[#231E1B] text-white shadow-xs' : 'text-[#5C4F48]'
              }`}
            >
              Foydalanish Shartlari (Terms)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-white/95 shadow-md text-xs sm:text-sm text-[#4A3E39] space-y-5 leading-relaxed">
          {tab === 'privacy' ? (
            <>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                1. Ma’lumotlarni yig‘ish va ulardan foydalanish
              </h3>
              <p>
                Taklifim platformasi mijozlar tomonidan yaratilgan taklifnomalar va mehmonlarning RSVP tasdiqlari bo‘yicha kiritilgan ma’lumotlarni faqatgina tadbirni tashkillashtirish va mezbonlarga yetkazish maqsadida qayta ishlaydi.
              </p>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                2. Mehmonlar ma’lumotlarining xavfsizligi
              </h3>
              <p>
                Mehmonlar tomonidan qoldirilgan ism, telefon raqami va tabriklar uchinchi shaxslarga berilmaydi hamda tijoriy maqsadlarda tarqatilmaydi. Taklifnoma egasi istalgan vaqtda ushbu ma’lumotlarni kabinetidan o‘chirishi mumkin.
              </p>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                3. Fotosuratlar va media fayllar
              </h3>
              <p>
                Foydalanuvchilar tomonidan yuklangan fotosuratlar faqat ularning taklifnoma sahifasida namoyish etiladi.
              </p>
            </>
          ) : (
            <>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                1. Xizmat ko‘rsatish shartlari
              </h3>
              <p>
                Taklifim xizmati foydalanuvchilarga shaxsiy tadbirlari uchun raqamli veb-sahifa va video taklifnoma tayyorlash imkoniyatini beradi. Platformadagi barcha shablonlar mualliflik huquqi bilan himoyalangan.
              </p>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                2. Taklifnoma havolalarining amal qilish muddati
              </h3>
              <p>
                Tanlangan tarifga ko‘ra taklifnomalar 6 oydan 12 oygacha yoki muddatsiz arxiv holatida internet tarmog‘ida faol saqlanadi.
              </p>
              <h3 className="font-playfair text-lg font-bold text-[#231E1B]">
                3. Javobgarlik chegarasi
              </h3>
              <p>
                Foydalanuvchi taklifnomaga kiritayotgan matnlar va fotosuratlarning qonuniyligi uchun shaxsan o‘zi javobgardir.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
