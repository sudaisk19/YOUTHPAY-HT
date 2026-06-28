'use client';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  defaultValue,
  onChange,
  prefix,
  inputMode,
}: InputProps) {
  const inputClass =
    'w-full bg-surface-elevated border border-surface-border text-text-primary text-[15px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all px-4 py-3.5';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm text-text-secondary font-medium">{label}</label>
      )}
      {prefix ? (
        <div className="flex">
          <span className="bg-surface-elevated border border-surface-border border-r-0 rounded-l-input px-4 py-3.5 text-text-primary text-[15px] whitespace-nowrap flex items-center">
            {prefix}
          </span>
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            inputMode={inputMode}
            className={`${inputClass} rounded-r-input rounded-l-none`}
          />
        </div>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          inputMode={inputMode}
          className={`${inputClass} rounded-input`}
        />
      )}
    </div>
  );
}
