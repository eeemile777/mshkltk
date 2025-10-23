import * as React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ReportData } from '../../types';
import { FaTriangleExclamation } from 'react-icons/fa6';

interface AiRejectionNoticeProps {
    reportData: ReportData;
    onGoBack: () => void;
}

const AiRejectionNotice: React.FC<AiRejectionNoticeProps> = ({ reportData, onGoBack }) => {
    const { t } = React.useContext(AppContext);
    const rejectedPreviews = reportData.previews.filter(p => p.status === 'rejected');

    if (rejectedPreviews.length === 0) {
        return null;
    }

    return (
        <div className="bg-coral/10 dark:bg-coral-dark/10 p-4 rounded-xl mb-4 animate-fade-in border border-coral/20">
            <h3 className="font-bold text-coral dark:text-coral-dark mb-2 flex items-center gap-2">
                <FaTriangleExclamation />
                {t.aiPhotosRejectedTitle.replace('{count}', String(rejectedPreviews.length))}
            </h3>
            <ul className="list-disc list-inside text-sm text-coral dark:text-coral-dark/90 space-y-1 mb-4 pl-2">
                {rejectedPreviews.map((p, i) => (
                    <li key={i}>{p.rejectionReason || "Reason not provided."}</li>
                ))}
            </ul>
            <button
                onClick={onGoBack}
                className="w-full px-4 py-2 bg-coral text-white font-bold rounded-full shadow-md hover:bg-opacity-90"
            >
                {t.aiPhotosRejectedGoBack}
            </button>
        </div>
    );
};

export default AiRejectionNotice;
