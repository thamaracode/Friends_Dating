import React from 'react';
import { Check } from 'lucide-react';

export interface GlassCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Custom Styled Glass Checkbox (Klyven × Soulverse Titanium Glass)
 * Tactile active state, pure silver border, and accessible touch target.
 */
export const GlassCheckbox: React.FC<GlassCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center space-x-3 cursor-pointer select-none min-h-[44px] ${
        disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'bg-white border-white text-[#090A0E] shadow-md shadow-white/20'
              : 'bg-[#12141B]/80 border-white/20 hover:border-white/40'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
      </div>

      {label && <span className="text-xs text-zinc-300 font-medium">{label}</span>}
    </label>
  );
};
