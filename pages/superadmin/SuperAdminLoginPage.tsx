import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa6';
import { AppContext } from '../../contexts/AppContext';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { PATHS } from '../../constants';

const SuperAdminLoginPage: React.FC = () => {
  const { t } = React.useContext(AppContext);
  const { login } = React.useContext(SuperAdminContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for auto-login credentials from sessionStorage (redirected from citizen login)
  const autoUsername = sessionStorage.getItem('autoLoginUsername');
  const autoPassword = sessionStorage.getItem('autoLoginPassword');
  
  const [username, setUsername] = React.useState(location.state?.username || autoUsername || '');
  const [password, setPassword] = React.useState(location.state?.password || autoPassword || '');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(!!(location.state?.username || (autoUsername && autoPassword)));

  const from = location.state?.from?.pathname || PATHS.SUPER_ADMIN_DASHBOARD;

  const performLogin = React.useCallback(async (user: string, pass: string) => {
    setLoading(true);
    setError('');
    // Clear auto-login credentials from sessionStorage
    sessionStorage.removeItem('autoLoginUsername');
    sessionStorage.removeItem('autoLoginPassword');
    try {
      await login({ username: user, password: pass });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t.invalidCredentials);
      setLoading(false); // Final stop
    }
  }, [login, navigate, from, t.invalidCredentials]);
  
  React.useEffect(() => {
    // Auto-login if credentials are available
    if (location.state?.username && location.state?.password) {
        performLogin(location.state.username, location.state.password);
    } else if (autoUsername && autoPassword) {
        performLogin(autoUsername, autoPassword);
    }
  }, [location.state, autoUsername, autoPassword, performLogin]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-dark">
      <div className="bg-surface-dark p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        <Link to="/" className="absolute top-4 left-4 text-text-secondary-dark hover:text-text-primary-dark transition-colors" aria-label="Back to selection">
          <FaArrowLeft size={20} />
        </Link>
        <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-display text-coral-dark tracking-wide">Milo Admin</h1>
            <p className="text-lg text-mango-dark mt-2">Super Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-text-secondary-dark mb-2">{t.username}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 bg-bg-dark border border-border-dark rounded-xl focus:ring-2 focus:ring-coral-dark text-text-primary-dark"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-text-secondary-dark mb-2">{t.password}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-bg-dark border border-border-dark rounded-xl focus:ring-2 focus:ring-coral-dark text-text-primary-dark"
            />
          </div>

          {error && <p className="text-coral-dark text-sm text-center">{error}</p>}

          <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-coral-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-dark focus:ring-mango-dark disabled:bg-gray-600"
          >
            {loading ? <span className="animate-spin"><FaSpinner /></span> : t.login}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;