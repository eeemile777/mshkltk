import React from 'react';
import { Language, Report, User, ReportStatus, ReportHistory, DynamicCategory } from '../types';
import * as api from '../services/api';
import { ICON_MAP } from '../constants';

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
  
  categories: any;
  portalThemeColor: string;
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
  categories: {},
  portalThemeColor: '#00BFA6', // Default teal
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
  const [categories, setCategories] = React.useState<any>({});
  const [portalThemeColor, setPortalThemeColor] = React.useState<string>('#00BFA6');
  
  const [refreshKey, setRefreshKey] = React.useState(0);
  const refreshData = React.useCallback(() => setRefreshKey(k => k + 1), []);

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

  React.useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Role-aware data fetching to avoid 403s on restricted endpoints
          const fetches: Promise<any>[] = [
            api.fetchReports(),
            api.getDynamicCategories(),
          ];

          // Only roles with elevated privileges should request global users/history
          const canViewUsers = currentUser.role === 'super_admin' || currentUser.role === 'union_of_municipalities' || currentUser.role === 'utility';
          const canViewAllHistory = currentUser.role === 'super_admin' || currentUser.role === 'union_of_municipalities' || currentUser.role === 'utility';

          if (canViewUsers) fetches.push(api.listUsers());
          if (canViewAllHistory) fetches.push(api.fetchAllReportHistory());

          const results = await Promise.all(fetches);
          const reportsData = results[0];
          const dynamicCategoriesData = results[1];
          const usersData = canViewUsers ? results[2] : [];
          const historyData = canViewAllHistory ? (canViewUsers ? results[3] : results[2]) : [];
          setAllReports(reportsData);
          setAllUsers(usersData);
          setAllReportHistory(historyData);
          const categoriesObject = dynamicCategoriesData.reduce((acc, cat) => {
              (acc as any)[cat.id] = {
                  icon: ICON_MAP[cat.icon] || ICON_MAP['FaQuestion'],
                  color: { light: cat.color_light, dark: cat.color_dark },
                  name_en: cat.name_en,
                  name_ar: cat.name_ar,
                  subCategories: cat.subCategories.reduce((subAcc, sub) => {
                      (subAcc as any)[sub.id] = { name_en: sub.name_en, name_ar: sub.name_ar };
                      return subAcc;
                  }, {} as any)
              };
              return acc;
          }, {});
          setCategories(categoriesObject);

          // Set theme color based on user role
          if (currentUser.role === 'utility' && currentUser.scoped_categories && currentUser.scoped_categories.length > 0) {
            const firstCategory = currentUser.scoped_categories[0];
            const categoryData = categoriesObject[firstCategory];
            if (categoryData) {
              // Assuming theme is light for simplicity, can be expanded
              setPortalThemeColor(categoryData.color.light);
            }
          } else if (currentUser.role === 'union_of_municipalities') {
            setPortalThemeColor('#4A90E2'); // Set a distinct blue theme for unions
          }
          else {
            setPortalThemeColor('#00BFA6'); // Default for municipalities
          }

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
    const user = await api.loginUser(data);
    await api.setCurrentUser(user, true);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = React.useCallback(async () => { api.logout(); setCurrentUser(null); }, []);

  const updateReportStatus = React.useCallback(async (reportId: string, status: ReportStatus) => {
    if (!currentUser) return;
    const updatedReport = await api.updateReportStatus(reportId, status, undefined, currentUser);
    setAllReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
  }, [currentUser]);

  const resolveReportWithProof = React.useCallback(async (reportId: string, photoUrl: string) => {
    if (!currentUser) return;
    const updatedReport = await api.updateReportStatus(reportId, ReportStatus.Resolved, photoUrl, currentUser);
    setAllReports(prev => prev.map(r => r.id === reportId ? updatedReport : r));
  }, [currentUser]);

  const fetchCommentsForReport = React.useCallback(async (reportId: string) => { setComments(await api.fetchCommentsByReportId(reportId)); }, []);
  const fetchHistoryForReport = React.useCallback(async (reportId: string) => { setReportHistory(await api.fetchHistoryByReportId(reportId)); }, []);
  
  const addCommentForReport = React.useCallback(async (reportId: string, text: string) => {
    if (!currentUser) return;
    const { comment: newComment } = await api.addComment(reportId, text, currentUser);
    setComments(prev => [newComment, ...prev]);
  }, [currentUser]);

  const filteredReports = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'municipality') {
      // Support both slug string and numeric/UUID ids; prefer slug if present
      const userMunicipalitySlug = (currentUser as any).municipality || currentUser.municipality_id;
      const normalizedUserMunicipality = typeof userMunicipalitySlug === 'string' ? userMunicipalitySlug.toLowerCase() : String(userMunicipalitySlug).toLowerCase();
      const primary = allReports.filter(report => (report.municipality || '').toLowerCase() === normalizedUserMunicipality);
      if (primary.length > 0) return primary;
      // Fallback: try to match by address text containing municipality name
      return allReports.filter(report => (report.area || report.address || '').toLowerCase().includes(normalizedUserMunicipality));
    }
    if (currentUser.role === 'union_of_municipalities') {
        const { scoped_municipalities = [] } = currentUser;
        return allReports.filter(report => scoped_municipalities.includes(report.municipality));
    }
    if (currentUser.role === 'utility') {
      const { scoped_municipalities = [], scoped_categories = [], scoped_sub_categories = [] } = currentUser;
      
      // Prioritize sub-category filtering if available
      if (scoped_sub_categories.length > 0) {
        return allReports.filter(report => 
          scoped_municipalities.includes(report.municipality) &&
          report.sub_category && // Ensure sub_category exists on the report
          scoped_sub_categories.includes(report.sub_category)
        );
      }
      
      // Fallback to parent category for backward compatibility
      return allReports.filter(report => 
        scoped_municipalities.includes(report.municipality) &&
        scoped_categories.includes(report.category)
      );
    }
    return [];
  }, [currentUser, allReports]);

  const value = React.useMemo(() => ({
    currentUser, authLoading, login, logout,
    reports: filteredReports, users: allUsers, comments, reportHistory, allReportHistory,
    loading, refreshData, updateReportStatus, resolveReportWithProof,
    fetchCommentsForReport, fetchHistoryForReport, addCommentForReport,
    categories, portalThemeColor,
  }), [
      currentUser, authLoading, login, logout, filteredReports, allUsers, comments, reportHistory, allReportHistory,
      loading, refreshData, updateReportStatus, resolveReportWithProof,
      fetchCommentsForReport, fetchHistoryForReport, addCommentForReport,
      categories, portalThemeColor
  ]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}