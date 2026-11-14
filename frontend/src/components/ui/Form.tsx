import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: (id: string, isInvalid: boolean) => React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  className = '',
  children
}) => {
  const generatedId = useId();
  const isInvalid = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={generatedId} className="text-xs sm:text-sm font-semibold text-zinc-200">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
      </div>

      {children(generatedId, isInvalid)}

      {error ? (
        <p role="alert" className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-zinc-400 pt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border ${
          error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/20'
        } text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`w-full p-3.5 rounded-xl bg-white/[0.05] border ${
          error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/20'
        } text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed resize-y ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={`w-full h-11 px-3.5 rounded-xl bg-[#12141B] border ${
          error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-amber-400 focus:ring-amber-400/20'
        } text-sm text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center justify-between gap-3 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <span className="text-xs sm:text-sm font-semibold text-white block">{label}</span>}
          {description && <span className="text-xs text-zinc-400 block leading-relaxed">{description}</span>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
          checked ? 'bg-amber-400' : 'bg-white/20'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};
