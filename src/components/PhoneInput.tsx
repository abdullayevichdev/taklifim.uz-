import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryInfo {
  code: string; // ISO masalan 'UZ'
  name: string; // 'O‘zbekiston'
  dialCode: string; // '+998'
  flag: string; // '🇺🇿'
  mask: string; // '## ### ## ##'
  digitCount: number; // 9
  example: string; // '90 123 45 67'
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'UZ', name: 'O‘zbekiston', dialCode: '+998', flag: '🇺🇿', mask: '## ### ## ##', digitCount: 9, example: '90 123 45 67' },
  { code: 'RU', name: 'Rossiya', dialCode: '+7', flag: '🇷🇺', mask: '(###) ###-##-##', digitCount: 10, example: '(999) 123-45-67' },
  { code: 'KZ', name: 'Qozog‘iston', dialCode: '+7', flag: '🇰🇿', mask: '(###) ###-##-##', digitCount: 10, example: '(777) 123-45-67' },
  { code: 'KG', name: 'Qirg‘iziston', dialCode: '+996', flag: '🇰🇬', mask: '### ### ###', digitCount: 9, example: '555 123 456' },
  { code: 'TJ', name: 'Tojikiston', dialCode: '+992', flag: '🇹🇯', mask: '## ### ####', digitCount: 9, example: '92 123 4567' },
  { code: 'TM', name: 'Turkmaniston', dialCode: '+993', flag: '🇹🇲', mask: '## ######', digitCount: 8, example: '65 123456' },
  { code: 'TR', name: 'Turkiya', dialCode: '+90', flag: '🇹🇷', mask: '### ### ## ##', digitCount: 10, example: '532 123 45 67' },
  { code: 'AE', name: 'BAA (Dubay)', dialCode: '+971', flag: '🇦🇪', mask: '## ### ####', digitCount: 9, example: '50 123 4567' },
  { code: 'SA', name: 'Saudiya Arabistoni', dialCode: '+966', flag: '🇸🇦', mask: '## ### ####', digitCount: 9, example: '50 123 4567' },
  { code: 'US', name: 'AQSH / Kanada', dialCode: '+1', flag: '🇺🇸', mask: '(###) ###-####', digitCount: 10, example: '(555) 123-4567' },
  { code: 'DE', name: 'Germaniya', dialCode: '+49', flag: '🇩🇪', mask: '### ########', digitCount: 11, example: '151 12345678' },
  { code: 'GB', name: 'Buyuk Britaniya', dialCode: '+44', flag: '🇬🇧', mask: '#### ######', digitCount: 10, example: '7911 123456' },
  { code: 'KR', name: 'Janubiy Koreya', dialCode: '+82', flag: '🇰🇷', mask: '## #### ####', digitCount: 10, example: '10 1234 5678' },
  { code: 'JP', name: 'Yaponiya', dialCode: '+81', flag: '🇯🇵', mask: '## #### ####', digitCount: 10, example: '90 1234 5678' },
  { code: 'CN', name: 'Xitoy', dialCode: '+86', flag: '🇨🇳', mask: '### #### ####', digitCount: 11, example: '138 1234 5678' },
  { code: 'AZ', name: 'Ozarbayjon', dialCode: '+994', flag: '🇦🇿', mask: '## ### ## ##', digitCount: 9, example: '50 123 45 67' },
];

/**
 * Raqamlarni belgilangan mask bo'yicha formatlash
 */
export function applyMask(rawDigits: string, mask: string): string {
  let result = '';
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < rawDigits.length; i++) {
    if (mask[i] === '#') {
      result += rawDigits[digitIndex];
      digitIndex++;
    } else {
      result += mask[i];
    }
  }

  return result;
}

