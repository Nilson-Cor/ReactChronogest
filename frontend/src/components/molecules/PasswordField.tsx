import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;