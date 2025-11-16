import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import Spinner from '../../components/Spinner';

const AnonymousRedirect: React.FC = () => {
    const { loginAnonymous } = React.useContext(AppContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        const performLogin = async () => {
            try {
                await loginAnonymous();
                navigate(PATHS.HOME, { replace: true });
            } catch (error) {
                console.error("Failed to login anonymously", error);
                navigate(PATHS.AUTH_LOGIN, { replace: true });
            }
        };
        performLogin();
    }, [loginAnonymous, navigate]);

    return (
        <div className="flex items-center justify-center h-screen">
            <Spinner />
        </div>
    );
};

export default AnonymousRedirect;
