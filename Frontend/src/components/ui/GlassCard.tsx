import React, { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  animateIn?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', animateIn = true, ...props }, ref) => {
    const baseStyles = "glass-panel rounded-2xl p-6";

    const animationProps = animateIn 
      ? {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: "easeOut" as const }
        } 
      : {};

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${className}`}
        {...animationProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
