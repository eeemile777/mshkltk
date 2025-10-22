import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS, STATUS_COLORS, BADGES } from '../constants';
import { FaMoon, FaSun, FaGlobe, FaTrophy, FaArrowRightFromBracket, FaCircleExclamation, FaClockRotateLeft, FaRankingStar, FaCamera, FaCirclePlay } from 'react-icons/fa6';
import { Theme, Report, ReportSeverity } from '../types';
import { ProfileSkeleton } from '../components/SkeletonLoader';
import { getAvatarUrl } from '../data/mockImages';

type ActiveTab = 'my_reports' | 'followed_reports';

const SeverityIndicator: React.FC<{ severity: ReportSeverity; className?: string }> = ({ severity, className = '' }) => {
    const severityMap = {
        [ReportSeverity.High]: { text: '!!!', title: 'High' },
        [ReportSeverity.Medium]: { text: '!!', title: 'Medium' },
        [ReportSeverity.Low]: { text: '!', title: 'Low' },
    };
    const { text, title } = severityMap[severity] || severityMap.low;
    
    return (
        <span className={`font-black text-lg text-coral dark:text-coral-dark ${className}`} title={`Severity: ${title}`}>
            {text}
        </span>
    );
};

const ReportListItem: React.FC<{ report: Report }> = ({ report }) => {
    const { t, theme, language, categories } = React.useContext(AppContext);
    const statusColor = theme === 'dark' ? STATUS_COLORS[report.status].dark : STATUS_COLORS[report.status].light;
    const title = language === 'ar' ? report.title_ar : report.title_en;
    const categoryData = categories[report.category];
    const categoryName = categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : report.category;
    const url = report.photo_urls[0];
    const isVideo = url.startsWith('data:video/');

    return (
        <Link to={PATHS.REPORT_DETAILS.replace(':id', report.id)} className="block bg-muted dark:bg-bg-dark p-3 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                    {isVideo ? (
                        <video src={url} className="w-full h-full rounded-lg object-cover" playsInline />
                    ) : (
                        <img src={url} alt="" className="w-full h-full rounded-lg object-cover"/>
                    )}
                    {report.isPending && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg" title={t.pending_sync}>
                            <FaClockRotateLeft {...({} as any)} className="text-white h-6 w-6" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-navy dark:text-text-primary-dark truncate">{title}</p>
                        <SeverityIndicator severity={report.severity} className="text-sm flex-shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark truncate">{categoryName}</p>
                        <p className="text-xs font-mono text-text-secondary/80 dark:text-text-secondary-dark/80 truncate">
                            {`#${report.id}`}
                        </p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${report.isPending ? 'bg-mango/80 text-white' : statusColor}`}>
                    {report.isPending ? t.pending_sync : t[report.status]}
                </span>
            </div>
        </Link>
    );
};


const ProfilePage: React.FC = () => {
  const { currentUser, reports, t, toggleTheme, theme, toggleLanguage, logout, searchQuery, updateUserAvatar, language, restartOnboarding } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('my_reports');
  const avatarInputRef = React.useRef<HTMLInputElement>(null);


  const handleLogout = async () => {
    await logout();
    navigate(PATHS.AUTH_LOGIN);
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateUserAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUpToSave = () => {
    // Pass a state to signal the signup page that we are upgrading an account
    navigate(PATHS.AUTH_SIGNUP, { state: { upgrading: true } });
  };
  
  const handleReplayTutorial = () => {
    // Start the onboarding tour
    restartOnboarding();
    // Navigate to the map page where the tour happens
    navigate(PATHS.MAP);
  };
  
  const applySearchFilter = (report: Report) => {
      if (!searchQuery) return true;
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      return report.title_en.toLowerCase().includes(lowerCaseQuery) ||
             report.title_ar.toLowerCase().includes(lowerCaseQuery) ||
             report.note_en.toLowerCase().includes(lowerCaseQuery) ||
             report.note_ar.toLowerCase().includes(lowerCaseQuery) ||
             report.area.toLowerCase().includes(lowerCaseQuery);
  };
  
  const userReports = React.useMemo(() => {
    if (!currentUser) return [];
    return reports
        .filter(r => r.created_by === currentUser.id && applySearchFilter(r))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports, currentUser, searchQuery]);

  const followedReports = React.useMemo(() => {
    if (!currentUser || !currentUser.subscribedReportIds) return [];
    return reports
        .filter(r => currentUser.subscribedReportIds!.includes(r.id) && r.created_by !== currentUser.id && applySearchFilter(r))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reports, currentUser, searchQuery]);

  const TabButton: React.FC<{ tabId: ActiveTab; label: string }> = ({ tabId, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 text-sm sm:text-base font-bold transition-colors ${
        activeTab === tabId
          ? 'border-b-2 border-teal dark:border-teal-dark text-teal dark:text-teal-dark'
          : 'text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-text-primary-dark'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      {!currentUser ? <ProfileSkeleton /> : (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-navy dark:text-text-primary-dark">{t.profile}</h1>

              {currentUser.is_anonymous && (
                <div className="bg-mango/20 dark:bg-mango-dark/20 text-mango-dark dark:text-mango-dark p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center gap-4">
                    <FaCircleExclamation {...({} as any)} className="h-8 w-8 flex-shrink-0"/>
                    <div className="flex-grow text-center sm:text-left">
                        <h3 className="font-bold">{t.youAreGuest}</h3>
                        <p className="text-sm">{t.progressNotSaved}</p>
                    </div>
                    <button onClick={handleSignUpToSave} className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-mango text-white font-bold rounded-full shadow-md hover:bg-opacity-90">
                        {t.signUpToSave}
                    </button>
                </div>
              )}
              
              <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md mb-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                    <img src={currentUser.avatarUrl} alt={currentUser.display_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-teal dark:ring-teal-dark" />
                    <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    {!currentUser.is_anonymous && (
                         <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-teal text-white rounded-full flex items-center justify-center ring-2 ring-card dark:ring-surface-dark hover:bg-opacity-90 transition-transform hover:scale-110" aria-label="Change profile picture">
                            <FaCamera size={14} />
                        </button>
                    )}
                </div>
                <div className="text-center sm:text-start flex-1 w-full">
                  <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark">{currentUser.display_name}</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-mango dark:text-mango-dark">{currentUser.points}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-semibold">{t.points}</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-mango dark:text-mango-dark">{currentUser.reports_count}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-semibold">{t.reportsSubmitted}</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-mango dark:text-mango-dark">{currentUser.reportsConfirmed}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-semibold">{t.reportsConfirmed}</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-mango dark:text-mango-dark">{currentUser.subscribedReportIds?.length || 0}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-semibold">{t.reportsFollowed}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                      {currentUser.achievements.map(badgeId => (
                          <span key={badgeId} className="px-3 py-1 text-sm font-semibold bg-mango/20 text-mango-dark rounded-full flex items-center gap-2">
                            {BADGES[badgeId].icon} {t.language === 'ar' ? BADGES[badgeId].name_ar : BADGES[badgeId].name_en}
                          </span>
                      ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                 <div className="flex border-b border-border-light dark:border-border-dark mb-4">
                    <TabButton tabId="my_reports" label={t.myReports} />
                    <TabButton tabId="followed_reports" label={t.followedReports} />
                </div>
                
                <div className="bg-card dark:bg-surface-dark p-4 rounded-2xl shadow-md min-h-[15rem]">
                    <div className="space-y-3">
                        {activeTab === 'my_reports' && (
                            userReports.length > 0
                                ? userReports.map(report => <ReportListItem key={report.id} report={report} />)
                                : <p className="p-8 text-center text-text-secondary dark:text-text-secondary-dark">{t.noReportsFound}</p>
                        )}
                        {activeTab === 'followed_reports' && (
                            followedReports.length > 0
                                ? followedReports.map(report => <ReportListItem key={report.id} report={report} />)
                                : <p className="p-8 text-center text-text-secondary dark:text-text-secondary-dark">{t.noFollowedReports}</p>
                        )}
                    </div>
                </div>
              </div>

              <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold mb-4">{t.settings}</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.darkMode}</label>
                        <button onClick={toggleTheme} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
                            {theme === Theme.LIGHT ? <FaMoon {...({} as any)} /> : <FaSun {...({} as any)} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.language}</label>
                        <button onClick={toggleLanguage} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
                            <FaGlobe {...({} as any)} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.replayTutorial}</label>
                        <button onClick={handleReplayTutorial} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-teal dark:text-teal-dark">
                            <FaCirclePlay {...({} as any)} />
                        </button>
                    </div>
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-text-secondary dark:text-text-secondary-dark">{t.logout}</label>
                        <button onClick={handleLogout} className="p-2 rounded-full bg-muted dark:bg-bg-dark text-coral dark:text-coral-dark">
                            <FaArrowRightFromBracket {...({} as any)} />
                        </button>
                    </div>
                </div>
              </div>

            </div>
      )}
    </div>
  );
};

export default ProfilePage;
