import React, { useState } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useLanguage } from '../locales';
import { mockPlans } from '../data/mockPlans';
import { mockFaq } from '../data/mockFaq';
import { formatPriceUZS } from '../utils/logic';
import {
  CheckCircle2,
  X,
  Sparkles,
  ChevronDown,
  Gift,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { language } = useLanguage();
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');

  // Detailed comparison matrix features including Free plan
  const comparisonFeatures = [
    { name: 'Katalogdagi shablonlar', free: 'Tanlangan shablon', std: 'Barchasi', per: 'Barchasi', prm: 'Barchasi + Maxsus dizayn' },
    { name: 'Shaxsiy havola va QR-kod', free: true, std: true, per: true, prm: true },
    { name: 'Musiqa va ovozli ijro', free: false, std: true, per: true, prm: true },
    { name: 'Interaktiv xarita va navigatsiya', free: true, std: true, per: true, prm: true },
    { name: 'Fotosuratlar soni', free: '1 ta', std: '2 ta', per: '10 tagacha', prm: 'Cheksiz' },
    { name: 'Dastur (Schedule) jadvali', free: false, std: false, per: true, prm: true },
    { name: 'Dres-kod palitrasi', free: false, std: false, per: true, prm: true },
    { name: 'Mehmonlar RSVP tizimi', free: '25 mehmongacha', std: false, per: true, prm: true },
    { name: 'Mijoz kabineti (Dashboard)', free: true, std: false, per: true, prm: true },
    { name: '4K Video Taklifnoma', free: false, std: false, per: false, prm: true },
    { name: 'Shaxsiy monogramma yaratish', free: false, std: false, per: false, prm: true },
    { name: 'Havola faollik muddati', free: '30 kun', std: '6 oy', per: '12 oy', prm: 'Muddatsiz arxiv' },
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen space-y-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs font-bold text-[#B48B47]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shaffof, Qulay va Tekin Imkoniyat</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#231E1B] tracking-tight">
            Tariflar va Narxlar
          </h1>
          <p className="text-sm text-[#5C4F48] leading-relaxed">
            Qog‘oz taklifnomalarga qaraganda ancha tejamkor, zamonaviy va mehmonlaringiz uchun qulay raqamli yechimlar.
          </p>
        </div>

        {/* 4 Pricing Cards: Free, Standard, Personalized, Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {mockPlans.map((plan) => {
            const isFree = plan.price === 0;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.isPopular
                    ? 'glass-panel-elevated border-2 border-[#D9658B]/70 shadow-xl bg-gradient-to-b from-white/95 to-[#FBF8F5]/90 -translate-y-2 ring-2 ring-[#D9658B]/20'
                    : isFree
                    ? 'glass-panel-elevated border-2 border-emerald-400/80 shadow-md bg-gradient-to-b from-white/95 to-emerald-50/40 hover:border-emerald-500'
                    : 'glass-panel border border-white/80 shadow-xs hover:border-black/10 hover:shadow-md'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#D9658B] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap">
                    ⭐ Eng Ommabop
                  </div>
                )}

                {isFree && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    <span>1 Marta Tekin</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#231E1B]">
                      {plan.name[language] || plan.name.uz}
                    </h3>
                  </div>

                  <p className="text-xs text-[#7A6A63] mt-1.5 min-h-[38px] leading-relaxed">
                    {plan.description[language] || plan.description.uz}
                  </p>

                  <div className="my-5 pb-5 border-b border-black/5">
                    {isFree ? (
                      <div>
                        <span className="font-playfair text-3xl font-extrabold text-emerald-700">
                          0 so‘m
                        </span>
                        <span className="text-xs text-emerald-600 font-semibold block mt-1">
                          1 marta bepul sinab ko‘ring
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-playfair text-3xl font-extrabold text-[#231E1B]">
                          {formatPriceUZS(plan.price)}
                        </span>
                        <span className="text-xs text-[#8A7C74] block mt-1">
                          bir marotaba to‘lanadi
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {(plan.features[language] || plan.features.uz).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#3A2D28]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={plan.slug === 'premium' ? '/premium' : '/templates'}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-bold text-center block transition-all shadow-xs ${
                      isFree
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 hover:shadow-md'
                        : plan.isPopular
                        ? 'bg-gradient-to-r from-[#F5C9D8] to-[#F5EBDD] text-[#231E1B] hover:shadow-md'
                        : 'bg-white text-[#231E1B] border border-black/10 hover:bg-black/5'
                    }`}
                  >
                    {isFree
                      ? 'Bepul Boshlash'
                      : plan.slug === 'premium'
                      ? 'Video Buyurtma Berish'
                      : 'Shablonni Tanlash'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Comparison Table */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/95 shadow-md space-y-6">
          <div className="text-center max-w-lg mx-auto">
            <h3 className="font-playfair text-2xl font-bold text-[#231E1B]">
              Tariflar o‘rtasidagi farq
            </h3>
            <p className="text-xs text-[#7A6A63] mt-1">
              Barcha imkoniyatlarni batafsil solishtiring
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/10 text-[#7A6A63]">
                  <th className="py-3 px-4 font-bold text-[#231E1B]">Xususiyatlar</th>
                  <th className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/40 rounded-t-xl">1 Marta Tekin</th>
                  <th className="py-3 px-4 text-center font-bold">Standard</th>
                  <th className="py-3 px-4 text-center font-bold text-[#D9658B]">Personalized</th>
                  <th className="py-3 px-4 text-center font-bold">Individual Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#231E1B]">{row.name}</td>
                    <td className="py-3 px-4 text-center text-emerald-800 bg-emerald-50/20 font-medium">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-300 mx-auto" />
                        )
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-[#5C4F48]">
                      {typeof row.std === 'boolean' ? (
                        row.std ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-300 mx-auto" />
                        )
                      ) : (
                        row.std
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#231E1B]">
                      {typeof row.per === 'boolean' ? (
                        row.per ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-300 mx-auto" />
                        )
                      ) : (
                        row.per
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-[#1E3A5F]">
                      {typeof row.prm === 'boolean' ? (
                        row.prm ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-rose-300 mx-auto" />
                        )
                      ) : (
                        row.prm
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQs */}
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-6">
            <h3 className="font-playfair text-2xl font-bold text-[#231E1B]">
              Narxlar bo‘yicha savollar
            </h3>
          </div>

          <div className="space-y-3">
            {mockFaq.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="glass-panel rounded-2xl border border-white/80 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#231E1B]"
                  >
                    <span>{faq.question[language]}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8A7C74] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-[#5C4F48] leading-relaxed border-t border-black/5 pt-3 animate-fadeIn">
                      {faq.answer[language]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
