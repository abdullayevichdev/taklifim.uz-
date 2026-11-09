import React, { useState, useMemo } from 'react';
import { useLanguage } from '../locales';
import { mockFaq } from '../data/mockFaq';
import { Search, ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'website' | 'video' | 'payment'>('all');
  const [openId, setOpenId] = useState<string>('faq-1');

  const filteredFaq = useMemo(() => {
    return mockFaq.filter((f) => {
      const matchCat = category === 'all' || f.category === category;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        f.question[language].toLowerCase().includes(q) ||
        f.answer[language].toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [category, search, language]);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel text-xs font-bold text-[#D9658B]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Savol-Javoblar</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#231E1B]">
            Ko‘p Beriladigan Savollar
          </h1>
          <p className="text-sm text-[#5C4F48]">
            Taklifim platformasi, veb va video taklifnomalar bo‘yicha barcha javoblar
          </p>
        </div>

        {/* Search bar & Category filters */}
        <div className="glass-panel-elevated rounded-3xl p-4 sm:p-5 border border-white/95 shadow-md space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A7C74] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Savolingiz bo‘yicha qidiring..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#231E1B] outline-none border border-black/5"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'website', label: 'Veb Taklifnomalar' },
              { id: 'video', label: 'Video Taklifnomalar' },
              { id: 'payment', label: 'To‘lov va Hisob-kitob' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  category === cat.id
                    ? 'bg-[#231E1B] text-white shadow-xs'
                    : 'glass-panel text-[#5C4F48] hover:bg-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaq.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#7A6A63]">
              Savollar topilmadi. Qidiruv so‘zini o‘zgartiring.
            </div>
          ) : (
            filteredFaq.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl border border-white/90 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? '' : item.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#231E1B] hover:bg-white/40"
                  >
                    <span>{item.question[language] || item.question.uz}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8A7C74] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-[#5C4F48] leading-relaxed border-t border-black/5 animate-fadeIn">
                      {item.answer[language] || item.answer.uz}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
