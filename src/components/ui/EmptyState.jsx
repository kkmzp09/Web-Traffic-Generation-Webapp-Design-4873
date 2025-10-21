import React from 'react';
import Button from './Button';

/**
 * Empty State Component - Industry Standard
 * Guides users when no data is available
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-full p-6">
            <Icon className="w-12 h-12 text-gray-400" />
          </div>
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex justify-center gap-3">
          {actionLabel && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
