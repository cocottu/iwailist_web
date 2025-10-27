import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navigationItems = [
  { path: '/', label: 'ホーム', icon: '🏠' },
  { path: '/gifts', label: '贈答品', icon: '🎁' },
  { path: '/persons', label: '人物', icon: '👤' },
  { path: '/returns', label: 'お返し', icon: '↩️' },
  { path: '/reminders', label: 'リマインダー', icon: '⏰' }
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center text-xs font-medium transition-colors ${
              location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
                ? 'text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
