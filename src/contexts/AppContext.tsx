import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, Theme, Report, User, Notification, Badge, ReportCategory, ReportStatus, Comment, ReportHistory, PendingReportData, TimeFilter, NotificationType, Preview, ReportData, DynamicCategory, DynamicBadge, GamificationSettings } from '../types';
import { translations, BADGES, PATHS, ICON_MAP } from '../constants';
import * as api from '../services/api';
import L from 'leaflet';


// --- IndexedDB Helpers for Offline Support ---
const DB_NAME = 'mshkltk-db';
const DB_VERSION = 1;
const STORE_NAME = 'pending-reports';
let db: IDBDatabase;

const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(true);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening DB');
      reject(false);
    };
    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
      }
    };
  });
};

const addPendingReport = (report: PendingReportData): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) return reject('DB not initialized');
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    store.add(report);
  });
};

const getPendingReports = (): Promise<PendingReportData[]> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const deletePendingReport = (timestamp: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        store.delete(timestamp);
    });
};
// --- End IndexedDB Helpers ---

// --- Helper Functions for State Initialization ---

const getInitialState = <T extends string>(key: string, allValues: T[]): Set<T> => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
                const validValues = parsed.filter((v: any) => allValues.includes(v));
                return new Set(validValues);
            }
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
    }
    return new Set();
};


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
  overrideUser: User | null; // The user being impersonated
  realUser: User | null; // The user doing the impersonating (e.g., Super Admin)
  isImpersonating: boolean;
  exitImpersonation: (redirectPath: string) => void;
  notifications: Notification[];
  unreadNotificationsCount: number;
  
  signup: (data: Pick<User, 'first_name' | 'last_name' | 'username'> & {password: string; avatarUrl?: string}, options?: { upgradingFromGuest?: boolean }) => Promise<User>;
  login: (data: Pick<User, 'username'> & {password: string}) => Promise<User>;
  loginAnonymous: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
  setTempUserOverride: (impersonatedUser: User | null, impersonatorUser?: User | null, redirectPath?: string) => Promise<void>;

  submitReport: (reportData: Pick<Report, 'created_by' | 'category' | 'sub_category' | 'severity' | 'lat' | 'lng' | 'area' | 'municipality' | 'photo_urls'> & { title: string; note: string }) => Promise<Report | undefined>;
  confirmReport: (reportId: string) => Promise<void>;
  updateReportInState: (updatedReport: Report) => void;
  markNotificationsAsRead: () => void;
  isOnboardingActive: boolean;
  finishOnboarding: () => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  toggleReportSubscription: (reportId: string) => Promise<void>;

  achievementToastId: string | null;
  clearAchievementToast: () => void;

  comments: (Comment & { user: User })[];
  reportHistory: ReportHistory[];
  fetchComments: (reportId: string) => Promise<void>;
  addComment: (reportId: string, text: string) => Promise<void>;
  fetchReportHistory: (reportId: string) => Promise<void>;

  mapCenter: L.LatLngTuple | null;
  mapZoom: number | null;
  setMapView: (center: L.LatLngTuple, zoom: number) => void;
  mapTargetLocation: (L.LatLngTuple & { 2?: number }) | null;
  flyToLocation: (coords: L.LatLngTuple, zoom?: number) => void;
  clearMapTarget: () => void;

  activeCategories: Set<ReportCategory>;
  toggleCategory: (category: ReportCategory) => void;
  setCategories: (categories: Set<ReportCategory>) => void;
  clearCategories: () => void;

  activeStatuses: Set<ReportStatus>;
  toggleStatus: (status: ReportStatus) => void;
  setStatuses: (statuses: Set<ReportStatus>) => void;
  clearStatuses: () => void;

  activeTimeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  wizardData: ReportData | null;
  wizardStep: number;
  isWizardActive: boolean;
  startWizard: () => void;
  resetWizard: () => void;
  setWizardStep: (step: number | ((prevStep: number) => number)) => void;
  updateWizardData: (updates: Partial<ReportData>) => void;

  categories: any; // Using 'any' because it's a reconstructed object
  gamificationSettings: GamificationSettings | null;

  impersonationRedirectPath: string | null;
  clearImpersonationRedirect: () => void;
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
  overrideUser: null,
  realUser: null,
  isImpersonating: false,
  exitImpersonation: () => {},
  notifications: [],
  unreadNotificationsCount: 0,
  isOnboardingActive: false,
  finishOnboarding: () => {},
  skipOnboarding: () => {},
  restartOnboarding: () => {},
  comments: [],
  reportHistory: [],
  categories: {},
  gamificationSettings: null,
};


