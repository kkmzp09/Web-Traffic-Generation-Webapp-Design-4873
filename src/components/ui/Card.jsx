import React from 'react';

/**
 * Card Component - Industry Standard
 * Flexible container with consistent styling
 */
const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  hover = false,
  padding = 'default',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl
        shadow-sm border border-gray-200
        ${hover ? 'hover:shadow-md hover:scale-[1.01] transition-all duration-200' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
