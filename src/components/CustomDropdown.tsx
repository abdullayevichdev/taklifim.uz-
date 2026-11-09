import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  title?: string;
}

export function CustomDropdown<T extends string = string>({
  value,
  onChange,
  options,
  icon,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  title,
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        title={title}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel text-xs font-semibold text-[#231E1B] border border-black/8 hover:bg-white hover:shadow-xs transition-all outline-none ${buttonClassName} ${
          isOpen ? 'bg-white shadow-xs ring-2 ring-[#D9658B]/20 border-[#D9658B]/40' : ''
        }`}
      >
        {icon && <span className="text-[#8A7C74]">{icon}</span>}
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8A7C74] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#D9658B]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 min-w-[210px] w-max max-w-[280px] rounded-2xl glass-panel-elevated bg-white/95 backdrop-blur-xl shadow-xl border border-white/90 p-1.5 z-50 animate-fadeIn ${dropdownClassName}`}
          style={{
            boxShadow: '0 12px 36px -4px rgba(35, 30, 27, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#F5EBDD] to-white text-[#231E1B] font-bold shadow-xs'
                      : 'text-[#5C4F48] hover:bg-black/5 hover:text-[#231E1B]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#B48B47] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default CustomDropdown;
