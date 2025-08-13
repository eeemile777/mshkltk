import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS } from '../constants';
import Spinner from './Spinner';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { currentUser, authLoading } = React.useContext(AppContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to={PATHS.AUTH_LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGate;
