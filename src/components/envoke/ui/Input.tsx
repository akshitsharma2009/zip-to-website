import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-meta-light mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 rounded-btn bg-panel border border-cream/10 text-cream placeholder:text-meta-light/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brass/40 focus:border-brass/30 hover:border-cream/20 ${error ? 'border-error/40' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error/80">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
