import React from 'react';
import InteractiveMap from '../components/InteractiveMap';
import ErrorBoundary from '../components/ErrorBoundary';
import { AppContext } from '../contexts/AppContext';

const HomePage: React.FC = () => {
  const { reports } = React.useContext(AppContext);

  return (
    <div className="h-screen">
      <ErrorBoundary fallback={
        <div className="h-full flex items-center justify-center bg-muted dark:bg-bg-dark">
          <div className="text-center p-8">
            <p className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">
              Map Loading Error
            </p>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
              Please refresh the page (Cmd+Shift+R)
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal-dark transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }>
        <InteractiveMap reports={reports} />
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;