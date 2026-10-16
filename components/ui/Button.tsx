import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export function Button({ 
  children, 
  className = '', 
  isLoading, 
  loadingText = "Loading...", 
  icon,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={`flex items-center justify-center rounded-lg bg-[#FF6A00] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#E66000] disabled:opacity-60 transition-colors shadow-md ${className}`}
      {...props}
    >
      {isLoading ? (
        loadingText
      ) : (
        <>
          {children}
          {icon}
        </>
      )}
    </button>
  );
}
