import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import InteractiveMap from '../components/InteractiveMap';

const MapPage: React.FC = () => {
  const { reports } = React.useContext(AppContext);

  return (
    <div className="absolute inset-0 z-0">
      <InteractiveMap reports={reports} />
    </div>
  );
};

export default MapPage;