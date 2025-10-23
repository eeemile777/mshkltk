import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PortalContext } from '../../contexts/PortalContext';
import Spinner from '../Spinner';

interface PortalAuthGateProps {
  children: React.ReactNode;
}

const PortalAuthGate: React.FC<PortalAuthGateProps> = ({ children }) => {
  const { currentUser, authLoading } = React.useContext(PortalContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PortalAuthGate;