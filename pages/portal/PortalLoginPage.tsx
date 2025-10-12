import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa6';
import { AppContext } from '../../contexts/AppContext';
import { PortalContext } from '../../contexts/PortalContext';
import { PATHS } from '../../constants';

const PortalLoginPage: React.FC = () => {
  const { t } = React.useContext(AppContext);
  const { login } = React.useContext(PortalContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = React.useState(location.state?.username || '');
  const [password, setPassword] = React.useState(location.state?.password || '');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(!!location.state?.username);

  const from = location.state?.from?.pathname || '/portal/dashboard';

  const performLogin = React.useCallback(async (user: string, pass: string) => {
    setLoading(true);
    setError('');
    try {
      await login({ username: user, password: pass });
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.message && err.message.includes('Super Admin')) {
        navigate(PATHS.SUPER_ADMIN_LOGIN, { state: { username: user, password: pass }, replace: true });
      } else {
        setError(err.message || t.invalidCredentials);
        setLoading(false);
      }
    }
  }, [login, navigate, from, t.invalidCredentials]);

  React.useEffect(() => {
    if (location.state?.username && location.state?.password) {
        performLogin(location.state.username, location.state.password);
    }
  }, [location.state, performLogin]);

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
            <h1 className="text-4xl sm:text-5xl font-bold font-display text-teal-dark tracking-wide">Mshkltk</h1>
            <p className="text-lg text-cyan-dark mt-2">Municipality Portal</p>
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
              className="w-full p-3 bg-bg-dark border border-border-dark rounded-xl focus:ring-2 focus:ring-teal-dark text-text-primary-dark"
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
              className="w-full p-3 bg-bg-dark border border-border-dark rounded-xl focus:ring-2 focus:ring-teal-dark text-text-primary-dark"
            />
          </div>

          {error && (
              <p className="text-coral-dark text-sm text-center">
                  {error}
                  {error.includes('Super Admin') && (
                      <Link to={PATHS.SUPER_ADMIN_LOGIN} className="block mt-1 font-bold underline hover:text-coral">
                          Go to Super Admin Portal
                      </Link>
                  )}
              </p>
          )}

          <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-bg-dark bg-teal-dark hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-dark focus:ring-cyan-dark disabled:bg-gray-600"
          >
            {loading ? <FaSpinner className="animate-spin" /> : t.login}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PortalLoginPage;