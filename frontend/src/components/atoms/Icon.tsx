import React from 'react';

interface IconProps {
  icon: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 'md', color = 'currentColor' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return <IconComponent className={`${sizes[size]} ${color}`} />;
};

export default Icon;