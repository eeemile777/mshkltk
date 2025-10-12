import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS } from '../constants';
import Spinner from './Spinner';

interface LandingGateProps {
  children: React.ReactNode;
}

const LandingGate: React.FC<LandingGateProps> = ({ children }) => {
  const { currentUser, authLoading } = React.useContext(AppContext);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (currentUser) {
    // If user is logged in, redirect them away from the landing page to the main app.
    return <Navigate to={PATHS.HOME} replace />;
  }

  return <>{children}</>;
};

export default LandingGate;
