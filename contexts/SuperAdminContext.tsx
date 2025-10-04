import * as React from 'react';
import { User, Report, Comment, ReportHistory } from '../types';
import * as api from '../services/mockApi';

interface SuperAdminContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (data: Pick<User, 'username'> & {password: string}) => Promise<User>;
  logout: () => Promise<void>;

  allReports: Report[];
  allUsers: User[];
  comments: (Comment & { user: User })[];
  reportHistory: ReportHistory[];
  
  loading: boolean;
  refreshData: () => void;
  
  deleteReport: (reportId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User> & { newPassword?: string }) => Promise<void>;
  createMunicipalityUser: (municipalityId: string) => Promise<void>;

  fetchCommentsForReport: (reportId: string) => Promise<void>;
  fetchHistoryForReport: (reportId: string) => Promise<void>;
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
  
  const [refreshKey, setRefreshKey] = React.useState(0);
  const refreshData = React.useCallback(() => setRefreshKey(k => k + 1), []);

  // Fetch current super admin user session
  React.useEffect(() => {
    const checkSession = async () => {
      try {
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
          const [reportsData, usersData] = await Promise.all([
            api.fetchReports(),
            api.listUsers(),
          ]);
          setAllReports(reportsData);
          setAllUsers(usersData);
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
    const user = await api.loginUser(data, false, true); // isPortal=false, isSuperAdmin=true
    await api.setCurrentUser(user, false, true);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = React.useCallback(async () => {
    await api.logout(false, true); // isPortal=false, isSuperAdmin=true
    setCurrentUser(null);
  }, []);

  const deleteReport = React.useCallback(async (reportId: string) => {
    await api.deleteReportAndAssociatedData(reportId);
    setAllReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  const updateUser = React.useCallback(async (userId: string, updates: Partial<User> & { newPassword?: string }) => {
    const updatedUser = await api.updateUser(userId, updates);
    setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
  }, []);
  
  const createMunicipalityUser = React.useCallback(async (municipalityId: string) => {
    const newUser = await api.createMunicipalityUser(municipalityId);
    setAllUsers(prev => [...prev, newUser]);
  }, []);
  
  const fetchCommentsForReport = React.useCallback(async (reportId: string) => {
    const data = await api.fetchCommentsByReportId(reportId);
    setComments(data);
  }, []);

  const fetchHistoryForReport = React.useCallback(async (reportId: string) => {
      const data = await api.fetchHistoryByReportId(reportId);
      setReportHistory(data);
  }, []);

  const value = React.useMemo(() => ({
    currentUser,
    authLoading,
    login,
    logout,
    allReports,
    allUsers,
    comments,
    reportHistory,
    loading,
    refreshData,
    deleteReport,
    updateUser,
    createMunicipalityUser,
    fetchCommentsForReport,
    fetchHistoryForReport,
  }), [
      currentUser, authLoading, login, logout, allReports, allUsers, comments, reportHistory,
      loading, refreshData, deleteReport, updateUser, createMunicipalityUser,
      fetchCommentsForReport, fetchHistoryForReport
  ]);

  return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};
