import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PortalContext } from '../../contexts/PortalContext';
import { FaChartPie, FaListCheck, FaMapLocationDot, FaArrowRightFromBracket, FaMoon, FaSun, FaGlobe } from 'react-icons/fa6';
import { AppContext } from '../../contexts/AppContext';
import { Theme } from '../../types';

const PortalSidebar: React.FC = () => {
    const { logout } = React.useContext(PortalContext);
    const { t, theme, toggleTheme, language, toggleLanguage } = React.useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/portal/login');
    };

    const navItems = [
        { path: '/portal/dashboard', label: t.dashboard, icon: FaChartPie },
        { path: '/portal/reports', label: t.reports, icon: FaListCheck },
        { path: '/portal/map', label: t.mapView, icon: FaMapLocationDot },
    ];
    
    const rtlClass = language === 'ar' ? 'flex-row-reverse' : '';
    const navLinkClasses = `flex items-center gap-4 px-4 py-3 rounded-lg text-text-secondary dark:text-text-secondary-dark hover:bg-teal/10 dark:hover:bg-teal-dark/20 hover:text-navy dark:hover:text-text-primary-dark transition-colors ${rtlClass}`;
    const activeNavLinkClasses = "bg-teal/20 dark:bg-teal-dark/20 text-navy dark:text-text-primary-dark font-bold";

    return (
        <aside className="w-64 bg-card dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark flex flex-col flex-shrink-0 p-4 border-r border-border-light dark:border-r-0">
            <div className="text-center py-4 mb-4">
                 <h1 className="text-3xl font-bold text-teal dark:text-teal-dark">{t.portalTitle}</h1>
                 <p className="text-sm text-sky dark:text-cyan-dark">{t.portalSubtitle}</p>
            </div>
            <nav className="flex-1 flex flex-col">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto space-y-2">
                 <div className="px-4 py-2 text-xs font-semibold uppercase text-text-secondary/50 dark:text-text-secondary-dark/50">{t.settings}</div>
                 <button onClick={toggleTheme} className={`${navLinkClasses} w-full`}>
                    {theme === Theme.DARK ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
                    <span>{theme === Theme.DARK ? t.lightMode : t.darkMode}</span>
                 </button>
                 <button onClick={toggleLanguage} className={`${navLinkClasses} w-full`}>
                    <FaGlobe className="h-5 w-5" />
                    <span>{language === 'en' ? 'العربية' : 'English'}</span>
                 </button>

                 <div className="pt-2 border-t border-border-light dark:border-border-dark">
                     <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-coral dark:text-coral-dark hover:bg-coral/10 dark:hover:bg-coral-dark/20 ${rtlClass}`}
                     >
                        <FaArrowRightFromBracket className="h-5 w-5" />
                        <span>{t.logout}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default PortalSidebar;