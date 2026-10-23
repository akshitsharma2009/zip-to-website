import { type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string;
}

export function Checkbox({ label, error, className = '', id, checked, ...props }: CheckboxProps) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="flex items-start gap-3 cursor-pointer group"
      >
        <span className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            id={inputId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <span
            className={`flex w-5 h-5 items-center justify-center rounded-[6px] border transition-all duration-200 ${
              checked
                ? 'bg-brass border-brass'
                : 'bg-panel border-cream/15 group-hover:border-cream/25'
            } ${error ? 'border-error/40' : ''}`}
          >
            {checked && <Check className="w-3.5 h-3.5 text-cream" strokeWidth={3} />}
          </span>
        </span>
        <span className="text-sm text-meta-light leading-relaxed select-none group-hover:text-cream/80 transition-colors">{label}</span>
      </label>
      {error && <p className="mt-1.5 text-xs text-error/80 ml-8">{error}</p>}
    </div>
  );
}
