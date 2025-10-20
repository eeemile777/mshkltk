import * as React from 'react';
import { Language, Report, User, ReportStatus, ReportCategory, ReportHistory, DynamicCategory, DynamicBadge, GamificationSettings, AuditLog } from '../types';
import * as api from '../services/api';
import { dbService } from '../services/db';

interface SuperAdminContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (data: Pick<User, 'username'> & {password: string}) => Promise<User>;
  logout: () => Promise<void>;

  allReports: Report[];
  allUsers: User[];
  comments: (Comment & { user: User })[];
  reportHistory: ReportHistory[];
  allReportHistory: ReportHistory[];
  auditLogs: AuditLog[];
  
  loading: boolean;
  refreshData: () => void;
  
  addReport: (report: Report) => void;
  updateReport: (reportId: string, updates: Partial<Report>) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User> & { newPassword?: string; pointAdjustment?: number }) => Promise<void>;
  createAdminUser: (data: Partial<User> & { password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  fetchCommentsForReport: (reportId: string) => Promise<void>;
  fetchHistoryForReport: (reportId: string) => Promise<void>;

  categories: DynamicCategory[];
  updateCategory: (category: DynamicCategory) => Promise<void>;
  addCategory: (category: Omit<DynamicCategory, 'id'>) => Promise<void>;
  deleteCategory: (category: DynamicCategory) => Promise<void>;

  gamificationSettings: GamificationSettings | null;
  updateGamificationSettings: (settings: GamificationSettings) => Promise<void>;
  badges: DynamicBadge[];
  addBadge: (badge: Omit<DynamicBadge, 'id'>) => Promise<void>;
  updateBadge: (badge: DynamicBadge) => Promise<void>;
  deleteBadge: (badge: DynamicBadge) => Promise<void>;
}

const defaultContextValue: any = {};

export const SuperAdminContext = React.createContext<SuperAdminContextType>(defaultContextValue);

export const SuperAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  
  const [allReports, setAllReports] = React.useState<Report[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [comments, setComments] = React.useState<(Comment & { user: User })[]>([]);
  const [reportHistory, setReportHistory] = React.useState<ReportHistory[]>([]);
  const [allReportHistory, setAllReportHistory] = React.useState<ReportHistory[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  const [categories, setCategories] = React.useState<DynamicCategory[]>([]);
  const [badges, setBadges] = React.useState<DynamicBadge[]>([]);
  const [gamificationSettings, setGamificationSettings] = React.useState<GamificationSettings | null>(null);
  
  const [refreshKey, setRefreshKey] = React.useState(0);
  const refreshData = React.useCallback(() => setRefreshKey(k => k + 1), []);

  // Fetch current super admin user session
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        await dbService.init(); // Make sure DB is ready
        const user = await api.getCurrentSuperAdminUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to get super admin user session", error);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fetch all data once a user is authenticated or on manual refresh
  React.useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [reportsData, usersData, categoriesData, badgesData, gamificationData, auditLogsData, allHistoryData] = await Promise.all([
            api.fetchReports(),
            api.listUsers(),
            dbService.getAll<DynamicCategory>('dynamic_categories'),
            dbService.getAll<DynamicBadge>('dynamic_badges'),
            dbService.get<GamificationSettings>('gamification_settings', 'default'),
            api.fetchAuditLogs(),
            api.fetchAllReportHistory(),
          ]);
          setAllReports(reportsData);
          setAllUsers(usersData);
          setCategories(categoriesData.sort((a, b) => a.name_en.localeCompare(b.name_en)));
          setBadges(badgesData.sort((a, b) => a.name_en.localeCompare(b.name_en)));
          setGamificationSettings(gamificationData || null);
          setAuditLogs(auditLogsData);
          setAllReportHistory(allHistoryData);
        } catch (error) {
          console.error("Failed to fetch super admin data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser, refreshKey]);

  const login = React.useCallback(async (data: Pick<User, 'username'> & {password: string}) => {
    const user = await api.loginUser(data);
    await api.setCurrentUser(user);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = React.useCallback(async () => {
    api.logout();
    setCurrentUser(null);
  }, []);

  const addReport = React.useCallback((report: Report) => {
      setAllReports(prev => [report, ...prev]);
  }, []);

  const updateReport = React.useCallback(async (reportId: string, updates: Partial<Report>) => {
      if (!currentUser) return;
      const updatedReport = await api.updateReport(reportId, updates);
      setAllReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
  }, [currentUser]);

  const deleteReport = React.useCallback(async (reportId: string) => {
    if (!currentUser) return;
    await api.deleteReportAndAssociatedData(reportId, currentUser);
    setAllReports(prev => prev.filter(r => r.id !== reportId));
    refreshData();
  }, [currentUser, refreshData]);

  const deleteComment = React.useCallback(async (commentId: string) => {
      if (!currentUser) return;
      await api.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      refreshData();
  }, [currentUser, refreshData]);

  const updateUser = React.useCallback(async (userId: string, updates: Partial<User> & { newPassword?: string, pointAdjustment?: number }) => {
    if (!currentUser) return;
    const updatedUser = await api.updateUser(userId, updates, currentUser);
    setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    refreshData();
  }, [currentUser, refreshData]);
  
  const createAdminUser = React.useCallback(async (data: any) => {
    if (!currentUser) return;
    const newUser = await api.createAdminUser(data, currentUser);
    setAllUsers(prev => [...prev, newUser]);
    refreshData();
  }, [currentUser, refreshData]);

  const deleteUser = React.useCallback(async (userId: string) => {
    if (!currentUser) return;
    await api.deleteUser(userId);
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    refreshData();
  }, [currentUser, refreshData]);
  
  const fetchCommentsForReport = React.useCallback(async (reportId: string) => {
    const data = await api.fetchCommentsByReportId(reportId);
    setComments(data);
  }, []);

  const fetchHistoryForReport = React.useCallback(async (reportId: string) => {
      const data = await api.fetchHistoryByReportId(reportId);
      setReportHistory(data);
  }, []);

  const updateCategory = React.useCallback(async (category: DynamicCategory) => {
    if (!currentUser) return;
    const processedCategory: DynamicCategory = {
        ...category,
        subCategories: category.subCategories.map((sub, i) => ({
            id: (sub.id && !String(sub.id).startsWith('new-')) ? sub.id : `${category.id}_sub_${Date.now()}_${i}`,
            name_en: sub.name_en,
            name_ar: sub.name_ar
        }))
    };
    await api.updateDynamicCategory(processedCategory, currentUser);
    setCategories(prev => prev.map(c => c.id === category.id ? processedCategory : c).sort((a, b) => a.name_en.localeCompare(b.name_en)));
    refreshData();
  }, [currentUser, refreshData]);

  const addCategory = React.useCallback(async (category: Omit<DynamicCategory, 'id'>) => {
    if (!currentUser) return;
    const newId = category.name_en.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    const newCategory: DynamicCategory = { 
        ...category, 
        id: newId as ReportCategory,
        subCategories: category.subCategories.map((sc, i) => ({
            id: `${newId}_sub_${Date.now()}_${i}`,
            name_en: sc.name_en,
            name_ar: sc.name_ar,
        }))
    };
    await api.addDynamicCategory(newCategory, currentUser);
    setCategories(prev => [...prev, newCategory].sort((a,b) => a.name_en.localeCompare(b.name_en)));
    refreshData();
  }, [currentUser, refreshData]);

  const deleteCategory = React.useCallback(async (category: DynamicCategory) => {
    if (!currentUser) return;
    await api.deleteDynamicCategory(category.id, category.name_en, currentUser);
    setCategories(prev => prev.filter(c => c.id !== category.id));
    refreshData();
  }, [currentUser, refreshData]);
  
  const updateGamificationSettings = React.useCallback(async (settings: GamificationSettings) => {
    if (!currentUser) return;
    await api.updateGamificationSettings(settings, currentUser);
    setGamificationSettings(settings);
    refreshData();
  }, [currentUser, refreshData]);

  const updateBadge = React.useCallback(async (badge: DynamicBadge) => {
    if (!currentUser) return;
    await api.updateDynamicBadge(badge, currentUser);
    setBadges(prev => prev.map(b => b.id === badge.id ? badge : b).sort((a,b) => a.name_en.localeCompare(b.name_en)));
    refreshData();
  }, [currentUser, refreshData]);

  const addBadge = React.useCallback(async (badge: Omit<DynamicBadge, 'id'>) => {
    if (!currentUser) return;
    const newBadge: DynamicBadge = { ...badge, id: badge.name_en.toLowerCase().replace(/\s+/g, '_') };
    await api.addDynamicBadge(newBadge, currentUser);
    setBadges(prev => [...prev, newBadge].sort((a,b) => a.name_en.localeCompare(b.name_en)));
    refreshData();
  }, [currentUser, refreshData]);

  const deleteBadge = React.useCallback(async (badge: DynamicBadge) => {
    if (!currentUser) return;
    await api.deleteDynamicBadge(badge.id, badge.name_en, currentUser);
    setBadges(prev => prev.filter(b => b.id !== badge.id));
    refreshData();
  }, [currentUser, refreshData]);

  const value = React.useMemo(() => ({
    currentUser,
    authLoading,
    login,
    logout,
    allReports,
    allUsers,
    comments,
    reportHistory,
    allReportHistory,
    auditLogs,
    loading,
    refreshData,
    addReport,
    updateReport,
    deleteReport,
    deleteComment,
    updateUser,
    createAdminUser,
    deleteUser,
    fetchCommentsForReport,
    fetchHistoryForReport,
    categories,
    updateCategory,
    addCategory,
    deleteCategory,
    gamificationSettings,
    updateGamificationSettings,
    badges,
    addBadge,
    updateBadge,
    deleteBadge,
  }), [
      currentUser, authLoading, login, logout, allReports, allUsers, comments, reportHistory, allReportHistory, auditLogs,
      loading, refreshData, addReport, updateReport, deleteReport, deleteComment, updateUser, createAdminUser, deleteUser,
      fetchCommentsForReport, fetchHistoryForReport,
      categories, updateCategory, addCategory, deleteCategory,
      gamificationSettings, updateGamificationSettings,
      badges, addBadge, updateBadge, deleteBadge
  ]);

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};
