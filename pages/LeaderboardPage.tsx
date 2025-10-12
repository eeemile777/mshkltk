import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { User, LeaderboardFilter } from '../types';
import * as api from '../services/mockApi';
import { LeaderboardSkeleton } from '../components/SkeletonLoader';
import { FaTrophy, FaMedal } from 'react-icons/fa6';

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
                {isTop3 ? <FaMedal className="inline-block" /> : rank}
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
    return (
        <div className="sticky bottom-24 sm:bottom-4 z-10 p-1 bg-gradient-to-r from-teal to-mango rounded-2xl shadow-2xl mx-2">
             <div className="flex items-center gap-4 bg-card dark:bg-surface-dark p-3 rounded-xl">
                <div className="w-10 text-center font-bold text-lg text-teal dark:text-teal-dark">
                    {user.rank}
                </div>
                <img src={user.avatarUrl} alt={user.display_name} className="w-12 h-12 rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy dark:text-text-primary-dark truncate">{user.display_name} (You)</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-mango dark:text-mango-dark">{user.points}</p>
                </div>
            </div>
        </div>
    );
};


const LeaderboardPage: React.FC = () => {
    const { t, currentUser } = React.useContext(AppContext);
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<LeaderboardFilter>(LeaderboardFilter.All);

    React.useEffect(() => {
        setLoading(true);
        // The mock API only supports 'all time' for now.
        api.fetchLeaderboardUsers()
            .then(setUsers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter]);
    
    const currentUserRankData = React.useMemo(() => {
        if (!currentUser || users.length === 0) return null;
        const index = users.findIndex(u => u.id === currentUser.id);
        return index !== -1 ? { ...currentUser, rank: index + 1 } : null;
    }, [users, currentUser]);

    const topUsers = users;

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
        <div className="max-w-2xl mx-auto relative">
            <div className="text-center mb-6">
                 <FaTrophy className="mx-auto text-5xl text-mango dark:text-mango-dark mb-2" />
                 <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{t.leaderboard}</h1>
            </div>
           
            <div className="flex justify-center items-center gap-2 mb-6">
                <FilterButton label={t.allTime} filterId={LeaderboardFilter.All} />
                <FilterButton label={t.thisMonth} filterId={LeaderboardFilter.Month} disabled={true} />
                <FilterButton label={t.thisWeek} filterId={LeaderboardFilter.Week} disabled={true} />
            </div>

            {loading ? <LeaderboardSkeleton count={10} /> : (
                 <div className="space-y-3">
                    {topUsers.length > 0 ? (
                        topUsers.map((user, index) => (
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

export default LeaderboardPage;