interface PhoneInputProps {
  value: string; // Masalan: "+998 90 123 45 67" yoki shunchaki "901234567"
  onChange: (fullPhoneNumber: string, isValid: boolean) => void;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  required = false,
  error,
  className = '',
  id,
  autoFocus = false,
}) => {
  // Boshlang'ich davlatni aniqlash (standart: UZ)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    if (!value) return COUNTRIES[0];
    const match = COUNTRIES.find((c) => value.startsWith(c.dialCode));
    return match || COUNTRIES[0];
  });

  // Raqamlar qismini ajratib olish
  const [digits, setDigits] = useState<string>(() => {
    if (!value) return '';
    // Agar dialCode bilan boshlansa, uni kesib tashlaymiz
    if (value.startsWith(selectedCountry.dialCode)) {
      const remaining = value.slice(selectedCountry.dialCode.length);
      return remaining.replace(/\D/g, '').slice(0, selectedCountry.digitCount);
    }
    return value.replace(/\D/g, '').slice(0, selectedCountry.digitCount);
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Tashqariga bosilganda dropdownni yopish
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  // Qidiruv bo'yicha filtrlangan davlatlar
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Formatlangan ko'rinish
  const formattedNumber = useMemo(() => {
    return applyMask(digits, selectedCountry.mask);
  }, [digits, selectedCountry]);

  // Raqam o'zgarganda emit qilish
  const handleDigitsChange = (newDigitsRaw: string) => {
    // Faqat raqamlarni qoldirish (harflarni butunlay tozalash)
    const cleaned = newDigitsRaw.replace(/\D/g, '').slice(0, selectedCountry.digitCount);
    setDigits(cleaned);

    const formatted = applyMask(cleaned, selectedCountry.mask);
    const fullValue = cleaned.length > 0 ? `${selectedCountry.dialCode} ${formatted}` : '';
    const isValid = cleaned.length === selectedCountry.digitCount;

    onChange(fullValue, isValid);
  };

  // Davlatni almashtirish
  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');

    // Yangi davlatning ruxsat etilgan limitiga moslash
    const adjustedDigits = digits.slice(0, country.digitCount);
    setDigits(adjustedDigits);

    const formatted = applyMask(adjustedDigits, country.mask);
    const fullValue = adjustedDigits.length > 0 ? `${country.dialCode} ${formatted}` : '';
    const isValid = adjustedDigits.length === country.digitCount;

    onChange(fullValue, isValid);
    setTimeout(() => numberInputRef.current?.focus(), 100);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative flex items-center rounded-xl bg-white border border-black/10 focus-within:border-[#D9658B] focus-within:ring-2 focus-within:ring-[#D9658B]/20 transition-all shadow-xs">
        {/* Davlat tanlash tugmasi (Bayroq + Prefiks + Strelka) */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-11 px-3 flex items-center gap-1.5 bg-black/5 hover:bg-black/10 rounded-l-xl border-r border-black/10 text-xs font-bold text-[#1E1418] transition-colors select-none shrink-0"
            title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
            aria-label="Davlat kodi"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-xs font-bold text-[#231E1B]">{selectedCountry.dialCode}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#7A6A63] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Davlatlar Menyusi (Searchable Dropdown) */}
          {isDropdownOpen && (
            <div className="absolute top-12 left-0 w-72 max-h-72 bg-white rounded-2xl shadow-2xl border border-black/10 z-[9999] overflow-hidden flex flex-col animate-fadeIn">
              {/* Qidiruv maydoni */}
              <div className="p-2.5 border-b border-black/5 bg-gray-50/80 sticky top-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Davlat nomi yoki kodi..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs outline-none focus:border-[#D9658B]"
                  />
                </div>
              </div>

              {/* Davlatlar ro'yxati */}
              <div className="overflow-y-auto flex-1 divide-y divide-black/5">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    Davlat topilmadi
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountry.code && c.dialCode === selectedCountry.dialCode;
                    return (
                      <button
                        key={`${c.code}-${c.dialCode}`}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between hover:bg-black/5 transition-colors ${
                          isSelected ? 'bg-pink-50 text-[#D9658B] font-bold' : 'text-[#231E1B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-2">
                          <span className="font-mono text-xs text-gray-500 font-semibold">{c.dialCode}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D9658B]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Raqamni kiritish maydoni (Faqat raqamlar, avto-maska va limit) */}
        <input
          ref={numberInputRef}
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus={autoFocus}
          value={formattedNumber}
          onChange={(e) => handleDigitsChange(e.target.value)}
          placeholder={selectedCountry.example}
          required={required}
          className="flex-1 h-11 px-3.5 bg-transparent text-xs font-mono font-bold text-[#1E1418] placeholder:text-gray-400 placeholder:font-normal outline-none"
        />

        {/* Raqam to'liq terilganlik indikatori */}
        {digits.length > 0 && (
          <div className="pr-3 flex items-center">
            {digits.length === selectedCountry.digitCount ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold" title="Raqam to‘liq">
                ✓
              </span>
            ) : (
              <span className="text-[10px] font-mono text-gray-400" title={`Qolgan raqamlar soni: ${selectedCountry.digitCount - digits.length}`}>
                {digits.length}/{selectedCountry.digitCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Xatolik xabari */}
      {error && (
        <span className="text-rose-600 text-[11px] font-medium block animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
};
