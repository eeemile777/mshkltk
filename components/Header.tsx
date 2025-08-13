import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Language } from '../types';
import { NavLink, Link } from 'react-router-dom';
import { PATHS } from '../constants';
import { FaGlobe, FaBell } from 'react-icons/fa';

const Header: React.FC = () => {
  const { language, toggleLanguage, t, currentUser, unreadNotificationsCount } = React.useContext(AppContext);

  return (
    <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={PATHS.HOME} className="text-2xl font-bold text-teal dark:text-teal-dark">
            {t.appTitle}
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark"
              aria-label="Toggle language"
            >
              <FaGlobe className="h-5 w-5" />
            </button>
            {currentUser && (
               <NavLink 
                to={PATHS.NOTIFICATIONS}
                className="relative p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark"
              >
                  <FaBell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-coral text-white text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-surface-dark">
                          {unreadNotificationsCount}
                      </span>
                  )}
              </NavLink>
            )}
            {currentUser ? (
                <Link to={PATHS.PROFILE} className="flex items-center gap-3">
                    <span className="font-semibold hidden sm:inline text-text-primary dark:text-text-primary-dark">{currentUser.display_name}</span>
                    <img src={currentUser.avatarUrl} alt={currentUser.display_name} className="w-9 h-9 rounded-full ring-2 ring-teal dark:ring-teal-dark"/>
                </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;