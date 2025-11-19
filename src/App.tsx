import React from 'react';
import { HashRouter, MemoryRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './contexts/AppContext';
import { PortalProvider } from './contexts/PortalContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';

import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import AuthGate from './components/AuthGate';
import LandingGate from './components/LandingGate';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import TrendingPage from './pages/TrendingPage';
import ReportFormPage from './pages/ReportFormPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AnonymousRedirect from './pages/auth/AnonymousRedirect';
import Logout from './pages/auth/Logout';
import AchievementToast from './components/AchievementToast';

// Portal Imports
import PortalLayout from './components/portal/PortalLayout';
import PortalAuthGate from './components/portal/PortalAuthGate';
import PortalLoginPage from './pages/portal/PortalLoginPage';
import PortalDashboardPage from './pages/portal/PortalDashboardPage';
import PortalReportsListPage from './pages/portal/PortalReportsListPage';
import PortalMapPage from './pages/portal/PortalMapPage';
import PortalReportDetailsPage from './pages/portal/PortalReportDetailsPage';

// Super Admin Imports
import SuperAdminLayout from './components/superadmin/SuperAdminLayout';
import SuperAdminAuthGate from './components/superadmin/SuperAdminAuthGate';
import SuperAdminLoginPage from './pages/superadmin/SuperAdminLoginPage';
import SuperAdminDashboardPage from './pages/superadmin/SuperAdminDashboardPage';
import SuperAdminReportsPage from './pages/superadmin/SuperAdminReportsPage';
import SuperAdminReportDetailsPage from './pages/superadmin/SuperAdminReportDetailsPage';
import SuperAdminUsersPage from './pages/superadmin/SuperAdminUsersPage';
import SuperAdminAdminAccountsPage from './pages/superadmin/SuperAdminAdminAccountsPage';
import SuperAdminMapPage from './pages/superadmin/SuperAdminMapPage';
import SuperAdminCategoriesPage from './pages/superadmin/SuperAdminCategoriesPage';
import SuperAdminGamificationPage from './pages/superadmin/SuperAdminGamificationPage';
import SuperAdminReportCreator from './components/superadmin/SuperAdminReportCreator';
import SuperAdminAuditTrailPage from './pages/superadmin/SuperAdminAuditTrailPage';

import { PATHS } from './constants';

const IN_IFRAME = (() => { try { return window.self !== window.top; } catch { return true; } })();
const Router = IN_IFRAME ? MemoryRouter : HashRouter;

const ImpersonationRedirectHandler = () => {
    const { impersonationRedirectPath, clearImpersonationRedirect } = React.useContext(AppContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (impersonationRedirectPath) {
            const path = impersonationRedirectPath;
            // Clear the path from state immediately to prevent re-triggering on subsequent re-renders.
            clearImpersonationRedirect();
            navigate(path, { replace: true });
        }
    }, [impersonationRedirectPath, clearImpersonationRedirect, navigate]);

    return null; // This component renders nothing to the DOM.
};

const AppRoutes = () => {
    const { achievementToastId, clearAchievementToast } = React.useContext(AppContext);
    return (
        <Layout>
            {achievementToastId && <AchievementToast badgeId={achievementToastId} onClose={clearAchievementToast} />}
            <Outlet /> 
        </Layout>
    );
};

const AuthRoutes = () => (
    <AuthLayout>
        <Outlet />
    </AuthLayout>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppProvider>
          <ImpersonationRedirectHandler />
          <Routes>
            {/* --- Public Landing Page --- */}
            <Route 
              path="/" 
              element={
                <LandingGate>
                  <LandingPage />
                </LandingGate>
              } 
            />


            {/* --- Portal Routes --- */}
            <Route path="/portal" element={<PortalProvider><Outlet /></PortalProvider>}>
                <Route index element={<Navigate to="/portal/dashboard" replace />} />
                <Route path="login" element={<PortalLoginPage />} />
                <Route 
                    element={
                        <PortalAuthGate>
                            <PortalLayout>
                                <Outlet />
                            </PortalLayout>
                        </PortalAuthGate>
                    }
                >
                    <Route path="dashboard" element={<PortalDashboardPage />} />
                    <Route path="reports" element={<PortalReportsListPage />} />
                    <Route path="reports/:id" element={<PortalReportDetailsPage />} />
                    <Route path="map" element={<PortalMapPage />} />
                </Route>
            </Route>

            {/* --- Super Admin Routes --- */}
            <Route path="/superadmin" element={<SuperAdminProvider><Outlet /></SuperAdminProvider>}>
                <Route index element={<Navigate to={PATHS.SUPER_ADMIN_DASHBOARD} replace />} />
                <Route path="login" element={<SuperAdminLoginPage />} />
                 <Route 
                    element={
                        <SuperAdminAuthGate>
                            <SuperAdminLayout>
                                <Outlet />
                            </SuperAdminLayout>
                        </SuperAdminAuthGate>
                    }
                >
                    <Route path="dashboard" element={<SuperAdminDashboardPage />} />
                    <Route path="map" element={<SuperAdminMapPage />} />
                    <Route path="reports" element={<SuperAdminReportsPage />} />
                    <Route path="reports/:id" element={<SuperAdminReportDetailsPage />} />
                    <Route path="users" element={<SuperAdminUsersPage />} />
                    <Route path="admin-accounts" element={<SuperAdminAdminAccountsPage />} />
                    <Route path={PATHS.SUPER_ADMIN_CATEGORIES.replace('/superadmin/', '')} element={<SuperAdminCategoriesPage />} />
                    <Route path={PATHS.SUPER_ADMIN_GAMIFICATION.replace('/superadmin/', '')} element={<SuperAdminGamificationPage />} />
                    <Route path="report/new" element={<SuperAdminReportCreator />} />
                    <Route path="audit-trail" element={<SuperAdminAuditTrailPage />} />
                </Route>
            </Route>

            {/* --- Protected Citizen Routes --- */}
            <Route 
                element={
                    <AuthGate>
                        <AppRoutes />
                    </AuthGate>
                }
            >
                <Route path={PATHS.HOME} element={<HomePage />} />
                <Route path={PATHS.MAP} element={<MapPage />} />
                <Route path={PATHS.TRENDING} element={<TrendingPage />} />
                <Route path={PATHS.REPORT_FORM} element={<ReportFormPage />} />
                <Route path={PATHS.REPORT_DETAILS} element={<ReportDetailsPage />} />
                <Route path={PATHS.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={PATHS.COMMUNITY} element={<AchievementsPage />} />
                <Route path={PATHS.PROFILE} element={<ProfilePage />} />
                <Route path={PATHS.ABOUT} element={<AboutPage />} />
            </Route>
            
            {/* --- Citizen Auth Routes --- */}
            <Route element={<AuthRoutes />}>
                <Route path={PATHS.AUTH_LOGIN} element={<LoginPage />} />
                <Route path={PATHS.AUTH_SIGNUP} element={<SignupPage />} />
            </Route>

            {/* --- Handler Routes (no layout) --- */}
            <Route path={PATHS.AUTH_ANONYMOUS} element={<AnonymousRedirect />} />
            <Route path={PATHS.LOGOUT} element={<Logout />} />
        </Routes>
      </AppProvider>
    </Router>
    </ErrorBoundary>
  );
};

export default App;