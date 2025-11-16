import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import Spinner from '../../components/Spinner';

const Logout: React.FC = () => {
    const { logout } = React.useContext(AppContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        const performLogout = async () => {
            await logout();
            navigate(PATHS.AUTH_LOGIN, { replace: true });
        };
        performLogout();
    }, [logout, navigate]);

    return (
         <div className="flex items-center justify-center h-screen">
            <Spinner />
        </div>
    );
};

export default Logout;
