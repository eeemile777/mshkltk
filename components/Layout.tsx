import * as React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4 mb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
