import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ icon: LucideComponent, size = 20, className = '', ...props }) => {
  return (
    <LucideComponent 
      size={size} 
      className={`shrink-0 ${className}`} 
      strokeWidth={2}
      {...props} 
    />
  );
};
