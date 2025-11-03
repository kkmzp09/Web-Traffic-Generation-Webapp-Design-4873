import React from 'react';

const Logo = ({ className = "w-10 h-10", textClassName = "text-2xl" }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <svg 
        className={className} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" opacity="0.1"/>
        
        {/* Main Chart/Graph Icon */}
        <path 
          d="M25 70 L35 55 L45 60 L55 40 L65 45 L75 25" 
          stroke="url(#logoGradient)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Data Points */}
        <circle cx="25" cy="70" r="4" fill="#3B82F6"/>
        <circle cx="35" cy="55" r="4" fill="#8B5CF6"/>
        <circle cx="45" cy="60" r="4" fill="#EC4899"/>
        <circle cx="55" cy="40" r="4" fill="#10B981"/>
        <circle cx="65" cy="45" r="4" fill="#3B82F6"/>
        <circle cx="75" cy="25" r="4" fill="#8B5CF6"/>
        
        {/* Upward Arrow */}
        <path 
          d="M70 30 L75 25 L80 30" 
          stroke="url(#accentGradient)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Organic Leaf Accent */}
        <path 
          d="M20 25 Q15 20 20 15 Q25 20 20 25" 
          fill="url(#accentGradient)" 
          opacity="0.8"
        />
      </svg>
      
      {/* Logo Text */}
      <div className="flex flex-col leading-none">
        <span className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${textClassName}`}>
          OrganiTraffic
        </span>
      </div>
    </div>
  );
};

export default Logo;
