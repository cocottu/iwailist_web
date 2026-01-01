import React from 'react';

interface BadgeProps {
  status: 'pending' | 'completed' | 'not_required' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const statusClasses = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
    completed: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    not_required: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300'
  };
  
  const classes = `${baseClasses} ${statusClasses[status]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};
