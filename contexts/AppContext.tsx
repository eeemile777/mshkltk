import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, Theme, Report, User, Notification, Badge } from '../types';
import { translations, BADGES, PATHS } from '../constants';
import * as api from '../services/mockApi';

interface AppContextType {
  language: Language;
  theme: Theme;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  t: (typeof translations)[Language.AR];
  reports: Report[];
  loading: boolean;
  authLoading: boolean;
  currentUser: User | null;
  notifications: Notification[];
  unreadNotificationsCount: number;
  
  // Auth methods
  signup: (data: Pick<User, 'first_name' | 'last_name' | 'username'> & {password: string}) => Promise<User>;
  login: (data: Pick<User, 'username'> & {password: string}) => Promise<User>;
  loginAnonymous: () => Promise<User>;
  logout: () => Promise<void>;

  // App methods
  submitReport: (report: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>) => Promise<Report>;
  confirmReport: (reportId: string) => Promise<void>;
  updateReportInState: (updatedReport: Report) => void;
  markNotificationsAsRead: () => void;
  checkForNewBadges: (user: User) => void;
  showNewBadge: (badge: Badge) => void;
  newlyEarnedBadge: Badge | null;
  clearNewBadge: () => void;
}

const defaultContextValue: any = {
  language: Language.AR,
  theme: Theme.LIGHT,
  toggleLanguage: () => {},
  toggleTheme: () => {},
  t: translations.ar,
  reports: [],
  loading: true,
  authLoading: true,
  currentUser: null,
  notifications: [],
  unreadNotificationsCount: 0,
};


export const AppContext = React.createContext<AppContextType>(defaultContextValue);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = React.useState<Language>(Language.AR);
  const [theme, setTheme] = React.useState<Theme>(Theme.LIGHT);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = React.useState<Badge | null>(null);

  // --- Initial Load Effects ---
  React.useEffect(() => {
    // Load preferences from localStorage
    const storedLang = localStorage.getItem('mshkltk-lang') as Language;
    if (storedLang) setLanguage(storedLang);
    const storedTheme = localStorage.getItem('mshkltk-theme') as Theme;
    if (storedTheme) setTheme(storedTheme);
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme(Theme.DARK);

    // Check for existing session
    api.getCurrentUser().then(user => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
  }, []);

  const fetchAppData = React.useCallback(async (userId: string) => {
    setLoading(true);
    try {
        const [reportsData, notificationsData] = await Promise.all([
            api.fetchReports(),
            api.fetchNotificationsByUserId(userId)
        ]);
        setReports(reportsData);
        setNotifications(notificationsData);
    } catch (error) {
        console.error("Failed to fetch app data", error);
    } finally {
        setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
        fetchAppData(currentUser.id);
    } else if (!authLoading) {
        // If no user and not loading auth, then clear app data
        setReports([]);
        setNotifications([]);
        setLoading(false);
    }
  }, [currentUser, authLoading, fetchAppData]);


  // --- Preference Effects ---
  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? 'rtl' : 'ltr';
    localStorage.setItem('mshkltk-lang', language);
  }, [language]);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === Theme.DARK);
    localStorage.setItem('mshkltk-theme', theme);
  }, [theme]);

  // --- Auth Methods ---
  const handleUserUpdate = async (user: User) => {
    setCurrentUser(user);
    await api.setCurrentUser(user);
  }

  const signup = async (data) => {
    const user = await api.createUser(data);
    await handleUserUpdate(user);
    return user;
  };
  
  const login = async (data) => {
    const user = await api.loginUser(data);
    await handleUserUpdate(user);
    return user;
  };

  const loginAnonymous = async () => {
    const user = await api.createAnonymousUser();
    await handleUserUpdate(user);
    return user;
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
  };


  // --- App Logic ---
  const toggleLanguage = () => setLanguage(p => (p === Language.AR ? Language.EN : Language.AR));
  const toggleTheme = () => setTheme(p => (p === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  const showNewBadge = (badge: Badge) => setNewlyEarnedBadge(badge);
  const clearNewBadge = () => setNewlyEarnedBadge(null);

  const checkForNewBadges = React.useCallback((user: User) => {
    const userReports = reports.filter(r => r.created_by === user.id);
    // This logic needs to be aware of the user object updating, so we check against the provided user
    if (userReports.length >= 1 && !user.achievements.includes('pioneer')) {
        return BADGES.pioneer;
    }
    const wasteReportsCount = userReports.filter(r => r.category === 'waste').length;
    if (wasteReportsCount >= 3 && !user.achievements.includes('waste_warrior')) {
        return BADGES.waste_warrior;
    }
    if (user.reportsConfirmed >= 5 && !user.achievements.includes('community_helper')) {
        return BADGES.community_helper;
    }
    return null;
  }, [reports]);

  const updateUserWithBadge = (user: User, badge: Badge) => {
      const newAchievements = [...user.achievements, badge.id];
      const updatedUser = { ...user, achievements: newAchievements };
      handleUserUpdate(updatedUser); // Persist change
      showNewBadge(badge);
  };

  const submitReport = async (reportData: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>) => {
      const newReport = await api.submitReport(reportData);
      setReports(prev => [newReport, ...prev]);
      if(currentUser){
          const updatedUser = {...currentUser, points: currentUser.points + 10, reports_count: currentUser.reports_count + 1};
          await handleUserUpdate(updatedUser);
          const newBadge = checkForNewBadges(updatedUser);
          if (newBadge) updateUserWithBadge(updatedUser, newBadge);
      }
      return newReport;
  };

  const confirmReport = async (reportId: string) => {
    if (!currentUser) return;
    const { report: updatedReport } = await api.confirmReport(reportId, currentUser.id);
    
    if (updatedReport) {
      const alreadyConfirmed = updatedReport.confirmations_count === reports.find(r => r.id === reportId)?.confirmations_count;
      updateReportInState(updatedReport);

      // Only give points if the user is not the creator and hasn't already confirmed
      if (updatedReport.created_by !== currentUser.id && !alreadyConfirmed) {
          const userAfterConfirm = { 
              ...currentUser, 
              points: currentUser.points + 3, 
              reportsConfirmed: currentUser.reportsConfirmed + 1
          };
          await handleUserUpdate(userAfterConfirm);
          const newBadge = checkForNewBadges(userAfterConfirm);
          if(newBadge) updateUserWithBadge(userAfterConfirm, newBadge);
      }
    }
  };
  
  const updateReportInState = (updatedReport: Report) => {
    setReports(prevReports => prevReports.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    // Note: this change is not persisted in mockApi for simplicity
  }

  const value: AppContextType = {
    language,
    theme,
    toggleLanguage,
    toggleTheme,
    t: translations[language],
    reports,
    loading,
    authLoading,
    currentUser,
    notifications,
    unreadNotificationsCount: notifications.filter(n => !n.read).length,
    signup,
    login,
    loginAnonymous,
    logout,
    submitReport,
    confirmReport,
    updateReportInState,
    markNotificationsAsRead,
    checkForNewBadges: () => {}, // Simplified for now
    showNewBadge,
    newlyEarnedBadge,
    clearNewBadge,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};