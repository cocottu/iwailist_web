import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  ...rest
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200';
  const hoverClasses = hover ? 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-shadow' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};
