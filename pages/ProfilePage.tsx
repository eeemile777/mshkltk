import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { PATHS, STATUS_COLORS, BADGES } from '../constants';
import { FaMoon, FaSun, FaGlobe, FaTrophy, FaSignOutAlt, FaExclamationCircle } from 'react-icons/fa';
import { Theme } from '../types';


const ProfilePage: React.FC = () => {
  const { currentUser, reports, t, toggleTheme, theme, toggleLanguage, logout } = React.useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(PATHS.AUTH_LOGIN);
  };

  return (
    <div>
      {!currentUser ? <Spinner /> : (
        (() => {
          const userReports = reports.filter(r => r.created_by === currentUser.id);
          return (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-navy dark:text-text-primary-dark">{t.profile}</h1>

              {currentUser.is_anonymous && (
                  <div className="bg-mango/20 dark:bg-mango-dark/20 text-mango-dark dark:text-mango-dark p-4 rounded-xl mb-6 flex items-center gap-3">
                      <FaExclamationCircle className="h-5 w-5"/>
                      <p className="font-semibold">{t.guestMessage}</p>
                  </div>
              )}
              
              <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md mb-8 flex flex-col sm:flex-row items-center gap-6">
                <img src={currentUser.avatarUrl} alt={currentUser.display_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-teal dark:ring-teal-dark" />
                <div className="text-center sm:text-start flex-1">
                  <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark">{currentUser.display_name}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mt-2 text-text-secondary dark:text-text-secondary-dark">
                    <span><strong className="text-mango dark:text-mango-dark">{currentUser.points}</strong> {t.points}</span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                      {currentUser.achievements.map(badgeId => (
                          <span key={badgeId} className="px-3 py-1 text-sm font-semibold bg-mango/20 text-mango-dark rounded-full flex items-center gap-2">
                            {BADGES[badgeId].icon} {t.language === 'ar' ? BADGES[badgeId].name_ar : BADGES[badgeId].name_en}
                          </span>
                      ))}
                      <Link to={PATHS.ACHIEVEMENTS} className="px-3 py-1 text-sm font-semibold bg-muted dark:bg-bg-dark text-teal dark:text-teal-dark rounded-full flex items-center gap-2">
                          <FaTrophy /> {t.achievements}
                      </Link>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t.settings}</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.darkMode}</label>
                            <button onClick={toggleTheme} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
                                {theme === Theme.LIGHT ? <FaMoon/> : <FaSun/>}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.language}</label>
                            <button onClick={toggleLanguage} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
                                <FaGlobe/>
                            </button>
                        </div>
                         <div className="flex items-center justify-between">
                            <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.logout}</label>
                            <button onClick={handleLogout} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-coral dark:text-coral-dark">
                                <FaSignOutAlt/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t.myReports}</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                    {userReports.length > 0 ? userReports.map(report => {
                        const statusColor = theme === 'dark' ? STATUS_COLORS[report.status].dark : STATUS_COLORS[report.status].light;
                        return (
                        <Link key={report.id} to={PATHS.REPORT_DETAILS.replace(':id', report.id)} className="block bg-muted dark:bg-bg-dark p-3 rounded-xl hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4">
                            <img src={report.photo_urls[0]} alt="" className="w-16 h-16 rounded-lg object-cover"/>
                            <div className="flex-1">
                            <p className="font-bold text-navy dark:text-text-primary-dark">{t[report.category]}</p>
                            <p className="text-sm text-text-secondary dark:text-text-secondary-dark truncate">{report.note}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusColor}`}>
                            {t[report.status]}
                            </span>
                        </div>
                        </Link>
                    )}) : <p className="text-text-secondary dark:text-text-secondary-dark">{t.noReportsFound}</p>}
                    </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default ProfilePage;