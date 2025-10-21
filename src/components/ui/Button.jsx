import React from 'react';
import { FiLoader } from 'react-icons/fi';

/**
 * Button Component - Industry Standard
 * Follows accessibility guidelines and modern UX patterns
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
      text-white
      shadow-sm hover:shadow-md
      focus:ring-blue-500
    `,
    secondary: `
      bg-white hover:bg-gray-50 active:bg-gray-100
      text-gray-700
      border-2 border-gray-300 hover:border-gray-400
      focus:ring-gray-500
    `,
    success: `
      bg-green-600 hover:bg-green-700 active:bg-green-800
      text-white
      shadow-sm hover:shadow-md
      focus:ring-green-500
    `,
    danger: `
      bg-red-600 hover:bg-red-700 active:bg-red-800
      text-white
      shadow-sm hover:shadow-md
      focus:ring-red-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 active:bg-gray-200
      text-gray-700
      focus:ring-gray-500
    `,
    outline: `
      bg-transparent hover:bg-blue-50 active:bg-blue-100
      text-blue-600
      border-2 border-blue-600 hover:border-blue-700
      focus:ring-blue-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <FiLoader className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
