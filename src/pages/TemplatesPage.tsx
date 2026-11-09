import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '../context/RouterContext';
import { useLanguage } from '../locales';
import { mockTemplates } from '../data/mockTemplates';
import { api } from '../services/api';
import { filterTemplates, formatPriceUZS } from '../utils/logic';
import { EventCategory, Template } from '../types';
import { CustomDropdown } from '../components/CustomDropdown';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  X,
  Palette,
} from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const { navigate } = useRouter();
  const { t, language } = useLanguage();

  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price_asc' | 'price_desc'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const list = await api.getTemplates();
      setTemplates(list);
    }
    load();

    const unsub = api.subscribe<Template[]>('templates', (updated) => {
      setTemplates(updated);
    });
    return () => unsub();
  }, []);

  const categories: { id: EventCategory; label: Record<string, string> }[] = [
    { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' } },
    { id: 'weddings', label: { uz: 'To‘y va Nikoh', ru: 'Свадьбы', en: 'Weddings' } },
    { id: 'engagements', label: { uz: 'Fotixa / Unashtiruv', ru: 'Помолвки', en: 'Engagements' } },
    { id: 'traditional', label: { uz: 'Milliy marosimlar', ru: 'Традиционные', en: 'Traditional' } },
    { id: 'birthdays', label: { uz: 'Tug‘ilgan kun / Yubiley', ru: 'Дни рождения', en: 'Birthdays' } },
    { id: 'baby_showers', label: { uz: 'Beshik to‘y / Chaqaloq', ru: 'Бешик туй', en: 'Baby Showers' } },
    { id: 'anniversaries', label: { uz: 'Nikoh yilligi', ru: 'Годовщины', en: 'Anniversaries' } },
  ];

  const filteredTemplates = useMemo(() => {
    return filterTemplates(templates, {
      category,
      query: searchQuery,
      sortBy,
      maxPrice,
      freeOnly,
    });
  }, [templates, category, searchQuery, sortBy, maxPrice, freeOnly]);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel border border-white/80 text-xs font-bold text-[#D9658B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-extrabold text-[#231E1B] tracking-tight">
            Nafis Taklifnoma Shablonlari
          </h1>
          <p className="text-sm text-[#5C4F48] leading-relaxed">
            Har bir marosimning o‘zgacha muhitini ifodalovchi, yuqori sifatli va zamonaviy raqamli shablonlar to‘plami.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel-elevated rounded-3xl p-4 sm:p-5 border border-white/95 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#8A7C74] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Shablon nomi yoki uslubi bo‘yicha qidirish..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#231E1B] placeholder-[#8A7C74] focus:outline-none focus:ring-2 focus:ring-[#D9658B]/40 transition-all border border-black/5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7C74] hover:text-[#231E1B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting & Filter toggle */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <CustomDropdown
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                options={[
                  {
                    value: 'popular',
                    label: language === 'ru' ? 'Популярные' : language === 'en' ? 'Most Popular' : 'Ommaboplar',
                  },
                  {
                    value: 'newest',
                    label: language === 'ru' ? 'Новые' : language === 'en' ? 'Newest' : 'Yangi qo‘shilganlar',
                  },
                  {
                    value: 'price_asc',
                    label: language === 'ru' ? 'Цена: по возрастанию' : language === 'en' ? 'Price: Low to High' : 'Narx: arzondan qimmatga',
                  },
                  {
                    value: 'price_desc',
                    label: language === 'ru' ? 'Цена: по убыванию' : language === 'en' ? 'Price: High to Low' : 'Narx: qimmatdan arzonga',
                  },
                ]}
              />

              <button
                type="button"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl glass-panel text-xs font-semibold text-[#4A3E39] hover:bg-white border border-black/5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtrlar</span>
              </button>
            </div>
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  category === cat.id
                    ? 'bg-[#231E1B] text-white shadow-xs'
                    : 'glass-panel text-[#5C4F48] hover:bg-white hover:text-[#231E1B] border border-black/5'
                }`}
              >
                {cat.label[language] || cat.label.uz}
              </button>
            ))}
          </div>

          {/* Collapsible advanced filters */}
          {showFiltersMobile && (
            <div className="pt-3 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5C4F48]">
              <div>
                <label className="font-semibold block mb-1">
                  Maksimal narx: {formatPriceUZS(maxPrice)}
                </label>
                <input
                  type="range"
                  min="100000"
                  max="300000"
                  step="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#D9658B] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="rounded text-[#D9658B] focus:ring-0 w-4 h-4"
                  />
                  <span>Faqat bepul namunalar</span>
                </label>

                {(category !== 'all' || searchQuery || maxPrice < 300000 || freeOnly) && (
                  <button
                    onClick={() => {
                      setCategory('all');
                      setSearchQuery('');
                      setMaxPrice(300000);
                      setFreeOnly(false);
                    }}
                    className="text-rose-600 hover:underline text-xs ml-auto"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count bar */}
        <div className="flex items-center justify-between text-xs text-[#7A6A63] px-2">
          <span>
            Topilgan shablonlar soni:{' '}
            <strong className="text-[#231E1B] font-bold">
              {filteredTemplates.length} ta
            </strong>
          </span>
          <span className="text-[11px]">Barcha shablonlar mobil va kompyuterga to‘liq moslashtirilgan</span>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="glass-panel-elevated rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5EBDD] mx-auto flex items-center justify-center text-[#8A7C74]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-playfair text-xl font-bold text-[#231E1B]">
              Shablon topilmadi
            </h3>
            <p className="text-xs text-[#7A6A63]">
              Kiritilgan parametrlar bo‘yicha natija yo‘q. Qidiruv so‘zini o‘zgartiring yoki filtrlarni tozalang.
            </p>
            <button
              onClick={() => {
                setCategory('all');
                setSearchQuery('');
                setMaxPrice(300000);
                setFreeOnly(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#231E1B] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Barcha shablonlarni ko‘rsatish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="glass-panel rounded-3xl overflow-hidden border border-white/90 shadow-xs glass-card-hover flex flex-col justify-between group"
              >
                <div>
                  {/* Image and badges */}
                  <div className="relative h-64 overflow-hidden bg-[#ECE4D8]">
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {template.isPopular && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F5C9D8]/95 text-[#3A2D28] backdrop-blur-md shadow-xs">
                          {t.templatesSection.popular}
                        </span>
                      )}
                      {template.isNew && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#B9DFFA]/95 text-[#1E3A5F] backdrop-blur-md shadow-xs">
                          {t.templatesSection.newBadge}
                        </span>
                      )}
                    </div>

                    {/* Price tag */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {formatPriceUZS(template.price)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#A89A92] mb-1">
                      <span>{template.category}</span>
                      {/* Color swatches hint */}
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: template.colorStyle.primary }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: template.colorStyle.accent }}
                        />
                      </div>
                    </div>
                    <h3 className="font-playfair text-lg font-bold text-[#231E1B] mb-1.5">
                      {template.name}
                    </h3>
                    <p className="text-xs text-[#5C4F48] line-clamp-2 leading-relaxed">
                      {template.description[language] || template.description.uz}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-black/5 mt-2">
                  <Link
                    to={`/templates/${template.slug}`}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold text-[#4A3E39] glass-panel hover:bg-white text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ko‘rish</span>
                  </Link>

                  <Link
                    to={`/create/${template.slug}`}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-[#231E1B] bg-gradient-to-r from-[#F5C9D8] to-[#F5EBDD] hover:shadow-xs text-center transition-all flex items-center justify-center gap-1"
                  >
                    <span>Tanlash</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
