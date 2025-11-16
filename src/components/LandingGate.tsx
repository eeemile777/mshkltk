import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS } from '../constants';
import Spinner from './Spinner';

interface LandingGateProps {
  children: React.ReactNode;
}

const LandingGate: React.FC<LandingGateProps> = ({ children }) => {
  const { currentUser, authLoading } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  // Use useEffect to handle navigation instead of rendering Navigate conditionally
  React.useEffect(() => {
    if (!authLoading && currentUser) {
      setShouldRedirect(true);
      navigate(PATHS.HOME, { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  // Always render in the same order regardless of auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (shouldRedirect || currentUser) {
    // Show loading while redirecting
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default LandingGate;
