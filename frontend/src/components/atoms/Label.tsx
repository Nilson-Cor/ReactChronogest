import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-2">
      {children}
    </label>
  );
};

export default Label;