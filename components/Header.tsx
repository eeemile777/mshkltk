import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Language, SearchSuggestion } from '../types';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../constants';
import { FaGlobe, FaBell, FaMagnifyingGlass, FaXmark, FaTrophy } from 'react-icons/fa6';
import SearchSuggestions from './SearchSuggestions';

const Header: React.FC = () => {
  const { language, toggleLanguage, t, currentUser, unreadNotificationsCount, searchQuery, setSearchQuery, reports, flyToLocation } = React.useContext(AppContext);
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Effect for debouncing search and generating suggestions
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(() => {
        const lowerCaseQuery = searchQuery.toLowerCase().trim();
        
        // Find unique matching areas
        const areaSuggestions: SearchSuggestion[] = reports
            .map(r => r.area)
            .filter((area, index, self) => 
                area.toLowerCase().includes(lowerCaseQuery) && self.indexOf(area) === index
            )
            .map(area => ({
                type: 'area',
                text: area,
                query: area,
            }));
        
        // Find matching reports by title or note
        const reportSuggestions: SearchSuggestion[] = reports
            .filter(r => 
                r.title_en.toLowerCase().includes(lowerCaseQuery) || r.title_ar.toLowerCase().includes(lowerCaseQuery) ||
                r.note_en.toLowerCase().includes(lowerCaseQuery) || r.note_ar.toLowerCase().includes(lowerCaseQuery)
            )
            .map(r => ({
                type: 'report',
                text: language === 'ar' ? r.title_ar : r.title_en,
                query: language === 'ar' ? r.title_ar : r.title_en,
                id: r.id,
            }));

        const combined = [...areaSuggestions, ...reportSuggestions].slice(0, 8); // Limit to 8 suggestions total
        setSuggestions(combined);
        setShowSuggestions(true);
    }, 300); // 300ms debounce

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery, reports, language]);

  // Effect for handling clicks outside the search component to close suggestions
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.query);
    setShowSuggestions(false);

    if (suggestion.type === 'area') {
      const reportInArea = reports.find(r => r.area === suggestion.text);
      if (reportInArea) {
        flyToLocation([reportInArea.lat, reportInArea.lng], 14);
        navigate(PATHS.HOME); // Ensure we are on the map page to see the effect
      }
    } else if (suggestion.type === 'report' && suggestion.id) {
        const reportToFind = reports.find(r => r.id === suggestion.id);
        if (reportToFind) {
            flyToLocation([reportToFind.lat, reportToFind.lng], 16); // Zoom closer for specific report
            navigate(PATHS.HOME);
        }
    }
  };

  return (
    <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-md fixed top-0 inset-x-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <div className="flex items-center">
            <Link to={PATHS.HOME} className={`text-2xl font-bold text-teal dark:text-teal-dark flex-shrink-0 ${language === 'ar' ? 'font-arabic' : 'font-display'}`}>
              {t.appTitle}
            </Link>
          </div>
          
          {currentUser && (
            <div className="flex-1 flex justify-center px-2 min-w-0" data-tour-id="search" ref={searchContainerRef}>
              <div className="w-full max-w-lg relative">
                <label htmlFor="search" className="sr-only">{t.searchReports}</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMagnifyingGlass className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-10 py-2 border border-border-light dark:border-border-dark rounded-full leading-5 bg-muted dark:bg-bg-dark placeholder-text-secondary dark:placeholder-text-secondary-dark focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal dark:focus:ring-teal-dark focus:border-teal dark:focus:border-teal-dark sm:text-sm"
                        placeholder={t.searchReports}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button onClick={() => setSearchQuery('')} className="text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark" aria-label="Clear search">
                                <FaXmark className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
                {showSuggestions && <SearchSuggestions suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark"
              aria-label="Toggle language"
            >
              <FaGlobe className="h-5 w-5" />
            </button>
            {currentUser && (
              <>
               <NavLink 
                to={PATHS.NOTIFICATIONS}
                className="relative p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark"
                data-tour-id="notifications"
              >
                  <FaBell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-coral text-white text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-surface-dark">
                          {unreadNotificationsCount}
                      </span>
                  )}
              </NavLink>
              <NavLink 
                to={PATHS.COMMUNITY}
                className="relative p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark"
              >
                  <FaTrophy className="h-5 w-5" />
              </NavLink>
              </>
            )}
            {currentUser ? (
                <Link to={PATHS.PROFILE} className="flex items-center gap-3" data-tour-id="profile">
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