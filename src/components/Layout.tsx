import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { AppContext } from '../contexts/AppContext';
import OnboardingTour from './OnboardingTour';
import { PATHS } from '../constants';
import { FaUserSecret, FaXmark } from 'react-icons/fa6';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOnboardingActive, finishOnboarding, skipOnboarding, isImpersonating, exitImpersonation, overrideUser } = React.useContext(AppContext);
  const location = useLocation();

  const isReportFormPage = location.pathname === PATHS.REPORT_FORM;
  const isMapPage = location.pathname === PATHS.HOME || location.pathname === PATHS.MAP;
  
  const handleExitImpersonation = () => {
    // Capture the role BEFORE clearing the state, as overrideUser will be null after exitImpersonation()
    const wasAdminImpersonation = overrideUser?.role !== 'citizen';
    const redirectPath = wasAdminImpersonation ? PATHS.SUPER_ADMIN_ADMIN_ACCOUNTS : PATHS.SUPER_ADMIN_USERS;
    
    // This now sets state and triggers the navigation effect in App.tsx
    exitImpersonation(redirectPath);
  };

  const ImpersonationBanner = () => (
    <div className="fixed bottom-4 right-4 z-[9999] bg-mango text-white p-3 rounded-full shadow-lg flex items-center gap-3 animate-fade-in">
      <FaUserSecret />
      <span className="font-semibold text-sm">Viewing as <strong>{overrideUser?.display_name}</strong></span>
      <button onClick={handleExitImpersonation} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors" aria-label="Exit Impersonation">
        <FaXmark />
      </button>
    </div>
  );

  // For map pages, use a completely fixed, non-scrollable layout.
  if (isMapPage) {
    return (
      <div className="bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark w-full h-full fixed inset-0">
        {isImpersonating && <ImpersonationBanner />}
        {isOnboardingActive && <OnboardingTour onFinish={finishOnboarding} onSkip={skipOnboarding} />}
        <Header />
        <main className="fixed top-16 bottom-20 inset-x-0 z-0">
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }
  
  // Special full-page layout for the Report Wizard to allow for full-screen steps.
  if (isReportFormPage) {
    return (
      <div className="bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark h-screen w-screen overflow-hidden flex flex-col">
        {isImpersonating && <ImpersonationBanner />}
        {isOnboardingActive && <OnboardingTour onFinish={finishOnboarding} onSkip={skipOnboarding} />}
        <main className="flex-grow min-h-0">
          {children}
        </main>
        {/* No bottom nav for report form */}
      </div>
    );
  }

  // Standard layout for all other scrollable pages.
  const mainPaddingTop = 'pt-20'; // 4rem header + 1rem padding
  const mainPaddingBottom = 'pb-24'; // 5rem nav + 1rem padding

  return (
    <div className="min-h-screen bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
      {isImpersonating && <ImpersonationBanner />}
      {isOnboardingActive && <OnboardingTour onFinish={finishOnboarding} onSkip={skipOnboarding} />}
      <Header />
      <main className={`w-full ${mainPaddingTop} ${mainPaddingBottom}`}>
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;