import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
}

export function Checkbox({ 
  checked, 
  onChange, 
  label, 
  indeterminate = false, 
  disabled = false 
}: CheckboxProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`w-4 h-4 border-2 rounded ${
          checked || indeterminate 
            ? 'bg-indigo-600 border-indigo-600' 
            : 'bg-white border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {(checked || indeterminate) && (
            <div className="flex items-center justify-center h-full">
              {indeterminate ? (
                <div className="w-2 h-0.5 bg-white"></div>
              ) : (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          )}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
}