import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { Notification, NotificationType, User } from '../types';
import { FaBell, FaAward, FaCircleCheck, FaUserPlus, FaComment, FaCamera } from 'react-icons/fa6';
import { NotificationsSkeleton } from '../components/SkeletonLoader';

const NotificationIcon = ({ type }: { type: NotificationType }) => {
    switch(type) {
        case NotificationType.Badge: return <span className="text-mango dark:text-mango-dark"><FaAward/></span>;
        case NotificationType.Confirm: return <span className="text-teal dark:text-teal-dark"><FaCircleCheck/></span>;
        case NotificationType.StatusChange: return <span className="text-sky dark:text-cyan-dark"><FaBell/></span>;
        case NotificationType.NewFollower: return <span className="text-sky dark:text-cyan-dark"><FaUserPlus/></span>;
        case NotificationType.NewComment: return <span className="text-text-secondary dark:text-text-secondary-dark"><FaComment/></span>;
        case NotificationType.ProofRequest: return <span className="text-navy dark:text-text-primary-dark"><FaCamera/></span>;
        default: return <span className="text-text-secondary dark:text-text-secondary-dark"><FaBell/></span>;
    }
}

const formatNotificationMessage = (notification: Notification, t: any, language: string): string => {
    const { type, metadata } = notification;

    switch (type) {
        case NotificationType.StatusChange:
            return t.notif_status_change
                .replace('{reportTitle}', metadata.reportTitle)
                .replace('{newStatus}', t[metadata.newStatus] || metadata.newStatus);
        case NotificationType.Badge:
            return t.notif_badge.replace('{badgeName}', metadata.badgeName);
        case NotificationType.Confirm:
            return t.notif_confirm.replace('{reportTitle}', metadata.reportTitle);
        case NotificationType.NewFollower:
            return metadata.isSelf === "true"
                ? t.notif_new_follower_self.replace('{reportTitle}', metadata.reportTitle)
                : t.notif_new_follower_other.replace('{followerName}', metadata.followerName).replace('{reportTitle}', metadata.reportTitle);
        case NotificationType.NewComment:
            return metadata.isCreator === "true"
                ? t.notif_new_comment_other.replace('{commenterName}', metadata.commenterName).replace('{reportTitle}', metadata.reportTitle)
                : t.notif_new_comment_self.replace('{commenterName}', metadata.commenterName).replace('{reportTitle}', metadata.reportTitle);
        case NotificationType.ProofRequest:
            return t.notif_proof_request.replace('{reportTitle}', metadata.reportTitle);
        default:
            const exhaustiveCheck: never = type;
            return `Unknown notification: ${exhaustiveCheck}`;
    }
};


const NotificationsPage: React.FC = () => {
    const { notifications, loading, t, language, markNotificationsAsRead, currentUser } = React.useContext(AppContext);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{t.notifications}</h1>
                <button 
                    onClick={markNotificationsAsRead}
                    className="text-sm font-semibold text-teal dark:text-teal-dark hover:underline"
                >
                    {t.markAllAsRead}
                </button>
            </div>

            {loading ? <NotificationsSkeleton /> : (
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif.id} className={`p-4 rounded-xl flex items-start gap-4 transition-colors ${!notif.read ? 'bg-card dark:bg-surface-dark shadow-md' : 'bg-muted dark:bg-bg-dark'}`}>
                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.read ? 'bg-teal/10' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <NotificationIcon type={notif.type} />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary dark:text-text-primary-dark">
                                        {formatNotificationMessage(notif, t, language)}
                                    </p>
                                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                                        {new Date(notif.created_at).toLocaleString(language === 'ar' ? 'ar-LB' : 'en-US')}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                       <div className="text-center py-16">
                           <span className="mx-auto text-4xl text-text-secondary/20 dark:text-text-secondary-dark/20 mb-4"><FaBell/></span>
                           <p className="text-text-secondary dark:text-text-secondary-dark">{t.noNotifications}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;