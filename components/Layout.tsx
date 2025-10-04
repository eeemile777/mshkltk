import * as React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { AppContext } from '../contexts/AppContext';
import OnboardingTour from './OnboardingTour';
import { PATHS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOnboardingActive, finishOnboarding, skipOnboarding } = React.useContext(AppContext);
  const location = useLocation();

  const isReportFormPage = location.pathname === PATHS.REPORT_FORM;
  const isMapPage = location.pathname === PATHS.HOME || location.pathname === PATHS.MAP;

  // For map pages, use a completely fixed, non-scrollable layout.
  if (isMapPage) {
    return (
      <div className="bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark w-full h-full fixed inset-0">
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