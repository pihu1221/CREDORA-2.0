import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = "", size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'h-6 text-xs',
    md: 'h-8 text-lg',
    lg: 'h-12 text-2xl',
    xl: 'h-16 text-3xl',
  };

  const currentSize = sizes[size];
  const height = currentSize.split(' ')[0];

  return (
    <div className={`flex items-center gap-3 ${className} group cursor-pointer`}>
      <div className={`${height} aspect-square relative`}>
        <motion.svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          initial="initial"
          whileHover="hover"
        >
          {/* Outer Hexagon / Frame */}
          <path 
            d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
            className="stroke-blue-600 fill-blue-600/5 transition-colors group-hover:fill-blue-600/10"
            strokeWidth="4" 
          />
          
          {/* Inner "C" shape or Neural Node */}
          <motion.path
            d="M65 35C60 30 50 30 40 35C30 40 30 60 40 65C50 70 60 70 65 65"
            className="stroke-white"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            variants={{
              initial: { pathLength: 0.8, rotate: 0 },
              hover: { pathLength: 1, rotate: 5 }
            }}
          />

          {/* Central Core */}
          <motion.circle 
            cx="50" cy="50" r="6" 
            className="fill-blue-400"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Neural Connections */}
          <line x1="50" y1="50" x2="50" y2="20" className="stroke-blue-400/30" strokeWidth="2" />
          <line x1="50" y1="50" x2="75" y2="65" className="stroke-blue-400/30" strokeWidth="2" />
          <line x1="50" y1="50" x2="25" y2="65" className="stroke-blue-400/30" strokeWidth="2" />
        </motion.svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-black uppercase tracking-tighter italic leading-none transition-colors ${currentSize.split(' ')[1]} ${size === 'sm' ? 'text-slate-200' : 'text-white'} group-hover:text-blue-500`}>
            CREDORA
          </span>
          {size !== 'sm' && (
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500/60 leading-none mt-1">
              Neural Intel
            </span>
          )}
        </div>
      )}
    </div>
  );
}
