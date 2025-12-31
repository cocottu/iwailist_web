import React from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
};
