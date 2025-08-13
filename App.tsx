import * as React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider, AppContext } from './contexts/AppContext';

import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import AuthGate from './components/AuthGate';
import Spinner from './components/Spinner';

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


import { PATHS, BADGES } from './constants';
import L from 'leaflet';

// Fix for default icon path issue with bundlers.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NewBadgeModal: React.FC = () => {
    const { newlyEarnedBadge, clearNewBadge, t, language } = React.useContext(AppContext);

    if (!newlyEarnedBadge) return null;

    const badge = BADGES[newlyEarnedBadge.id];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={clearNewBadge}>
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-8 text-center flex flex-col items-center max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <div className="text-7xl mb-4">{badge.icon}</div>
                <h2 className="text-2xl font-bold text-mango dark:text-mango-dark">{t.achievements}</h2>
                <p className="text-lg font-bold text-navy dark:text-text-primary-dark mt-2">{language === 'ar' ? badge.name_ar : badge.name_en}</p>
                <p className="text-text-secondary dark:text-text-secondary-dark mt-1">{language === 'ar' ? badge.description_ar : badge.description_en}</p>
                <button onClick={clearNewBadge} className="mt-6 bg-teal text-white font-bold py-2 px-6 rounded-full">
                    رائع!
                </button>
            </div>
        </div>
    );
};

// Main application routes that require authentication
const AppRoutes = () => (
    <Layout>
        <NewBadgeModal />
        <Outlet /> 
    </Layout>
);

// Auth routes with their own layout
const AuthRoutes = () => (
    <AuthLayout>
        <Outlet />
    </AuthLayout>
);


const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
            {/* --- Protected Routes --- */}
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
                <Route path={PATHS.ACHIEVEMENTS} element={<AchievementsPage />} />
                <Route path={PATHS.PROFILE} element={<ProfilePage />} />
                <Route path={PATHS.ABOUT} element={<AboutPage />} />
            </Route>
            
            {/* --- Auth Routes --- */}
            <Route element={<AuthRoutes />}>
                <Route path={PATHS.AUTH_LOGIN} element={<LoginPage />} />
                <Route path={PATHS.AUTH_SIGNUP} element={<SignupPage />} />
            </Route>

            {/* --- Handler Routes (no layout) --- */}
            <Route path={PATHS.AUTH_ANONYMOUS} element={<AnonymousRedirect />} />
            <Route path={PATHS.LOGOUT} element={<Logout />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;