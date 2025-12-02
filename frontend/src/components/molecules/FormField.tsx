import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder 
}) => {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
      />
    </div>
  );
};

export default FormField;