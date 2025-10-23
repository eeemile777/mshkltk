import * as React from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import useGeolocation from '../../hooks/useGeolocation';
import { Report } from '../../types';
import { PATHS } from '../../constants';
// FIX: Changed icon name from FaExclamationTriangle to FaTriangleExclamation to match react-icons/fa6 library.
import { FaCamera, FaPen, FaTriangleExclamation, FaCircleQuestion } from 'react-icons/fa6';
import Spinner from '../../components/Spinner';
import TutorialModal from '../../components/TutorialModal';

// Haversine distance calculation in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const NearbyReportCard: React.FC<{ report: Report & { distance: number } }> = ({ report }) => {
    const { t, language, categories } = React.useContext(AppContext);
    const title = language === 'ar' ? report.title_ar : report.title_en;
    const distanceText = report.distance < 1000
        ? t.distanceAwayMeters.replace('{distance}', String(Math.round(report.distance)))
        : t.distanceAwayKm.replace('{distance}', String((report.distance / 1000).toFixed(1)));
    const categoryData = categories[report.category];
    const categoryName = categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : report.category;


    return (
        <Link to={PATHS.REPORT_DETAILS.replace(':id', report.id)} state={{ from: 'reportWizard' }} className="block bg-muted dark:bg-bg-dark p-3 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
                <img src={report.photo_urls[0]} alt={title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy dark:text-text-primary-dark truncate">{title}</p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{categoryName}</p>
                    <p className="text-xs font-semibold text-sky dark:text-cyan-dark">{distanceText}</p>
                </div>
            </div>
        </Link>
    );
};


interface Step1TypeProps {
  onSelect: (choice: 'with' | 'without') => void;
}

const Step1Type: React.FC<Step1TypeProps> = ({ onSelect }) => {
    const { t, reports } = React.useContext(AppContext);
    const [nearbyReports, setNearbyReports] = React.useState<(Report & { distance: number })[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [userHasProceeded, setUserHasProceeded] = React.useState(false);
    const [isTutorialOpen, setIsTutorialOpen] = React.useState<'with' | 'without' | null>(null);
    const location = useGeolocation({ enableHighAccuracy: true });

    React.useEffect(() => {
        if (location.loading) {
            return;
        }

        if (location.error || !location.latitude || !location.longitude) {
            setIsLoading(false);
            setUserHasProceeded(true); // Skip check if location fails
            return;
        }

        const reportsWithDistance = reports
            .map(report => ({
                ...report,
                distance: getDistance(location.latitude!, location.longitude!, report.lat, report.lng)
            }))
            .filter(report => report.distance <= 200); // 200 meters radius

        reportsWithDistance.sort((a, b) => a.distance - b.distance);
        setNearbyReports(reportsWithDistance.slice(0, 3));
        setIsLoading(false);
    }, [location.loading, location.latitude, location.longitude, location.error, reports]);
    
    const renderDuplicateCheck = () => (
        <div className="w-full max-w-2xl text-center animate-fade-in">
            {/* FIX: Changed icon name from FaExclamationTriangle to FaTriangleExclamation to match react-icons/fa6 library. */}
            <span className="text-5xl text-mango dark:text-mango-dark mx-auto mb-4"><FaTriangleExclamation/></span>
            <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-2">{t.isThisYourIssue}</h2>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-6">{t.reportsNearbyMessage}</p>
            <div className="space-y-3 mb-6">
                {nearbyReports.map(report => <NearbyReportCard key={report.id} report={report} />)}
            </div>
            <button
                onClick={() => setUserHasProceeded(true)}
                className="px-6 py-3 bg-teal text-white font-bold rounded-full shadow-lg hover:bg-opacity-90 transition-transform hover:scale-105"
            >
                {t.itsANewProblem}
            </button>
        </div>
    );

    const renderTypeSelection = () => (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-8">{t.reportTypeTitle}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                <button
                    onClick={() => onSelect('with')}
                    className="relative group flex flex-col items-center justify-center p-8 bg-card dark:bg-surface-dark rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-teal"
                >
                    <span className="text-6xl text-teal dark:text-teal-dark mb-4 transition-transform duration-300 group-hover:scale-110"><FaCamera/></span>
                    <h3 className="text-2xl font-bold text-navy dark:text-text-primary-dark flex items-center gap-2">
                        {t.reportWithMedia}
                        <button onClick={(e) => { e.stopPropagation(); setIsTutorialOpen('with'); }} className="text-text-secondary/50 dark:text-text-secondary-dark/50 hover:text-teal dark:hover:text-teal-dark">
                            <FaCircleQuestion />
                        </button>
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{t.reportWithMediaDesc}</p>
                </button>

                <button
                    onClick={() => onSelect('without')}
                    className="relative group flex flex-col items-center justify-center p-8 bg-card dark:bg-surface-dark rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-teal"
                >
                    <span className="text-6xl text-sky dark:text-cyan-dark mb-4 transition-transform duration-300 group-hover:scale-110"><FaPen/></span>
                    <h3 className="text-2xl font-bold text-navy dark:text-text-primary-dark flex items-center gap-2">
                        {t.reportWithoutMedia}
                         <button onClick={(e) => { e.stopPropagation(); setIsTutorialOpen('without'); }} className="text-text-secondary/50 dark:text-text-secondary-dark/50 hover:text-teal dark:hover:text-teal-dark">
                            <FaCircleQuestion />
                        </button>
                    </h3>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{t.reportWithoutMediaDesc}</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
            {isTutorialOpen && <TutorialModal type={isTutorialOpen} isOpen={!!isTutorialOpen} onClose={() => setIsTutorialOpen(null)} />}
            {isLoading
                ? <Spinner />
                : (nearbyReports.length > 0 && !userHasProceeded)
                    ? renderDuplicateCheck()
                    : renderTypeSelection()
            }
        </div>
    );
};

export default Step1Type;