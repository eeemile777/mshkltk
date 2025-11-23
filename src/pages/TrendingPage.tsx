import React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Report, ReportSeverity } from '../types';
import * as api from '../services/api';
import { Link } from 'react-router-dom';
import { PATHS } from '../constants';
import { FaCircleCheck } from 'react-icons/fa6';
import { ReportListSkeleton } from '../components/SkeletonLoader';

const SeverityIndicator: React.FC<{ severity: ReportSeverity; className?: string }> = ({ severity, className = '' }) => {
    const severityMap = {
        [ReportSeverity.High]: { text: '!!!', title: 'High' },
        [ReportSeverity.Medium]: { text: '!!', title: 'Medium' },
        [ReportSeverity.Low]: { text: '!', title: 'Low' },
    };
    const { text, title } = severityMap[severity] || severityMap.low;

    return (
        <span className={`font-black text-lg text-coral dark:text-coral-dark ${className}`} title={`Severity: ${title}`}>
            {text}
        </span>
    );
};

const TrendingReportCard: React.FC<{ report: Report, rank: number }> = ({ report, rank }) => {
    const { t, theme, language, categories } = React.useContext(AppContext);
    const categoryData = categories[report.category];

    if (!categoryData) return null;

    const CategoryIcon = categoryData.icon;
    const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;
    const categoryName = language === 'ar' ? categoryData.name_ar : categoryData.name_en;

    const title = language === 'ar' ? report.title_ar : report.title_en;
    const note = language === 'ar' ? report.note_ar : report.note_en;
    const url = report.photo_urls[0];
    const isVideo = url.startsWith('data:video/');

    return (
        <Link
            to={PATHS.REPORT_DETAILS.replace(':id', report.id)}
            className="bg-card dark:bg-surface-dark p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-start gap-4"
        >
            <div className="flex flex-col items-center justify-center text-mango dark:text-mango-dark">
                <span className="text-3xl font-bold">{rank}</span>
            </div>

            {isVideo ? (
                <video src={url} className="w-24 h-24 object-cover rounded-xl" playsInline />
            ) : (
                <img src={url} alt={note} className="w-24 h-24 object-cover rounded-xl" />
            )}

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <CategoryIcon style={{ color: categoryColor }} />
                    <span className="font-bold text-navy dark:text-text-primary-dark">{categoryName}</span>
                </div>
                <p className="font-bold text-text-primary dark:text-text-primary-dark mb-1 line-clamp-2">{title}</p>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2 line-clamp-1">{note}</p>
                <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold">
                        <SeverityIndicator severity={report.severity} className="text-sm" />
                        <div className="flex items-center gap-1 text-mango dark:text-mango-dark">
                            <FaCircleCheck /> {report.confirmations_count} {t.confirmations}
                        </div>
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
                <ReportListSkeleton count={5} />
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
