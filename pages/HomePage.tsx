import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AppContext } from '../contexts/AppContext';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { PATHS, TILE_URL_LIGHT, TILE_URL_DARK, TILE_ATTRIBUTION } from '../constants';
import Spinner from '../components/Spinner';
import { Report, Theme } from '../types';
import { createCategoryIcon } from '../utils/mapIcons';

const ChangeView: React.FC<{ center: L.LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    if(map && center && center[0] !== null && center[1] !== null) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const HomePage: React.FC = () => {
  const { reports, loading, t, theme } = React.useContext(AppContext);
  const center: L.LatLngExpression = [33.8938, 35.5018]; // Default to Beirut
  
  const tileUrl = theme === Theme.DARK ? TILE_URL_DARK : TILE_URL_LIGHT;

  return (
    <div className="fixed inset-x-0 top-16 bottom-20 z-0">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} zoomSnap={0.25} zoomDelta={0.25}>
          <ChangeView center={center} zoom={13} />
          <TileLayer
            attribution={TILE_ATTRIBUTION}
            url={tileUrl}
          />
          {reports.map(report => (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={createCategoryIcon(report.category, theme)}
            >
              <Popup>
                <div className="w-48">
                  <img src={report.photo_urls[0]} alt={report.note} className="w-full h-24 object-cover rounded-md mb-2" />
                  <h3 className="font-bold text-md mb-1">{t[report.category]}</h3>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2 truncate">{report.note}</p>
                  <Link 
                    to={PATHS.REPORT_DETAILS.replace(':id', report.id)} 
                    className="block text-center w-full bg-teal text-white py-1 px-2 rounded-full hover:bg-opacity-80 transition-colors text-sm"
                  >
                    {t.viewFullReport}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default HomePage;