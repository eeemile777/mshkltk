import * as React from 'react';
import { AppContext } from '../contexts/AppContext';
import { BADGES } from '../constants';

const AchievementsPage: React.FC = () => {
    const { currentUser, t, language } = React.useContext(AppContext);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-navy dark:text-text-primary-dark">{t.achievements}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(BADGES).map(badge => {
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
        </div>
    );
};

export default AchievementsPage;
