import * as React from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS } from '../constants';
import { FaUsers, FaLandmark } from 'react-icons/fa6';

const LandingPage: React.FC = () => {
    const { t } = React.useContext(AppContext);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-sand dark:bg-bg-dark p-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl sm:text-7xl font-bold font-display text-mango tracking-wide">Mshkltk</h1>
                <h2 className="text-5xl sm:text-7xl font-bold font-arabic text-coral -mt-2 sm:-mt-4">مشكلتك</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Link to={PATHS.AUTH_LOGIN} className="group flex flex-col items-center justify-center p-8 bg-card dark:bg-surface-dark rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <FaUsers className="text-6xl text-teal dark:text-teal-dark mb-4 transition-transform duration-300 group-hover:scale-110" />
                    <h3 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{t.citizenEN}</h3>
                    <h4 className="text-3xl font-bold font-arabic text-navy dark:text-text-primary-dark">{t.citizenAR}</h4>
                </Link>

                <Link to="/portal/login" className="group flex flex-col items-center justify-center p-8 bg-card dark:bg-surface-dark rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <FaLandmark className="text-6xl text-sky dark:text-cyan-dark mb-4 transition-transform duration-300 group-hover:scale-110" />
                    <h3 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{t.municipalityEN}</h3>
                    <h4 className="text-3xl font-bold font-arabic text-navy dark:text-text-primary-dark">{t.municipalityAR}</h4>
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;