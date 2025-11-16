import React from 'react';
import { AppContext } from '../contexts/AppContext';
import { FaGlobe } from 'react-icons/fa6';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t, toggleLanguage, language } = React.useContext(AppContext);
  
  return (
    <div className="flex flex-col min-h-screen bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
      <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className={`text-2xl font-bold text-teal dark:text-teal-dark ${language === 'ar' ? 'font-arabic' : 'font-display'}`}>
              {t.appTitle}
            </h1>
            <button
                onClick={toggleLanguage}
                className="flex items-center p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark"
                aria-label="Toggle language"
              >
                <span className="h-5 w-5"><FaGlobe/></span>
              </button>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;