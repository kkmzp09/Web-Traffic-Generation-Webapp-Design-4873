import React from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

/**
 * Input Component - Industry Standard
 * Accessible form input with validation states
 */
const Input = ({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const hasError = !!error;
  const hasSuccess = !!success;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-2.5 rounded-lg
            border-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || hasError || hasSuccess ? 'pr-10' : ''}
            ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${hasSuccess ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}
            ${!hasError && !hasSuccess ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {(rightIcon || hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError && <FiAlertCircle className="text-red-500 w-5 h-5" />}
            {hasSuccess && <FiCheckCircle className="text-green-500 w-5 h-5" />}
            {!hasError && !hasSuccess && rightIcon}
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <p className={`mt-1.5 text-sm ${
          hasError ? 'text-red-600' :
          hasSuccess ? 'text-green-600' :
          'text-gray-500'
        }`}>
          {error || success || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
