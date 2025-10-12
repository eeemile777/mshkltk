import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import Spinner from '../Spinner';

interface SuperAdminAuthGateProps {
  children: React.ReactNode;
}

const SuperAdminAuthGate: React.FC<SuperAdminAuthGateProps> = ({ children }) => {
  const { currentUser, authLoading } = React.useContext(SuperAdminContext);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-dark">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default SuperAdminAuthGate;
