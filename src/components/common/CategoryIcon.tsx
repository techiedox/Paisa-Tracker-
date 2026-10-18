import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  color,
  size = 20,
}) => {
  // @ts-ignore
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.Tag;
  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
};
