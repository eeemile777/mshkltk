import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import L from 'leaflet';
import { AppContext } from '../contexts/AppContext';
import { Report, ReportCategory, Theme } from '../types';
import { fetchReportById } from '../services/mockApi';
import Spinner from '../components/Spinner';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { CATEGORY_ICONS, STATUS_COLORS, PATHS, TILE_URL_DARK, TILE_URL_LIGHT, TILE_ATTRIBUTION } from '../constants';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { createCategoryIcon } from '../utils/mapIcons';

const StatusPill: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const { t, theme } = React.useContext(AppContext);
  const colorClasses = theme === 'dark' ? STATUS_COLORS[status].dark : STATUS_COLORS[status].light;
  return (
    <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${colorClasses}`}>
      {t[status]}
    </span>
  );
};

const ImageCarousel: React.FC<{ urls: string[], note: string }> = ({ urls, note }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const next = () => setCurrentIndex(i => (i + 1) % urls.length);
    const prev = () => setCurrentIndex(i => (i - 1 + urls.length) % urls.length);

    return (
        <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
            {urls.map((url, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={url} alt={`${note} ${index+1}`} className="w-full h-full object-cover" />
                </div>
            ))}
            {urls.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"><FaChevronLeft/></button>
                    <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"><FaChevronRight/></button>
                </>
            )}
        </div>
    )
}

const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const { t, language, theme, confirmReport } = React.useContext(AppContext);

  React.useEffect(() => {
    if (!id) return;
    const getReport = async () => {
      try {
        setLoading(true);
        const data = await fetchReportById(id);
        if (data) {
          setReport(data);
        } else {
          setError('Report not found');
        }
      } catch (err) {
        setError('Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    getReport();
  }, [id]);

  const handleConfirm = async () => {
    if (report) {
      await confirmReport(report.id);
      // The context will update the state, but for immediate feedback:
      setReport(prev => prev ? {...prev, confirmations_count: prev.confirmations_count + 1} : null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-coral dark:text-coral-dark py-10">{error}</div>;
  if (!report) return <div className="text-center text-text-secondary dark:text-text-secondary-dark py-10">Report not found.</div>;

  const CategoryIcon = CATEGORY_ICONS[report.category];
  const tileUrl = theme === Theme.DARK ? TILE_URL_DARK : TILE_URL_LIGHT;
  const backButtonDirection = language === 'ar' ? <FaArrowRight /> : <FaArrowLeft />;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={PATHS.HOME} className="inline-flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-cyan-dark mb-4">
        {backButtonDirection}
        <span>{t.navHome}</span>
      </Link>
      <div className="bg-card dark:bg-surface-dark p-4 sm:p-6 rounded-2xl shadow-md">
        <ImageCarousel urls={report.photo_urls} note={report.note} />
        
        <div className="mt-6">
          <div className="flex justify-between items-start gap-4">
              <span className="flex items-center gap-3 text-lg font-bold text-navy dark:text-text-primary-dark">
                  <CategoryIcon className="w-6 h-6 text-teal dark:text-teal-dark"/>
                  {t[report.category]}
              </span>
              <StatusPill status={report.status} />
          </div>

          <p className="mt-4 text-text-primary dark:text-text-primary-dark text-base leading-relaxed">{report.note}</p>

          <div className="border-t border-border-light dark:border-border-dark my-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-3">{t.location}</h3>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-3">{report.area}</p>
              <div className="h-64 rounded-xl overflow-hidden">
                <MapContainer center={[report.lat, report.lng]} zoom={15} scrollWheelZoom={false} zoomSnap={0.25} zoomDelta={0.25}>
                  <TileLayer
                    url={tileUrl}
                    attribution={TILE_ATTRIBUTION}
                  />
                  <Marker position={[report.lat, report.lng]} icon={createCategoryIcon(report.category, theme)} />
                </MapContainer>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-muted dark:bg-bg-dark p-6 rounded-xl text-center">
              <FaCheckCircle className="text-5xl text-mango dark:text-mango-dark mb-3"/>
              <p className="text-3xl font-bold text-navy dark:text-text-primary-dark">{report.confirmations_count}</p>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-5">{t.confirmations}</p>
              <button 
                onClick={handleConfirm}
                className="w-full bg-teal text-white font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition-transform transform hover:scale-105"
              >
                  {t.confirmIssue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;