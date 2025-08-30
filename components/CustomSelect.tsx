import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className="w-full bg-brand-bg border border-brand-surface rounded-md p-2 flex justify-between items-center focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-brand-text truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <Icon name="chevron-down" className={`w-4 h-4 text-brand-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-brand-surface border border-brand-bg rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                  value === option.value ? 'text-brand-primary font-semibold' : 'text-brand-text'
                } hover:bg-brand-primary hover:text-brand-text-inverse`}
                onClick={() => handleOptionClick(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Icon name="check" className="w-4 h-4 flex-shrink-0" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};