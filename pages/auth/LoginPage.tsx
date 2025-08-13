
import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import { FaSpinner } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const { t, login, loginAnonymous } = React.useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const from = location.state?.from?.pathname || PATHS.HOME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await loginAnonymous();
      navigate(from, { replace: true });
    } catch(err) {
       setError('Could not start guest session.');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="bg-card dark:bg-surface-dark p-8 rounded-2xl shadow-lg w-full">
      <div className="text-center mb-8">
          <h1 className="text-5xl font-bold font-sans text-mango tracking-wide">Mshkltk</h1>
          <h2 className="text-5xl font-bold font-arabic text-coral -mt-2">مشكلتك</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.username}</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.password}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark"
          />
        </div>

        {error && <p className="text-coral dark:text-coral-dark text-sm text-center">{error}</p>}

        <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-dark disabled:bg-gray-400"
        >
          {loading ? <FaSpinner className="animate-spin" /> : t.login}
        </button>
      </form>
      <div className="mt-6 text-center">
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light dark:border-border-dark"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark">أو</span>
          </div>
        </div>
        <div className="space-y-4">
             <Link
                to={PATHS.AUTH_SIGNUP}
                className="block w-full text-center py-3 px-4 rounded-full font-bold bg-muted dark:bg-bg-dark text-teal dark:text-teal-dark hover:bg-gray-200 dark:hover:bg-gray-800"
             >
                {t.createAccount}
            </Link>
             <button
                onClick={handleAnonymousLogin}
                className="block w-full text-center py-3 px-4 rounded-full font-bold bg-muted dark:bg-bg-dark text-text-secondary dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-800"
             >
                {t.continueAsGuest}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;