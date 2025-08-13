import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Report } from '../types';
import * as api from '../services/mockApi';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { PATHS, CATEGORY_ICONS } from '../constants';
import { FaCheckCircle } from 'react-icons/fa';

const TrendingReportCard: React.FC<{ report: Report, rank: number }> = ({ report, rank }) => {
    const { t, language } = React.useContext(AppContext);
    const CategoryIcon = CATEGORY_ICONS[report.category];

    return (
        <Link 
            to={PATHS.REPORT_DETAILS.replace(':id', report.id)}
            className="bg-card dark:bg-surface-dark p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-start gap-4"
        >
            <div className="flex flex-col items-center justify-center text-mango dark:text-mango-dark">
                <span className="text-3xl font-bold">{rank}</span>
            </div>

            <img src={report.photo_urls[0]} alt={report.note} className="w-24 h-24 object-cover rounded-xl"/>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <CategoryIcon className="text-teal dark:text-teal-dark" />
                    <span className="font-bold text-navy dark:text-text-primary-dark">{t[report.category]}</span>
                </div>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2 line-clamp-2">{report.note}</p>
                <div className="flex items-center justify-between text-xs">
                   <span className="flex items-center gap-1 font-bold text-mango dark:text-mango-dark">
                       <FaCheckCircle/> {report.confirmations_count} {t.confirmations}
                   </span>
                   <span className="text-text-secondary dark:text-text-secondary-dark">{report.area}</span>
                </div>
            </div>
        </Link>
    );
};


const TrendingPage: React.FC = () => {
    const { t } = React.useContext(AppContext);
    const [trendingReports, setTrendingReports] = React.useState<Report[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        api.fetchTrendingReports()
            .then(data => {
                setTrendingReports(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-navy dark:text-text-primary-dark">{t.trending}</h1>
            
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Spinner />
                </div>
            ) : (
                <div className="space-y-4">
                    {trendingReports.length > 0 ? (
                        trendingReports.map((report, index) => (
                            <TrendingReportCard key={report.id} report={report} rank={index + 1} />
                        ))
                    ) : (
                        <p className="text-center text-text-secondary dark:text-text-secondary-dark py-10">{t.noReportsFound}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendingPage;