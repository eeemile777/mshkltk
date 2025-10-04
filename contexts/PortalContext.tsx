import * as React from 'react';
import { User, Report, ReportStatus, Comment, ReportHistory } from '../types';
import * as api from '../services/mockApi';

interface PortalContextType {
  currentUser: User | null;
  authLoading: boolean;
  login: (data: Pick<User, 'username'> & {password: string}) => Promise<User>;
  logout: () => Promise<void>;

  reports: Report[];
  users: User[];
  comments: (Comment & { user: User })[];
  reportHistory: ReportHistory[];
  allReportHistory: ReportHistory[];
  
  loading: boolean;
  refreshData: () => void;
  
  updateReportStatus: (reportId: string, status: ReportStatus) => Promise<void>;
  resolveReportWithProof: (reportId: string, photoUrl: string) => Promise<void>;
  fetchCommentsForReport: (reportId: string) => Promise<void>;
  fetchHistoryForReport: (reportId: string) => Promise<void>;
  addCommentForReport: (reportId: string, text: string) => Promise<void>;
}

const defaultContextValue: any = {
  currentUser: null,
  authLoading: true,
  login: async () => {},
  logout: async () => {},
  reports: [],
  users: [],
  comments: [],
  reportHistory: [],
  allReportHistory: [],
  loading: true,
  refreshData: () => {},
  updateReportStatus: async () => {},
  resolveReportWithProof: async () => {},
  fetchCommentsForReport: async () => {},
  fetchHistoryForReport: async () => {},
  addCommentForReport: async () => {},
};

export const PortalContext = React.createContext<PortalContextType>(defaultContextValue);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  
  const [allReports, setAllReports] = React.useState<Report[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [allReportHistory, setAllReportHistory] = React.useState<ReportHistory[]>([]);
  
  const [comments, setComments] = React.useState<(Comment & { user: User })[]>([]);
  const [reportHistory, setReportHistory] = React.useState<ReportHistory[]>([]);
  
  const [refreshKey, setRefreshKey] = React.useState(0);
  const refreshData = React.useCallback(() => setRefreshKey(k => k + 1), []);

  // Fetch current portal user session
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await api.getCurrentPortalUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to get portal user session", error);
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
          const [reportsData, usersData, historyData] = await Promise.all([
            api.fetchReports(),
            api.listUsers(),
            api.fetchAllReportHistory(),
          ]);
          setAllReports(reportsData);
          setAllUsers(usersData);
          setAllReportHistory(historyData);
        } catch (error) {
          console.error("Failed to fetch portal data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [currentUser, refreshKey]);

  const login = React.useCallback(async (data: Pick<User, 'username'> & {password: string}) => {
    try {
        const user = await api.loginUser(data, true); // true for portal
        await api.setCurrentUser(user, true);
        setCurrentUser(user);
        return user;
    } catch (error) {
        throw error; // Re-throw to be caught by the login page
    }
  }, []);

  const logout = React.useCallback(async () => {
    await api.logout(true); // true for portal logout
    setCurrentUser(null);
  }, []);

  const updateReportStatus = React.useCallback(async (reportId: string, status: ReportStatus) => {
    try {
      const updatedReport = await api.updateReportStatus(reportId, status);
      setAllReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
    } catch (error) {
      console.error(`Failed to update status for report ${reportId}`, error);
    }
  }, []);

  const resolveReportWithProof = React.useCallback(async (reportId: string, photoUrl: string) => {
    try {
        const updatedReport = await api.updateReportStatus(reportId, ReportStatus.Resolved, photoUrl);
        setAllReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
    } catch (error) {
        console.error(`Failed to resolve report ${reportId} with proof`, error);
    }
  }, []);

  const fetchCommentsForReport = React.useCallback(async (reportId: string) => {
      const data = await api.fetchCommentsByReportId(reportId);
      setComments(data);
  }, []);
  
  const fetchHistoryForReport = React.useCallback(async (reportId: string) => {
      const data = await api.fetchHistoryByReportId(reportId);
      setReportHistory(data);
  }, []);
  
  const addCommentForReport = React.useCallback(async (reportId: string, text: string) => {
    if (!currentUser) return;
    const { comment: newComment } = await api.addComment(reportId, currentUser.id, text);
    setComments(prev => [newComment, ...prev]);
  }, [currentUser]);


  // Filter reports based on the current municipality admin's ID.
  const filteredReports = React.useMemo(() => {
    if (!currentUser || currentUser.role !== 'municipality' || !currentUser.municipality_id) {
        return [];
    }
    
    const municipalityId = currentUser.municipality_id;
    return allReports.filter(report => report.municipality === municipalityId);

  }, [currentUser, allReports]);

  const value = React.useMemo(() => ({
    currentUser,
    authLoading,
    login,
    logout,
    reports: filteredReports,
    users: allUsers,
    comments,
    reportHistory,
    allReportHistory,
    loading,
    refreshData,
    updateReportStatus,
    resolveReportWithProof,
    fetchCommentsForReport,
    fetchHistoryForReport,
    addCommentForReport,
  }), [
      currentUser, authLoading, login, logout, filteredReports, allUsers, comments, reportHistory, allReportHistory,
      loading, refreshData, updateReportStatus, resolveReportWithProof,
      fetchCommentsForReport, fetchHistoryForReport, addCommentForReport
  ]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
};