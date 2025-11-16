

import React from 'react';
import { AppContext } from '../contexts/AppContext';
import { BADGES } from '../constants';
import { User, LeaderboardFilter, Badge } from '../types';
import * as api from '../services/api';
import { LeaderboardSkeleton } from '../components/SkeletonLoader';
import { FaTrophy, FaMedal, FaCircleExclamation } from 'react-icons/fa6';

type ActiveTab = 'leaderboard' | 'achievements';

const rankColors = [
    'text-yellow-400 dark:text-yellow-300', // 1st
    'text-gray-400 dark:text-gray-300',  // 2nd
    'text-yellow-600 dark:text-yellow-500' // 3rd
];

const UserRow: React.FC<{ user: User, rank: number }> = ({ user, rank }) => {
    const isTop3 = rank <= 3;
    const rankColor = isTop3 ? rankColors[rank - 1] : 'text-text-secondary dark:text-text-secondary-dark';

    return (
        <div className="flex items-center gap-4 bg-muted dark:bg-bg-dark p-3 rounded-xl">
            <div className={`w-10 text-center font-bold text-lg flex-shrink-0 ${rankColor}`}>
                {isTop3 ? <FaMedal className="inline-block" {...({} as any)} /> : rank}
            </div>
            <img src={user.avatarUrl} alt={user.display_name} className="w-12 h-12 rounded-full" />
            <div className="flex-1 min-w-0">
                <p className="font-bold text-navy dark:text-text-primary-dark truncate">{user.display_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-mango dark:text-mango-dark">{user.points}</p>
            </div>
        </div>
    );
};

const CurrentUserBar: React.FC<{ user: User & { rank: number } }> = ({ user }) => {
    const { t } = React.useContext(AppContext);
    return (
        <div className="sticky bottom-24 sm:bottom-4 z-10 p-1 bg-gradient-to-r from-teal to-mango rounded-2xl shadow-2xl mx-2">
             <div className="flex items-center gap-4 bg-card dark:bg-surface-dark p-3 rounded-xl">
                <div className="w-10 text-center font-bold text-lg text-teal dark:text-teal-dark">
                    {user.rank}
                </div>
                <img src={user.avatarUrl} alt={user.display_name} className="w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy dark:text-text-primary-dark truncate">{user.display_name} ({t.you})</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-mango dark:text-mango-dark">{user.points}</p>
                </div>
            </div>
        </div>
    );
};

const LeaderboardTab: React.FC = () => {
    const { t, currentUser } = React.useContext(AppContext);
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<LeaderboardFilter>(LeaderboardFilter.All);

    React.useEffect(() => {
        setLoading(true);
        api.getLeaderboard(50)
            .then(setUsers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter]);

    const currentUserRankData = React.useMemo(() => {
        if (!currentUser || users.length === 0) return null;
        const index = users.findIndex(u => u.id === currentUser.id);
        return index !== -1 ? { ...currentUser, rank: index + 1 } : null;
    }, [users, currentUser]);

    const FilterButton: React.FC<{ label: string; filterId: LeaderboardFilter; disabled?: boolean }> = ({ label, filterId, disabled }) => (
        <button
            onClick={() => setFilter(filterId)}
            disabled={disabled}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
                filter === filterId
                    ? 'bg-teal text-white shadow-md'
                    : 'bg-muted dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {label}
        </button>
    );

    return (
        <div className="relative">
             <div className="flex justify-center items-center gap-2 mb-6">
                <FilterButton label={t.allTime} filterId={LeaderboardFilter.All} />
                {/* Time-based filters disabled - requires backend support for point history tracking */}
                <FilterButton label={t.thisMonth} filterId={LeaderboardFilter.Month} disabled={true} />
                <FilterButton label={t.thisWeek} filterId={LeaderboardFilter.Week} disabled={true} />
            </div>

            {loading ? <LeaderboardSkeleton count={10} /> : (
                 <div className="space-y-3">
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <UserRow key={user.id} user={user} rank={index + 1} />
                        ))
                    ) : (
                       <div className="text-center py-16">
                           <p className="text-text-secondary dark:text-text-secondary-dark">No users found on the leaderboard yet.</p>
                        </div>
                    )}
                </div>
            )}
            
            {currentUserRankData && <CurrentUserBar user={currentUserRankData} />}
        </div>
    );
};


const AchievementsTab: React.FC = () => {
    const { currentUser, t, language } = React.useContext(AppContext);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FIX: Add explicit type 'Badge' to resolve type errors. */}
            {Object.values(BADGES).map((badge: Badge) => {
                const isEarned = currentUser?.achievements.includes(badge.id);
                return (
                    <div 
                        key={badge.id} 
                        className={`p-6 rounded-2xl text-center transition-all duration-300 ${isEarned ? 'bg-card dark:bg-surface-dark shadow-lg' : 'bg-muted dark:bg-bg-dark'}`}
                    >
                        <div className={`text-6xl mb-4 transition-transform duration-300 ${isEarned ? 'transform scale-110' : 'grayscale'}`}>
                            {badge.icon}
                        </div>
                        <h2 className={`text-xl font-bold ${isEarned ? 'text-mango dark:text-mango-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}>
                            {language === 'ar' ? badge.name_ar : badge.name_en}
                        </h2>
                        <p className={`mt-2 text-sm ${isEarned ? 'text-text-secondary dark:text-text-secondary-dark' : 'text-text-secondary/70 dark:text-text-secondary-dark/70'}`}>
                            {language === 'ar' ? badge.description_ar : badge.description_en}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

interface TabButtonProps {
    tabId: ActiveTab;
    label: string;
    isActive: boolean;
    onClick: (tabId: ActiveTab) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tabId, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tabId)}
      className={`px-4 py-2 text-sm sm:text-base font-bold transition-colors ${
        isActive
          ? 'border-b-2 border-teal dark:border-teal-dark text-teal dark:text-teal-dark'
          : 'text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-text-primary-dark'
      }`}
    >
      {label}
    </button>
);

const CommunityPage: React.FC = () => {
    const { currentUser, t } = React.useContext(AppContext);
    const [activeTab, setActiveTab] = React.useState<ActiveTab>('leaderboard');
    
    const handleTabClick = React.useCallback((tabId: ActiveTab) => {
        console.log('Tab clicked:', tabId);
        setActiveTab(tabId);
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
                 <span className="mx-auto text-5xl text-mango dark:text-mango-dark mb-2"><FaTrophy{...({} as any)} /></span>
                 <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{t.communityPageTitle}</h1>
            </div>

            {currentUser?.is_anonymous && (
                <div className="bg-mango/20 dark:bg-mango-dark/20 text-mango-dark dark:text-mango-dark p-4 rounded-xl mb-6 flex items-center gap-3">
                    <FaCircleExclamation className="h-5 w-5" {...({} as any)} />
                    <p className="font-semibold">{t.guestMessage}</p>
                </div>
            )}
            
            <div className="flex justify-center border-b border-border-light dark:border-border-dark mb-6">
                <TabButton 
                    tabId="leaderboard" 
                    label={t.leaderboard} 
                    isActive={activeTab === 'leaderboard'}
                    onClick={handleTabClick}
                />
                <TabButton 
                    tabId="achievements" 
                    label={t.achievements}
                    isActive={activeTab === 'achievements'}
                    onClick={handleTabClick}
                />
            </div>

            <div className={activeTab === 'leaderboard' ? 'block' : 'hidden'}>
                <LeaderboardTab />
            </div>
            <div className={activeTab === 'achievements' ? 'block' : 'hidden'}>
                <AchievementsTab />
            </div>
        </div>
    );
};

export default CommunityPage;