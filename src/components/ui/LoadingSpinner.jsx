import React from 'react';
import { FiLoader } from 'react-icons/fi';

/**
 * Loading Spinner Component - Industry Standard
 * Accessible loading indicator with different sizes
 */
const LoadingSpinner = ({
  size = 'md',
  fullScreen = false,
  text,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <FiLoader className={`${sizes[size]} text-blue-600 animate-spin`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton Loader - For content placeholders
 */
export const Skeleton = ({ className = '', width, height }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Card Skeleton - For loading card layouts
 */
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="40%" height="24px" />
          <Skeleton width="60px" height="24px" className="rounded-full" />
        </div>
        <Skeleton width="100%" height="16px" />
        <Skeleton width="80%" height="16px" />
        <div className="flex gap-2 mt-4">
          <Skeleton width="80px" height="36px" className="rounded-lg" />
          <Skeleton width="80px" height="36px" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Table Skeleton - For loading tables
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="100%" height="20px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="100%" height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
