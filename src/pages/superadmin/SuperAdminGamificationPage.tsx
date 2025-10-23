import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { DynamicBadge, GamificationSettings } from '../../types';
import Spinner from '../../components/Spinner';
import { FaPenToSquare, FaTrash, FaPlus, FaSpinner, FaTrophy, FaCoins, FaToggleOn, FaToggleOff } from 'react-icons/fa6';
import { ICON_MAP } from '../../constants';
import BadgeEditModal from '../../components/superadmin/BadgeEditModal';

const PointsRulesTab: React.FC = () => {
    const { gamificationSettings, loading, updateGamificationSettings } = React.useContext(SuperAdminContext);
    const [settings, setSettings] = React.useState<GamificationSettings | null>(gamificationSettings);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        setSettings(gamificationSettings);
    }, [gamificationSettings]);

    const handlePointsChange = (id: string, value: string) => {
        const points = parseInt(value, 10);
        if (!isNaN(points) && settings) {
            const updatedRules = settings.pointsRules.map(rule => rule.id === id ? { ...rule, points } : rule);
            setSettings({ ...settings, pointsRules: updatedRules });
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        await updateGamificationSettings(settings);
        setIsSaving(false);
    };

    if (loading || !settings) return <Spinner />;

    return (
        <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">Points Rules</h2>
            <div className="space-y-4">
                {settings.pointsRules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-muted dark:bg-bg-dark rounded-lg">
                        <label htmlFor={rule.id} className="font-semibold">{rule.description}</label>
                        <input
                            id={rule.id}
                            type="number"
                            value={rule.points}
                            onChange={e => handlePointsChange(rule.id, e.target.value)}
                            className="w-24 p-2 text-center font-bold bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-md"
                        />
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-teal text-white font-bold rounded-lg disabled:bg-gray-400">
                    {isSaving ? <span className="animate-spin"><FaSpinner/></span> : "Save Points"}
                </button>
            </div>
        </div>
    );
};


const BadgesTab: React.FC = () => {
    const { badges, loading, addBadge, updateBadge, deleteBadge, categories } = React.useContext(SuperAdminContext);
    const [modalState, setModalState] = React.useState<{ mode: 'add' | 'edit'; badge?: DynamicBadge } | null>(null);

    const handleSave = async (badgeData: DynamicBadge | Omit<DynamicBadge, 'id'>) => {
        if (modalState?.mode === 'edit' && 'id' in badgeData) {
            await updateBadge(badgeData as DynamicBadge);
        } else if (modalState?.mode === 'add') {
            await addBadge(badgeData as Omit<DynamicBadge, 'id'>);
        }
        setModalState(null);
    };
    
    const handleDelete = async (badge: DynamicBadge) => {
        if (window.confirm(`Are you sure you want to delete the badge "${badge.name_en}"?`)) {
            await deleteBadge(badge);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            {modalState && <BadgeEditModal mode={modalState.mode} badge={modalState.badge} categories={categories} onClose={() => setModalState(null)} onSave={handleSave} />}
            <div className="flex justify-end mb-4">
                <button onClick={() => setModalState({ mode: 'add' })} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal text-white">
                    <FaPlus /> Add Badge
                </button>
            </div>
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden">
                 <div className="p-4 grid grid-cols-6 font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-border-dark/20">
                        <div className="col-span-2">Badge Name</div>
                        <div className="col-span-2">Criteria</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                    <div className="divide-y divide-border-light dark:divide-border-dark">
                        {badges.map((badge) => {
                            const Icon = ICON_MAP[badge.icon] || ICON_MAP['FaTrophy'];
                            const criteriaText = `${badge.criteria.type.replace(/_/g, ' ')}: ${badge.criteria.value} ${badge.criteria.category_filter ? `(in ${badge.criteria.category_filter})` : ''}`;
                            return (
                                 <div key={badge.id} className="p-4 grid grid-cols-6 items-center">
                                    <div className="col-span-2 flex items-center gap-3">
                                       <div className="text-3xl text-mango dark:text-mango-dark"><Icon /></div>
                                       <span className="font-bold text-navy dark:text-text-primary-dark">{badge.name_en}</span>
                                    </div>
                                    <div className="col-span-2 text-sm text-text-secondary dark:text-text-secondary-dark capitalize">{criteriaText}</div>
                                    <div>
                                        {badge.is_active ? 
                                            <span className="flex items-center gap-2 text-teal dark:text-teal-dark"><FaToggleOn /> Active</span> :
                                            <span className="flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark"><FaToggleOff /> Disabled</span>
                                        }
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setModalState({ mode: 'edit', badge })} className="p-2 text-sky dark:text-cyan-dark hover:bg-sky/10 rounded-full" title="Edit Badge"><FaPenToSquare /></button>
                                      <button onClick={() => handleDelete(badge)} className="p-2 text-coral dark:text-coral-dark hover:bg-coral/10 rounded-full" title="Delete Badge"><FaTrash /></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
            </div>
        </div>
    );
};

const SuperAdminGamificationPage: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState<'points' | 'badges'>('points');
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">Gamification Settings</h1>
            
            <div className="flex border-b border-border-light dark:border-border-dark mb-6">
                <button
                    onClick={() => setActiveTab('points')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${activeTab === 'points' ? 'border-b-2 border-coral text-navy dark:text-text-primary-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}
                >
                    <FaCoins /> Points Rules
                </button>
                 <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${activeTab === 'badges' ? 'border-b-2 border-coral text-navy dark:text-text-primary-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}
                >
                    <FaTrophy /> Badges
                </button>
            </div>

            <div>
                {activeTab === 'points' ? <PointsRulesTab /> : <BadgesTab />}
            </div>
        </div>
    );
};

export default SuperAdminGamificationPage;