export const AppContext = React.createContext<AppContextType>(defaultContextValue);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = React.useState<Language>(Language.AR);
  const [theme, setTheme] = React.useState<Theme>(Theme.LIGHT);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [overrideUser, setOverrideUser] = React.useState<User | null>(null);
  const [realUser, setRealUser] = React.useState<User | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isOnboardingActive, setIsOnboardingActive] = React.useState(false);
  const [achievementToastId, setAchievementToastId] = React.useState<string | null>(null);
  
  const [comments, setComments] = React.useState<(Comment & { user: User })[]>([]);
  const [reportHistory, setReportHistory] = React.useState<ReportHistory[]>([]);

  const [mapCenter, setMapCenter] = React.useState<L.LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = React.useState<number | null>(null);
  const [mapTargetLocation, setMapTargetLocation] = React.useState<(L.LatLngTuple & { 2?: number }) | null>(null);

  const [activeCategories, setActiveCategories] = React.useState<Set<ReportCategory>>(new Set());
  const [activeStatuses, setActiveStatuses] = React.useState<Set<ReportStatus>>(new Set());
  const [activeTimeFilter, setActiveTimeFilter] = React.useState<TimeFilter>(TimeFilter.All);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Report Wizard State
  const [wizardData, setWizardData] = React.useState<ReportData | null>(null);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [isWizardActive, setIsWizardActive] = React.useState(false);

  // Dynamic Config State
  const [categories, setCategories] = React.useState<any>({});
  const [dynamicBadges, setDynamicBadges] = React.useState<DynamicBadge[]>([]);
  const [gamificationSettings, setGamificationSettings] = React.useState<GamificationSettings | null>(null);

  // Impersonation State
  const [impersonationRedirectPath, setImpersonationRedirectPath] = React.useState<string | null>(null);

  const t = translations[language];
  const lastFetchedUserId = React.useRef<string | null>(null);

  const effectiveCurrentUser = overrideUser || currentUser;
  const isImpersonating = !!(realUser && overrideUser);

  const handleUserUpdate = React.useCallback(async (user: User) => {
    setCurrentUser(user);
    await api.setCurrentUser(user);
  }, []);
  
  const showNewBadge = React.useCallback((badge: DynamicBadge) => {
    if (!effectiveCurrentUser) return;
    
    setAchievementToastId(badge.id);
    const newNotification: Notification = {
        id: `notif-badge-${badge.id}-${Date.now()}`,
        user_id: effectiveCurrentUser.id,
        type: NotificationType.Badge,
        metadata: { badgeName: language === 'ar' ? badge.name_ar : badge.name_en },
        report_id: null,
        created_at: new Date().toISOString(),
        read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [effectiveCurrentUser, language]);
  
  const checkAndAwardBadges = React.useCallback((user: User, allUserReports: Report[], dynamicBadgesList: DynamicBadge[]): DynamicBadge | null => {
      const earnedBadgeIds = new Set(user.achievements);
      for (const badge of dynamicBadgesList) {
          if (!badge.is_active || earnedBadgeIds.has(badge.id)) continue;

          let conditionMet = false;
          const { type, value, category_filter } = badge.criteria;
          switch (type) {
              case 'report_count':
                  const relevantReports = category_filter ? allUserReports.filter(r => r.category === category_filter) : allUserReports;
                  if (relevantReports.length >= value) conditionMet = true;
                  break;
              case 'confirmation_count':
                  if (user.reportsConfirmed >= value) conditionMet = true;
                  break;
              case 'point_threshold':
                  if (user.points >= value) conditionMet = true;
                  break;
          }
          if (conditionMet) return badge;
      }
      return null;
  }, []);
  
  const processBadgeAwards = React.useCallback(async (user: User, allReports: Report[], dynamicBadgesList: DynamicBadge[]) => {
      let currentUserState = { ...user };
      const userReports = allReports.filter(r => r.created_by === currentUserState.id);
      let awardedBadges = false;

      while (true) {
          const newBadge = checkAndAwardBadges(currentUserState, userReports, dynamicBadgesList);
          if (newBadge) {
              awardedBadges = true;
              const pointsForBadge = gamificationSettings?.pointsRules.find(r => r.id === 'earn_badge')?.points || 0;
              currentUserState = { ...currentUserState, achievements: [...currentUserState.achievements, newBadge.id], points: currentUserState.points + pointsForBadge };
              showNewBadge(newBadge);
              await new Promise(resolve => setTimeout(resolve, 6500));
          } else {
              break;
          }
      }

      if (awardedBadges) {
          await handleUserUpdate(currentUserState);
      }
      return currentUserState;
  }, [checkAndAwardBadges, showNewBadge, handleUserUpdate, gamificationSettings]);

  const fetchAllData = React.useCallback(async (user: User) => {
    setLoading(true);
    try {
        const [reportsData, notificationsData, pendingReportsData, dynamicCategoriesData, dynamicBadgesData, gamificationSettingsData] = await Promise.all([
            api.fetchReports(),
            api.fetchNotificationsByUserId(user.id),
            getPendingReports(),
            api.getDynamicCategories(),
            api.getDynamicBadges(),
            api.getGamificationSettings(),
        ]);
        
        const categoriesObject = dynamicCategoriesData.reduce((acc, cat) => {
            (acc as any)[cat.id] = {
                icon: ICON_MAP[cat.icon] || ICON_MAP['FaQuestion'],
                color: { light: cat.color_light, dark: cat.color_dark },
                name_en: cat.name_en,
                name_ar: cat.name_ar,
                is_active: cat.is_active,
                subCategories: cat.subCategories.reduce((subAcc, sub) => {
                    (subAcc as any)[sub.id] = { name_en: sub.name_en, name_ar: sub.name_ar };
                    return subAcc;
                }, {} as any)
            };
            return acc;
        }, {});
        setCategories(categoriesObject);
        setDynamicBadges(dynamicBadgesData);
        setGamificationSettings(gamificationSettingsData || null);

        const pendingReportsForState: Report[] = pendingReportsData
            .filter(p => p.created_by === user.id)
            .map(p => ({ ...p, id: `pending-${p.timestamp}`, created_at: new Date(p.timestamp).toISOString(), status: ReportStatus.New, confirmations_count: 1, isPending: true }));
        
        const combinedReports = [...pendingReportsForState, ...reportsData];
        const uniqueReports = Array.from(new Map(combinedReports.map(item => [item.id, item])).values());
        
        setReports(uniqueReports.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setNotifications(notificationsData);

        await processBadgeAwards(user, uniqueReports, dynamicBadgesData);

    } catch (error) {
        console.error("Failed to fetch app data", error);
    } finally {
        setLoading(false);
    }
  }, [processBadgeAwards]);


  // Effect for one-time application initialization
  React.useEffect(() => {
    const handleSWMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'PERFORM_SYNC') {
        const pending = await getPendingReports();
        if (pending.length === 0) return;
        
        const userForSync = overrideUser || currentUser;
        if (!userForSync) {
            console.warn("Sync requested but no user is logged in. Aborting.");
            return;
        }

        for (const reportData of pending) {
          try {
            const { timestamp, ...submissionData } = reportData;
            const newReport = await api.submitReport(submissionData, userForSync);
            await deletePendingReport(timestamp);
            setReports(prev => [newReport, ...prev.filter(r => r.timestamp !== timestamp)]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          } catch (error) {
            console.error('Failed to sync a pending report:', error);
          }
        }
      }
    };

    const initializeApp = async () => {
      const storedLang = localStorage.getItem('mshkltk-lang') as Language;
      if (storedLang) setLanguage(storedLang);

      const storedTheme = localStorage.getItem('mshkltk-theme') as Theme;
      if (storedTheme) setTheme(storedTheme);
      else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme(Theme.DARK);

      const storedTimeFilter = localStorage.getItem('mshkltk-activeTimeFilter') as TimeFilter;
      if (storedTimeFilter && Object.values(TimeFilter).includes(storedTimeFilter)) setActiveTimeFilter(storedTimeFilter);

      try {
        await initDB();
        navigator.serviceWorker?.addEventListener('message', handleSWMessage);
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to initialize the app:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeApp();

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, [currentUser, overrideUser]); // Added currentUser and overrideUser dependency

  // Effect for refreshing data when the tab becomes visible
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser) {
        fetchAllData(currentUser);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser, fetchAllData]);

  // FIX: This effect now uses `effectiveCurrentUser` to decide when to fetch data.
  // This ensures that when a temporary override user is set (e.g., by the Super Admin),
  // the AppContext re-fetches all necessary data, including the latest dynamic categories.
  React.useEffect(() => {
    const user = effectiveCurrentUser;
    if (user && user.id !== lastFetchedUserId.current) {
        lastFetchedUserId.current = user.id;
        fetchAllData(user);
        // Don't show onboarding tour for override users (Super Admin testing).
        if (!user.onboarding_complete && !overrideUser) {
            setTimeout(() => setIsOnboardingActive(true), 500);
        }
    } else if (!user && !authLoading) {
        setReports([]);
        setNotifications([]);
        setLoading(false);
        lastFetchedUserId.current = null;
    }
  }, [effectiveCurrentUser, overrideUser, authLoading, fetchAllData]);

  React.useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language === Language.AR ? 'rtl' : 'ltr'; localStorage.setItem('mshkltk-lang', language); }, [language]);
  React.useEffect(() => { document.documentElement.classList.toggle('dark', theme === Theme.DARK); localStorage.setItem('mshkltk-theme', theme); }, [theme]);
  React.useEffect(() => { localStorage.setItem('mshkltk-activeCategories', JSON.stringify(Array.from(activeCategories))); }, [activeCategories]);
  React.useEffect(() => { localStorage.setItem('mshkltk-activeStatuses', JSON.stringify(Array.from(activeStatuses))); }, [activeStatuses]);
  React.useEffect(() => { localStorage.setItem('mshkltk-activeTimeFilter', activeTimeFilter); }, [activeTimeFilter]);

  const toggleLanguage = React.useCallback(() => setLanguage(p => (p === Language.AR ? Language.EN : Language.AR)), []);
  const toggleTheme = React.useCallback(() => setTheme(p => (p === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)), []);
  const clearAchievementToast = React.useCallback(() => setAchievementToastId(null), []);
  const clearImpersonationRedirect = React.useCallback(() => setImpersonationRedirectPath(null), []);
  
  const exitImpersonation = React.useCallback(async (redirectPath: string) => {
    api.logout(); // Clear JWT token
    setOverrideUser(null);
    setRealUser(null);
    setImpersonationRedirectPath(redirectPath);
  }, []);
  
  const finishOnboarding = React.useCallback(async () => {
    setIsOnboardingActive(false);
    if (currentUser) {
      // Update local state immediately
      const updatedUser = { ...currentUser, onboarding_complete: true };
      setCurrentUser(updatedUser);
      
      // Persist to backend
      try {
        await api.updateCurrentUser({ onboarding_complete: true });
      } catch (error) {
        console.error('Failed to save onboarding completion:', error);
      }
    }
  }, [currentUser]);
  
  const skipOnboarding = React.useCallback(async () => {
    setIsOnboardingActive(false);
    if (currentUser) {
      // Update local state immediately
      const updatedUser = { ...currentUser, onboarding_complete: true };
      setCurrentUser(updatedUser);
      
      // Persist to backend
      try {
        await api.updateCurrentUser({ onboarding_complete: true });
      } catch (error) {
        console.error('Failed to save onboarding skip:', error);
      }
    }
  }, [currentUser]);
  
  const restartOnboarding = React.useCallback(() => {
    setIsOnboardingActive(true);
  }, []);
  
  const signup = React.useCallback(async (data, options) => {
    if (options?.upgradingFromGuest && currentUser?.is_anonymous) {
        const upgradedUser = await api.upgradeAnonymousUser(currentUser, data);
        await handleUserUpdate(upgradedUser);
        return upgradedUser;
    }
    const user = await api.createUser(data);
    await handleUserUpdate(user);
    return user;
  }, [handleUserUpdate, currentUser]);
  
  const login = React.useCallback(async (data) => { 
    const user = await api.loginUser(data); 
    
    // Check if user is a super admin or portal user
    if (user.role === 'super_admin') {
      // Throw a special error to trigger redirect to super admin portal
      const error: any = new Error('Super admin accounts must login through the super admin portal');
      error.redirectTo = '/superadmin/login';
      error.user = user;
      throw error;
    } else if (user.role === 'portal' && user.portal_access_level) {
      // Throw a special error to trigger redirect to portal login
      const error: any = new Error('Portal accounts must login through the portal');
      error.redirectTo = '/portal/login';
      error.user = user;
      throw error;
    }
    
    await handleUserUpdate(user); 
    return user; 
  }, [handleUserUpdate]);
  
  const loginAnonymous = React.useCallback(async () => { const user = await api.createAnonymousUser(); await handleUserUpdate(user); return user; }, [handleUserUpdate]);
  const logout = React.useCallback(async () => { await api.logout(); setCurrentUser(null); setReports([]); setNotifications([]); setComments([]); setReportHistory([]); }, []);

  const updateUserAvatar = React.useCallback(async (avatarUrl: string) => {
    try { const updatedUser = await api.updateUserAvatar(avatarUrl); await handleUserUpdate(updatedUser); }
    catch (error) { console.error("Failed to update avatar", error); }
  }, [handleUserUpdate]);

  const setMapView = React.useCallback((center: L.LatLngTuple, zoom: number) => { setMapCenter(center); setMapZoom(zoom); }, []);
  const flyToLocation = React.useCallback((coords: L.LatLngTuple, zoom: number = 15) => { const target: L.LatLngTuple & { 2?: number } = [...coords]; target[2] = zoom; setMapTargetLocation(target); }, []);
  const clearMapTarget = React.useCallback(() => setMapTargetLocation(null), []);

  const setTempUserOverride = React.useCallback(async (impersonatedUser: User | null, impersonatorUser: User | null = null, redirectPath: string | null = null) => {
    api.logout(); // Clear current JWT token
    if (impersonatedUser && impersonatorUser && (impersonatedUser.role !== 'citizen')) {
        await api.setCurrentUser(impersonatedUser, true);
    }
    setOverrideUser(impersonatedUser);
    setRealUser(impersonatorUser);
    if (redirectPath) setImpersonationRedirectPath(redirectPath);
  }, []);

  const submitReport = React.useCallback(async (reportData) => {
    if (!effectiveCurrentUser) throw new Error("User not authenticated");
    
    // Removed blocking AI translation. The report is now created instantly.
    // A real backend would handle translation asynchronously. Here, we just
    // duplicate the text to satisfy the data model.
    let submissionPayload: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>;
    if (language === 'ar') {
        submissionPayload = { ...reportData, title_ar: reportData.title, note_ar: reportData.note, title_en: reportData.title, note_en: reportData.note, created_by: effectiveCurrentUser.id };
    } else {
        submissionPayload = { ...reportData, title_en: reportData.title, note_en: reportData.note, title_ar: reportData.title, note_ar: reportData.note, created_by: effectiveCurrentUser.id };
    }
    delete (submissionPayload as any).title;
    delete (submissionPayload as any).note;
    
    const queueForSync = async (payload: any) => {
        const pendingReport: PendingReportData = { ...payload, timestamp: Date.now() };
        await addPendingReport(pendingReport);
        const reportForState: Report = {...pendingReport, id: `pending-${pendingReport.timestamp}`, created_at: new Date(pendingReport.timestamp).toISOString(), status: ReportStatus.New, confirmations_count: 1, isPending: true };
        setReports(prev => [reportForState, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        if ('serviceWorker' in navigator && 'SyncManager' in window) navigator.serviceWorker.ready.then(sw => (sw as any).sync.register('sync-new-reports'));
        return reportForState;
    };

    if (navigator.onLine) {
        try {
            const newReport = await api.submitReport(submissionPayload, effectiveCurrentUser);
            setReports(prev => [newReport, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            
            // Refetch user data to get updated points and stats from backend
            if (!overrideUser && currentUser && currentUser.role === 'citizen') {
              try {
                const updatedUser = await api.getCurrentUser();
                setCurrentUser(updatedUser);
                processBadgeAwards(updatedUser, [newReport, ...reports], dynamicBadges);
              } catch (error) {
                console.error('Failed to refetch user after submit:', error);
              }
            }
            
            return newReport;
        } catch (error) {
            console.warn("Online submission failed, falling back to sync.", error);
            return await queueForSync(submissionPayload);
        }
    }
    return await queueForSync(submissionPayload);
  }, [effectiveCurrentUser, overrideUser, currentUser, reports, processBadgeAwards, language, dynamicBadges]);

  const updateReportInState = React.useCallback((updatedReport: Report) => { setReports(prevReports => prevReports.map(r => r.id === updatedReport.id ? updatedReport : r)); }, []);

  const confirmReport = React.useCallback(async (reportId: string) => {
    if (!effectiveCurrentUser || reportId.startsWith('pending-') || effectiveCurrentUser.confirmedReportIds?.includes(reportId) || reports.find(r => r.id === reportId)?.created_by === effectiveCurrentUser.id) return;
    
    const { report: updatedReport, newNotifications } = await api.confirmReport(reportId, effectiveCurrentUser);
    updateReportInState(updatedReport);
    if (newNotifications.length > 0) {
        const notificationsForCurrentUser = newNotifications.filter(n => n.user_id === effectiveCurrentUser.id);
        if (notificationsForCurrentUser.length > 0) setNotifications(prev => [...notificationsForCurrentUser, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    
    // Refetch user data to get updated points and stats from backend
    if (!overrideUser && currentUser && currentUser.role === 'citizen') {
      try {
        const updatedUser = await api.getCurrentUser();
        setCurrentUser(updatedUser);
        processBadgeAwards(updatedUser, reports, dynamicBadges);
      } catch (error) {
        console.error('Failed to refetch user after confirm:', error);
      }
    }
  }, [effectiveCurrentUser, overrideUser, currentUser, reports, updateReportInState, processBadgeAwards, dynamicBadges]);

  const markNotificationsAsRead = React.useCallback(() => { setNotifications(prev => prev.map(n => ({...n, read: true}))); }, []);
  const fetchComments = React.useCallback(async (reportId: string) => { const data = await api.fetchCommentsByReportId(reportId); setComments(data); }, []);

  const addComment = React.useCallback(async (reportId: string, text: string) => {
      if (!effectiveCurrentUser) return;
      const { comment: newComment, newNotifications } = await api.addComment(reportId, text, effectiveCurrentUser);
      setComments(prev => [newComment, ...prev]);
      if (newNotifications.length > 0) {
        const notificationsForCurrentUser = newNotifications.filter(n => n.user_id === effectiveCurrentUser.id);
        if (notificationsForCurrentUser.length > 0) setNotifications(prev => [...notificationsForCurrentUser, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
  }, [effectiveCurrentUser]);
  
  const fetchReportHistory = React.useCallback(async (reportId: string) => { const data = await api.fetchHistoryByReportId(reportId); setReportHistory(data); }, []);

  const toggleReportSubscription = React.useCallback(async (reportId: string) => {
    if (!effectiveCurrentUser) return;

    // Capture pre-update state for potential rollback
    const originalUser = { ...effectiveCurrentUser };
    const originalReport = reports.find(r => r.id === reportId);
    if (!originalReport) return;

    // Optimistic UI updates
    const isCurrentlySubscribed = originalUser.subscribedReportIds?.includes(reportId);
    const updatedUserOptimistic = {
        ...originalUser,
        subscribedReportIds: isCurrentlySubscribed
            ? (originalUser.subscribedReportIds || []).filter(id => id !== reportId)
            : [...(originalUser.subscribedReportIds || []), reportId]
    };
    if (overrideUser) {
        setOverrideUser(updatedUserOptimistic);
    } else {
        setCurrentUser(updatedUserOptimistic);
    }
    updateReportInState({
        ...originalReport,
        subscribedUserIds: isCurrentlySubscribed
            ? (originalReport.subscribedUserIds || []).filter(id => id !== effectiveCurrentUser.id)
            : [...(originalReport.subscribedUserIds || []), effectiveCurrentUser.id]
    });

    try {
        // BUG FIX: Pass only the user ID to the API to prevent race conditions with stale user objects.
        const { report, user, newNotifications } = await api.toggleSubscription(reportId, effectiveCurrentUser.id);

        // Update state with fresh data from the API response
        if (overrideUser) {
            setOverrideUser(user);
        } else {
            await handleUserUpdate(user);
        }
        updateReportInState(report);
        
        if (newNotifications.length > 0) {
            const notificationsForCurrentUser = newNotifications.filter(n => n.user_id === effectiveCurrentUser.id);
            if (notificationsForCurrentUser.length > 0) {
                setNotifications(prev => [...notificationsForCurrentUser, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            }
        }
    } catch (error) {
        console.error("Failed to toggle subscription", error);
        // Revert optimistic updates on failure
        if (overrideUser) {
            setOverrideUser(originalUser);
        } else {
            setCurrentUser(originalUser);
        }
        updateReportInState(originalReport);
    }
}, [effectiveCurrentUser, overrideUser, reports, handleUserUpdate, updateReportInState]);
  
  const toggleCategory = React.useCallback((category: ReportCategory) => setActiveCategories(prev => { const newSet = new Set(prev); if (newSet.has(category)) newSet.delete(category); else newSet.add(category); return newSet; }), []);
  const setCategoriesFilter = React.useCallback((categories: Set<ReportCategory>) => setActiveCategories(categories), []);
  const clearCategories = React.useCallback(() => setActiveCategories(new Set()), []);

  const toggleStatus = React.useCallback((status: ReportStatus) => setActiveStatuses(prev => { const newSet = new Set(prev); if (newSet.has(status)) newSet.delete(status); else newSet.add(status); return newSet; }), []);
  const setStatuses = React.useCallback((statuses: Set<ReportStatus>) => setActiveStatuses(statuses), []);
  const clearStatuses = React.useCallback(() => setActiveStatuses(new Set()), []);
  
  const startWizard = React.useCallback(() => {
    // FIX: Initialize missing `detectedIssues` and `multiReportSelection` properties to match the `ReportData` type.
    setWizardData({ category: null, sub_category: null, previews: [], location: null, address: '', title: '', description: '', municipality: '', withMedia: null, severity: null, detectedIssues: [], multiReportSelection: {} });
    setWizardStep(1); setIsWizardActive(true);
  }, []);
  const resetWizard = React.useCallback(() => { setWizardData(null); setWizardStep(1); setIsWizardActive(false); }, []);
  const updateWizardData = React.useCallback((updates: Partial<ReportData>) => { setWizardData(prev => (prev ? { ...prev, ...updates } : null)); }, []);

  const value = React.useMemo(() => ({
    language, theme, toggleLanguage, toggleTheme, t, reports, loading, authLoading, currentUser: effectiveCurrentUser, overrideUser, realUser, isImpersonating, exitImpersonation, notifications,
    unreadNotificationsCount: notifications.filter(n => !n.read).length,
    signup, login, loginAnonymous, logout, updateUserAvatar, submitReport, confirmReport, updateReportInState, setTempUserOverride,
    markNotificationsAsRead, isOnboardingActive, finishOnboarding, skipOnboarding, restartOnboarding, toggleReportSubscription, achievementToastId,
    clearAchievementToast, comments, reportHistory, fetchComments, addComment, fetchReportHistory, mapCenter, mapZoom,
    setMapView, mapTargetLocation, flyToLocation, clearMapTarget, activeCategories, toggleCategory, setCategories: setCategoriesFilter,
    clearCategories, activeStatuses, toggleStatus, setStatuses, clearStatuses, activeTimeFilter, setTimeFilter: setActiveTimeFilter,
    searchQuery, setSearchQuery,
    wizardData, wizardStep, isWizardActive, startWizard, resetWizard, setWizardStep, updateWizardData,
    categories, gamificationSettings,
    impersonationRedirectPath, clearImpersonationRedirect,
  }), [
    language, theme, toggleLanguage, toggleTheme, t, reports, loading, authLoading, effectiveCurrentUser, overrideUser, realUser, isImpersonating, exitImpersonation, notifications,
    signup, login, loginAnonymous, logout, updateUserAvatar, submitReport, confirmReport, updateReportInState, setTempUserOverride,
    markNotificationsAsRead, isOnboardingActive, finishOnboarding, skipOnboarding, restartOnboarding, toggleReportSubscription, achievementToastId,
    clearAchievementToast, comments, reportHistory, fetchComments, addComment, fetchReportHistory, mapCenter, mapZoom,
    setMapView, mapTargetLocation, flyToLocation, clearMapTarget, activeCategories, toggleCategory, setCategoriesFilter,
    clearCategories, activeStatuses, toggleStatus, setStatuses, clearStatuses, activeTimeFilter, setActiveTimeFilter,
    searchQuery, setSearchQuery,
    wizardData, wizardStep, isWizardActive, startWizard, resetWizard, updateWizardData, setWizardStep,
    categories, gamificationSettings,
    impersonationRedirectPath, clearImpersonationRedirect
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
