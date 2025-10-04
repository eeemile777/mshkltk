import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, Theme, Report, User, Notification, Badge, ReportCategory, ReportStatus, Comment, ReportHistory, PendingReportData, TimeFilter, NotificationType, Preview, ReportData } from '../types';
// FIX: Added CATEGORIES to import for use in state initialization.
import { translations, BADGES, PATHS, CATEGORIES } from '../constants';
import * as api from '../services/mockApi';
import L from 'leaflet';
import { GoogleGenAI } from '@google/genai';


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
            // Add robustness check: ensure parsed value is an array before filtering
            if (Array.isArray(parsed)) {
                const validValues = parsed.filter((v: any) => allValues.includes(v));
                return new Set(validValues);
            }
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
    }
    return new Set(); // Default to an empty set
};

const translateText = async (text: string, targetLanguage: 'English' | 'Arabic'): Promise<string> => {
    if (!text.trim() || !process.env.API_KEY) return text; // Return original if empty or no key
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Translate the following text to ${targetLanguage}. Respond with ONLY the translated text, no extra formatting or explanations. Text to translate: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Added trim() to clean up potential whitespace from the model
        return response.text.trim();
    } catch (error) {
        console.error(`Gemini translation error to ${targetLanguage}:`, error);
        return text; // Fallback to original text on error
    }
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
  notifications: Notification[];
  unreadNotificationsCount: number;
  
  // Auth methods
  signup: (data: Pick<User, 'first_name' | 'last_name' | 'username'> & {password: string; avatarUrl?: string}, options?: { upgradingFromGuest?: boolean }) => Promise<User>;
  login: (data: Pick<User, 'username'> & {password: string}) => Promise<User>;
  loginAnonymous: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;

  // App methods
  submitReport: (reportData: Pick<Report, 'created_by' | 'category' | 'sub_category' | 'severity' | 'lat' | 'lng' | 'area' | 'municipality' | 'photo_urls'> & { title: string; note: string }) => Promise<Report | undefined>;
  confirmReport: (reportId: string) => Promise<void>;
  updateReportInState: (updatedReport: Report) => void;
  markNotificationsAsRead: () => void;
  isOnboardingActive: boolean;
  finishOnboarding: () => void;
  skipOnboarding: () => void;
  toggleReportSubscription: (reportId: string) => Promise<void>;

  // Achievement Toast
  achievementToastId: string | null;
  clearAchievementToast: () => void;

  // Social Hub
  comments: (Comment & { user: User })[];
  reportHistory: ReportHistory[];
  fetchComments: (reportId: string) => Promise<void>;
  addComment: (reportId: string, text: string) => Promise<void>;
  fetchReportHistory: (reportId: string) => Promise<void>;


  // Map state for persistence and control
  mapCenter: L.LatLngTuple | null;
  mapZoom: number | null;
  setMapView: (center: L.LatLngTuple, zoom: number) => void;
  mapTargetLocation: (L.LatLngTuple & { 2?: number }) | null; // [lat, lng, zoom?]
  flyToLocation: (coords: L.LatLngTuple, zoom?: number) => void;
  clearMapTarget: () => void;

  // Filters
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

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Report Wizard State
  wizardData: ReportData | null;
  wizardStep: number;
  isWizardActive: boolean;
  startWizard: () => void;
  resetWizard: () => void;
  setWizardStep: (step: number | ((prevStep: number) => number)) => void;
  updateWizardData: (updates: Partial<ReportData>) => void;
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
  isOnboardingActive: false,
  finishOnboarding: () => {},
  skipOnboarding: () => {},
  comments: [],
  reportHistory: [],
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
  const [isOnboardingActive, setIsOnboardingActive] = React.useState(false);
  const [achievementToastId, setAchievementToastId] = React.useState<string | null>(null);
  
  const [comments, setComments] = React.useState<(Comment & { user: User })[]>([]);
  const [reportHistory, setReportHistory] = React.useState<ReportHistory[]>([]);

  const [mapCenter, setMapCenter] = React.useState<L.LatLngTuple | null>(null);
  const [mapZoom, setMapZoom] = React.useState<number | null>(null);
  const [mapTargetLocation, setMapTargetLocation] = React.useState<(L.LatLngTuple & { 2?: number }) | null>(null);


  // FIX: `ReportCategory` is a type alias, not a value. Used `Object.keys(CATEGORIES)` to get an array of valid category keys.
  const [activeCategories, setActiveCategories] = React.useState<Set<ReportCategory>>(() => getInitialState('mshkltk-activeCategories', Object.keys(CATEGORIES) as ReportCategory[]));
  const [activeStatuses, setActiveStatuses] = React.useState<Set<ReportStatus>>(() => getInitialState('mshkltk-activeStatuses', Object.values(ReportStatus)));
  const [activeTimeFilter, setActiveTimeFilter] = React.useState<TimeFilter>(TimeFilter.All);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Report Wizard State
  const [wizardData, setWizardData] = React.useState<ReportData | null>(null);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [isWizardActive, setIsWizardActive] = React.useState(false);

  const t = translations[language];
  const lastFetchedUserId = React.useRef<string | null>(null);

  // --- Auth Methods ---
  const handleUserUpdate = React.useCallback(async (user: User) => {
    setCurrentUser(user);
    await api.setCurrentUser(user);
  }, []);

  // --- App Logic ---
  const showNewBadge = React.useCallback((badge: Badge) => {
    if (!currentUser) return;
    
    // 1. Show the toast
    setAchievementToastId(badge.id);

    // 2. Create and add the notification to the list
    const newNotification: Notification = {
        id: `notif-badge-${badge.id}-${Date.now()}`,
        user_id: currentUser.id,
        type: NotificationType.Badge,
        metadata: {
            badgeName: language === 'ar' ? badge.name_ar : badge.name_en,
        },
        report_id: null,
        created_at: new Date().toISOString(),
        read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);

  }, [currentUser, language]);

  const checkAndAwardBadges = React.useCallback((user: User, allUserReports: Report[]): Badge | null => {
      const hasBadge = (id: string) => user.achievements.includes(id);

      // --- Report-based badges ---
      if (allUserReports.length >= 1 && !hasBadge('pioneer')) return BADGES.pioneer;
      
      const wasteReportsCount = allUserReports.filter(r => r.category === 'waste_environment').length;
      if (wasteReportsCount >= 3 && !hasBadge('waste_warrior')) return BADGES.waste_warrior;
      
      if (allUserReports.some(r => r.category === 'infrastructure') && !hasBadge('road_guardian')) return BADGES.road_guardian;
      if (allUserReports.some(r => r.category === 'electricity_energy') && !hasBadge('lightbringer')) return BADGES.lightbringer;
      
      // New category-specific badges
      if (allUserReports.some(r => r.category === 'water_sanitation') && !hasBadge('water_watchdog')) return BADGES.water_watchdog;
      if (allUserReports.some(r => r.category === 'public_safety') && !hasBadge('safety_sentinel')) return BADGES.safety_sentinel;
      if (allUserReports.some(r => r.category === 'public_spaces') && !hasBadge('park_protector')) return BADGES.park_protector;
      if (allUserReports.some(r => r.category === 'public_health') && !hasBadge('health_hero')) return BADGES.health_hero;
      if (allUserReports.some(r => r.category === 'urban_planning') && !hasBadge('urban_planner')) return BADGES.urban_planner;

      // Corrected logic for 'civic_scout' badge
      if (allUserReports.some(r => r.category === 'other_unknown') && !hasBadge('civic_scout')) return BADGES.civic_scout;

      const uniqueAreas = new Set(allUserReports.map(r => r.area)).size;
      if (uniqueAreas >= 3 && !hasBadge('city_explorer')) return BADGES.city_explorer;

      // --- Confirmation-based badges ---
      if (user.reportsConfirmed >= 1 && !hasBadge('good_samaritan')) return BADGES.good_samaritan;
      if (user.reportsConfirmed >= 5 && !hasBadge('community_helper')) return BADGES.community_helper;

      // --- Point-based badges ---
      if (user.points >= 100 && !hasBadge('civic_leader')) return BADGES.civic_leader;

      return null; // No new badge
  }, []);
  
  const processBadgeAwards = React.useCallback(async (user: User, allReports: Report[]) => {
      let currentUserState = { ...user };
      // FIX: Include pending reports in badge calculation for immediate feedback.
      const userReports = allReports.filter(r => r.created_by === currentUserState.id);
      let awardedBadges = false;

      // This loop allows one action to award multiple badges sequentially
      while (true) {
          const newBadge = checkAndAwardBadges(currentUserState, userReports);
          if (newBadge) {
              awardedBadges = true;
              const newAchievements = [...currentUserState.achievements, newBadge.id];
              currentUserState = { 
                  ...currentUserState, 
                  achievements: newAchievements, 
                  points: currentUserState.points + 25 // Bonus points for a badge!
              };
              showNewBadge(newBadge);
              // Wait for toast to be seen before checking for the next badge
              await new Promise(resolve => setTimeout(resolve, 6500));
          } else {
              break; // No more badges to award
          }
      }

      // Persist user changes if any badges were awarded
      if (awardedBadges) {
          await handleUserUpdate(currentUserState);
      }
      return currentUserState;
  }, [checkAndAwardBadges, showNewBadge, handleUserUpdate]);

  // --- Initial Load Effects ---
  React.useEffect(() => {
    // This handler will be attached after the DB is initialized.
    const handleSWMessage = async (event: MessageEvent) => {
        if (event.data && event.data.type === 'PERFORM_SYNC') {
            console.log('App received PERFORM_SYNC message from SW.');
            const pending = await getPendingReports();
            if (pending.length === 0) return;
            
            for (const reportData of pending) {
                try {
                    const { timestamp, ...submissionData } = reportData;
                    const newReport = await api.submitReport(submissionData);
                    await deletePendingReport(timestamp);
                    // FIX: Robustly replace pending report with synced one to prevent duplicates.
                    setReports(prev => [newReport, ...prev.filter(r => r.timestamp !== timestamp)]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                } catch (error) {
                    console.error('Failed to sync a pending report:', error);
                }
            }
        }
    };

    const initializeApp = async () => {
      // 1. Load synchronous preferences from localStorage
      const storedLang = localStorage.getItem('mshkltk-lang') as Language;
      if (storedLang) setLanguage(storedLang);

      const storedTheme = localStorage.getItem('mshkltk-theme') as Theme;
      if (storedTheme) setTheme(storedTheme);
      else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setTheme(Theme.DARK);

      const storedTimeFilter = localStorage.getItem('mshkltk-activeTimeFilter') as TimeFilter;
      if (storedTimeFilter && Object.values(TimeFilter).includes(storedTimeFilter)) {
          setActiveTimeFilter(storedTimeFilter);
      }
      
      try {
        // 2. Await IndexedDB initialization to prevent race conditions
        await initDB();

        // 3. Now that DB is ready, add the SW listener that depends on it
        navigator.serviceWorker?.addEventListener('message', handleSWMessage);

        // 4. Check for the current user session
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to initialize the app:", error);
      } finally {
        // 5. Signal that authentication loading is complete
        setAuthLoading(false);
      }
    };
    
    initializeApp();

    // Cleanup function to remove the listener when the component unmounts
    return () => {
        navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  const fetchAppData = React.useCallback(async (user: User) => {
    setLoading(true);
    try {
        const [reportsData, notificationsData, pendingReportsData] = await Promise.all([
            api.fetchReports(),
            api.fetchNotificationsByUserId(user.id),
            getPendingReports()
        ]);
        
        const pendingReportsForState: Report[] = pendingReportsData
            .filter(p => p.created_by === user.id)
            .map(p => ({
                ...p,
                id: `pending-${p.timestamp}`,
                created_at: new Date(p.timestamp).toISOString(),
                status: ReportStatus.New,
                confirmations_count: 1,
                isPending: true
            }));
        
        const combinedReports = [...pendingReportsForState, ...reportsData];
        // This de-duplication is not perfect if a synced report is fetched before
        // the pending one is removed, but it's a good guardrail. The main sync
        // logic in handleSWMessage is more robust.
        const uniqueReports = Array.from(new Map(combinedReports.map(item => [item.id, item])).values());
        
        setReports(uniqueReports.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setNotifications(notificationsData);

        // Check for any retroactive badges the user should have earned
        await processBadgeAwards(user, uniqueReports);

    } catch (error) {
        console.error("Failed to fetch app data", error);
    } finally {
        setLoading(false);
    }
  }, [processBadgeAwards]);

  React.useEffect(() => {
    const user = currentUser;
    // Fetch data only if we have a user AND their ID is different from the last user we fetched data for.
    // This prevents re-fetching when the user object is updated with new points or badges.
    if (user && user.id !== lastFetchedUserId.current) {
        lastFetchedUserId.current = user.id; // Mark that we're fetching for this user
        fetchAppData(user);
        
        // Start tour if user (guest or not) has `onboarding_complete` set to false.
        if (!user.onboarding_complete) {
            // Use a small timeout to allow the main UI to render first
            setTimeout(() => setIsOnboardingActive(true), 500);
        }
    } else if (!user && !authLoading) {
        // If no user and not loading auth, then clear app data and reset the fetch tracker.
        setReports([]);
        setNotifications([]);
        setLoading(false);
        lastFetchedUserId.current = null;
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

  React.useEffect(() => {
    localStorage.setItem('mshkltk-activeCategories', JSON.stringify(Array.from(activeCategories)));
  }, [activeCategories]);

  React.useEffect(() => {
    localStorage.setItem('mshkltk-activeStatuses', JSON.stringify(Array.from(activeStatuses)));
  }, [activeStatuses]);

  React.useEffect(() => {
    localStorage.setItem('mshkltk-activeTimeFilter', activeTimeFilter);
  }, [activeTimeFilter]);


  // --- Memoized Methods ---
  const toggleLanguage = React.useCallback(() => setLanguage(p => (p === Language.AR ? Language.EN : Language.AR)), []);
  const toggleTheme = React.useCallback(() => setTheme(p => (p === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)), []);
  const clearAchievementToast = React.useCallback(() => setAchievementToastId(null), []);
  
  const finishOnboarding = React.useCallback(() => {
    setIsOnboardingActive(false);
    if (currentUser) {
      const updatedUser = { ...currentUser, onboarding_complete: true };
      handleUserUpdate(updatedUser);
    }
  }, [currentUser, handleUserUpdate]);

  const skipOnboarding = React.useCallback(() => {
    setIsOnboardingActive(false);
  }, []);
  
  const signup = React.useCallback(async (data, options) => {
    if (options?.upgradingFromGuest && currentUser && currentUser.is_anonymous) {
        const upgradedUser = await api.upgradeAnonymousUser(currentUser, data);
        await handleUserUpdate(upgradedUser);
        return upgradedUser;
    } else {
        const user = await api.createUser(data);
        await handleUserUpdate(user);
        return user;
    }
  }, [handleUserUpdate, currentUser]);
  
  const login = React.useCallback(async (data) => {
    const user = await api.loginUser(data);
    await handleUserUpdate(user);
    return user;
  }, [handleUserUpdate]);

  const loginAnonymous = React.useCallback(async () => {
    const user = await api.createAnonymousUser();
    await handleUserUpdate(user);
    return user;
  }, [handleUserUpdate]);

  const logout = React.useCallback(async () => {
    await api.logout();
    setCurrentUser(null);
    setReports([]);
    setNotifications([]);
    setComments([]);
    setReportHistory([]);
  }, []);

  const updateUserAvatar = React.useCallback(async (avatarUrl: string) => {
    try {
        const updatedUser = await api.updateUserAvatar(avatarUrl);
        await handleUserUpdate(updatedUser);
    } catch (error) {
        console.error("Failed to update avatar", error);
    }
  }, [handleUserUpdate]);

  const setMapView = React.useCallback((center: L.LatLngTuple, zoom: number) => {
    setMapCenter(center);
    setMapZoom(zoom);
  }, []);

  const flyToLocation = React.useCallback((coords: L.LatLngTuple, zoom: number = 15) => {
    const target: L.LatLngTuple & { 2?: number } = [...coords];
    target[2] = zoom;
    setMapTargetLocation(target);
  }, []);
  
  const clearMapTarget = React.useCallback(() => setMapTargetLocation(null), []);

  const submitReport = React.useCallback(async (reportData: Pick<Report, 'created_by' | 'category' | 'sub_category' | 'severity' | 'lat' | 'lng' | 'area' | 'municipality' | 'photo_urls'> & { title: string; note: string }) => {
    if (!currentUser) throw new Error("User not authenticated");

    let updatedUser = {...currentUser, points: currentUser.points + 10, reports_count: currentUser.reports_count + 1};
    await handleUserUpdate(updatedUser);
    
    // Translation logic
    let submissionPayload: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>;
    
    if (language === 'ar') {
        const [titleEn, noteEn] = await Promise.all([
            translateText(reportData.title, 'English'),
            translateText(reportData.note, 'English')
        ]);
        submissionPayload = {
            ...reportData,
            title_ar: reportData.title,
            note_ar: reportData.note,
            title_en: titleEn,
            note_en: noteEn
        };
    } else { // 'en' or fallback
        const [titleAr, noteAr] = await Promise.all([
            translateText(reportData.title, 'Arabic'),
            translateText(reportData.note, 'Arabic')
        ]);
        submissionPayload = {
            ...reportData,
            title_en: reportData.title,
            note_en: reportData.note,
            title_ar: titleAr,
            note_ar: noteAr
        };
    }
    // remove original title and note from submissionPayload
    delete (submissionPayload as any).title;
    delete (submissionPayload as any).note;
    
    const queueForSync = async (payload: Omit<Report, 'id' | 'created_at' | 'status' | 'confirmations_count'>) => {
        const pendingReport: PendingReportData = { ...payload, timestamp: Date.now() };
        await addPendingReport(pendingReport);
        const reportForState: Report = {...pendingReport, id: `pending-${pendingReport.timestamp}`, created_at: new Date(pendingReport.timestamp).toISOString(), status: ReportStatus.New, confirmations_count: 1, isPending: true };
        setReports(prev => [reportForState, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        processBadgeAwards(updatedUser, [reportForState, ...reports]);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(sw => (sw as any).sync.register('sync-new-reports'));
        }
        return reportForState;
    };

    if (navigator.onLine) {
        try {
            const newReport = await api.submitReport(submissionPayload);
            setReports(prev => [newReport, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            processBadgeAwards(updatedUser, [newReport, ...reports]);
            return newReport;
        } catch (error) {
            console.warn("Online submission failed, falling back to sync.", error);
            return await queueForSync(submissionPayload);
        }
    } else {
        return await queueForSync(submissionPayload);
    }
  }, [currentUser, handleUserUpdate, reports, processBadgeAwards, language]);

  const updateReportInState = React.useCallback((updatedReport: Report) => {
    setReports(prevReports => prevReports.map(r => r.id === updatedReport.id ? updatedReport : r));
  }, []);

  const confirmReport = React.useCallback(async (reportId: string) => {
    if (!currentUser || reportId.startsWith('pending-')) return;
    if (currentUser.confirmedReportIds?.includes(reportId) || reports.find(r => r.id === reportId)?.created_by === currentUser.id) return;
    
    const { report: updatedReport, newNotifications } = await api.confirmReport(reportId, currentUser.id);
    if (updatedReport) {
      updateReportInState(updatedReport);
      if (newNotifications.length > 0) {
        const notificationsForCurrentUser = newNotifications.filter(n => n.user_id === currentUser.id);
        if (notificationsForCurrentUser.length > 0) {
            setNotifications(prev => [...notificationsForCurrentUser, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
      }
      const userAfterConfirm = { ...currentUser, points: currentUser.points + 3, reportsConfirmed: currentUser.reportsConfirmed + 1, confirmedReportIds: [...(currentUser.confirmedReportIds || []), reportId] };
      await handleUserUpdate(userAfterConfirm);
      processBadgeAwards(userAfterConfirm, reports);
    }
  }, [currentUser, reports, updateReportInState, handleUserUpdate, processBadgeAwards]);

  const markNotificationsAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  }, []);

  const fetchComments = React.useCallback(async (reportId: string) => {
      const data = await api.fetchCommentsByReportId(reportId);
      setComments(data);
  }, []);

  const addComment = React.useCallback(async (reportId: string, text: string) => {
      if (!currentUser) return;
      const { comment: newComment, newNotifications } = await api.addComment(reportId, currentUser.id, text);
      setComments(prev => [newComment, ...prev]);
      if (newNotifications.length > 0) {
        const notificationsForCurrentUser = newNotifications.filter(n => n.user_id === currentUser.id);
        if (notificationsForCurrentUser.length > 0) {
            setNotifications(prev => [...notificationsForCurrentUser, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
      }
  }, [currentUser]);
  
  const fetchReportHistory = React.useCallback(async (reportId: string) => {
      const data = await api.fetchHistoryByReportId(reportId);
      setReportHistory(data);
  }, []);

  const toggleReportSubscription = React.useCallback(async (reportId: string) => {
    if (!currentUser) return;
    const isCurrentlySubscribed = currentUser.subscribedReportIds?.includes(reportId);
    const updatedUserOptimistic = {...currentUser, subscribedReportIds: isCurrentlySubscribed ? (currentUser.subscribedReportIds || []).filter(id => id !== reportId) : [...(currentUser.subscribedReportIds || []), reportId]};
    setCurrentUser(updatedUserOptimistic);
    setReports(prev => prev.map(r => r.id === reportId ? {...r, subscribedUserIds: isCurrentlySubscribed ? (r.subscribedUserIds || []).filter(id => id !== currentUser.id) : [...(r.subscribedUserIds || []), currentUser.id]} : r));
    try {
        const { report, user, newNotifications } = await api.toggleSubscription(reportId, currentUser.id);
        await handleUserUpdate(user);
        updateReportInState(report);
        if (newNotifications.length > 0) {
            const notificationsForCurrentUser = newNotifications.filter(n => n.user_id === currentUser.id);
            if (notificationsForCurrentUser.length > 0) {
                setNotifications(prev => [...notificationsForCurrentUser, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            }
        }
    } catch (error) {
        console.error("Failed to toggle subscription", error);
        setCurrentUser(currentUser);
        setReports(reports);
    }
  }, [currentUser, reports, handleUserUpdate, updateReportInState]);
  
  const toggleCategory = React.useCallback((category: ReportCategory) => setActiveCategories(prev => { const newSet = new Set(prev); if (newSet.has(category)) newSet.delete(category); else newSet.add(category); return newSet; }), []);
  const setCategories = React.useCallback((categories: Set<ReportCategory>) => setActiveCategories(categories), []);
  const clearCategories = React.useCallback(() => setActiveCategories(new Set()), []);

  const toggleStatus = React.useCallback((status: ReportStatus) => setActiveStatuses(prev => { const newSet = new Set(prev); if (newSet.has(status)) newSet.delete(status); else newSet.add(status); return newSet; }), []);
  const setStatuses = React.useCallback((statuses: Set<ReportStatus>) => setActiveStatuses(statuses), []);
  const clearStatuses = React.useCallback(() => setActiveStatuses(new Set()), []);
  
  // Report Wizard Methods
  const startWizard = React.useCallback(() => {
    setWizardData({
        category: null,
        sub_category: null,
        previews: [],
        location: null,
        address: '',
        title: '',
        description: '',
        municipality: '',
        withMedia: null,
        severity: null,
    });
    setWizardStep(1);
    setIsWizardActive(true);
  }, []);

  const resetWizard = React.useCallback(() => {
    setWizardData(null);
    setWizardStep(1);
    setIsWizardActive(false);
  }, []);

  const updateWizardData = React.useCallback((updates: Partial<ReportData>) => {
    setWizardData(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = React.useMemo(() => ({
    language, theme, toggleLanguage, toggleTheme, t, reports, loading, authLoading, currentUser, notifications,
    unreadNotificationsCount: notifications.filter(n => !n.read).length,
    signup, login, loginAnonymous, logout, updateUserAvatar, submitReport, confirmReport, updateReportInState,
    markNotificationsAsRead, isOnboardingActive, finishOnboarding, skipOnboarding, toggleReportSubscription, achievementToastId,
    clearAchievementToast, comments, reportHistory, fetchComments, addComment, fetchReportHistory, mapCenter, mapZoom,
    setMapView, mapTargetLocation, flyToLocation, clearMapTarget, activeCategories, toggleCategory, setCategories,
    clearCategories, activeStatuses, toggleStatus, setStatuses, clearStatuses, activeTimeFilter, setTimeFilter: setActiveTimeFilter,
    searchQuery, setSearchQuery,
    wizardData, wizardStep, isWizardActive, startWizard, resetWizard, setWizardStep, updateWizardData,
  }), [
    language, theme, toggleLanguage, toggleTheme, t, reports, loading, authLoading, currentUser, notifications,
    signup, login, loginAnonymous, logout, updateUserAvatar, submitReport, confirmReport, updateReportInState,
    markNotificationsAsRead, isOnboardingActive, finishOnboarding, skipOnboarding, toggleReportSubscription, achievementToastId,
    clearAchievementToast, comments, reportHistory, fetchComments, addComment, fetchReportHistory, mapCenter, mapZoom,
    setMapView, mapTargetLocation, flyToLocation, clearMapTarget, activeCategories, toggleCategory, setCategories,
    clearCategories, activeStatuses, toggleStatus, setStatuses, clearStatuses, activeTimeFilter, setActiveTimeFilter,
    searchQuery, setSearchQuery,
    wizardData, wizardStep, isWizardActive, startWizard, resetWizard, updateWizardData, setWizardStep
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};