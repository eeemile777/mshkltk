import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import InteractiveMap from '../../components/InteractiveMap';
import Spinner from '../../components/Spinner';

const SuperAdminMapPage: React.FC = () => {
  const { allReports, loading } = React.useContext(SuperAdminContext);

  if (loading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Spinner />
        </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg -m-6">
      <InteractiveMap
        reports={allReports}
        reportPathPrefix="/superadmin/reports/:id"
        hideUserLocationMarker={true}
      />
    </div>
  );
};

export default SuperAdminMapPage;
