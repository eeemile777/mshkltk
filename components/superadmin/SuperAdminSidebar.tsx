import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import { FaGaugeHigh, FaListCheck, FaUsers, FaBuilding, FaArrowRightFromBracket, FaMapLocationDot } from 'react-icons/fa6';

const SuperAdminSidebar: React.FC = () => {
    const { logout } = React.useContext(SuperAdminContext);
    const { t } = React.useContext(AppContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate(PATHS.SUPER_ADMIN_LOGIN);
    };

    const navItems = [
        { path: PATHS.SUPER_ADMIN_DASHBOARD, label: t.superAdminDashboard, icon: FaGaugeHigh },
        { path: PATHS.SUPER_ADMIN_MAP, label: t.superAdminMapView, icon: FaMapLocationDot },
        { path: PATHS.SUPER_ADMIN_REPORTS, label: t.superAdminAllReports, icon: FaListCheck },
        { path: PATHS.SUPER_ADMIN_USERS, label: t.superAdminCitizenUsers, icon: FaUsers },
        { path: PATHS.SUPER_ADMIN_MUNICIPALITIES, label: t.superAdminMunicipalities, icon: FaBuilding },
    ];
    
    const navLinkClasses = `flex items-center gap-4 px-4 py-3 rounded-lg text-text-secondary dark:text-text-secondary-dark hover:bg-coral/10 dark:hover:bg-coral-dark/20 hover:text-navy dark:hover:text-text-primary-dark transition-colors`;
    const activeNavLinkClasses = "bg-coral/20 dark:bg-coral-dark/20 text-navy dark:text-text-primary-dark font-bold";

    return (
        <aside className="w-64 bg-card dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark flex flex-col flex-shrink-0 p-4 border-r border-border-light dark:border-r-0">
            <div className="text-center py-4 mb-4">
                 <h1 className="text-3xl font-bold text-coral dark:text-coral-dark">Milo Admin</h1>
                 <p className="text-sm text-mango dark:text-mango-dark">Super Admin Panel</p>
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
            <div className="mt-auto">
                 <div className="pt-2 border-t border-border-light dark:border-border-dark">
                     <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-coral dark:text-coral-dark hover:bg-coral/10 dark:hover:bg-coral-dark/20`}
                     >
                        <FaArrowRightFromBracket className="h-5 w-5" />
                        <span>{t.logout}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default SuperAdminSidebar;