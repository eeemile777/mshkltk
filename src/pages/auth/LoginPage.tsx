import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import { FaSpinner, FaArrowLeft } from 'react-icons/fa6';

const LoginPage: React.FC = () => {
  const { t, login, loginAnonymous, language } = React.useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showLoginForm, setShowLoginForm] = React.useState(false);

  const from = location.state?.from?.pathname || PATHS.HOME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      // Check if this is a redirect error (super admin or portal user)
      if (err.redirectTo) {
        // Store credentials temporarily for auto-login on the target page
        sessionStorage.setItem('autoLoginUsername', username);
        sessionStorage.setItem('autoLoginPassword', password);
        // Redirect to the appropriate login page
        navigate(err.redirectTo, { replace: true });
        return;
      }
      
      // Legacy fallback for portal user detection
      if (err.message && (err.message.includes('portals') || err.message.includes('portal access'))) {
          navigate('/portal/login', { state: { username, password }, replace: true });
      } else {
          setError(err.message || t.invalidCredentials);
          setLoading(false);
      }
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

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { reverseAnimation: true } });
  };

  return (
    <div className="bg-card dark:bg-surface-dark p-8 rounded-2xl shadow-lg w-full relative">
       <button onClick={handleBack} className="absolute top-4 left-4 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-text-primary-dark transition-colors" aria-label="Back to selection">
        <FaArrowLeft size={20} />
      </button>
      <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-mango tracking-wide">Mshkltk</h1>
          <h2 className="text-4xl sm:text-5xl font-bold font-arabic text-coral -mt-2">مشكلتك</h2>
      </div>
      
      <button
          onClick={handleAnonymousLogin}
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-dark disabled:bg-gray-400"
      >
        {loading && !showLoginForm ? <span className="animate-spin"><FaSpinner /></span> : t.continueAsGuest}
      </button>

      <div className="relative my-6">
           <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-border-light dark:border-border-dark"></div>
           </div>
           <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark">{t.or}</span>
           </div>
       </div>

      {showLoginForm ? (
        <div className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.username}</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.password}</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark" />
            </div>
            {error && (
              <p className="text-coral dark:text-coral-dark text-sm text-center">
                  {error.includes('portal')
                  ? <><span className="block">{error}</span><Link to="/portal/login" className="font-bold underline hover:text-coral">Go to Portal Login</Link></>
                  : error
                  }
              </p>
            )}
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-navy dark:bg-sand dark:text-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-dark disabled:bg-gray-400">
              {loading ? <span className="animate-spin"><FaSpinner /></span> : t.login}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to={PATHS.AUTH_SIGNUP} className="text-sm text-teal dark:text-teal-dark hover:underline">
                {t.createAccount}
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
              onClick={() => setShowLoginForm(true)}
              className="font-bold text-navy dark:text-text-primary-dark hover:text-teal dark:hover:text-teal-dark transition-colors"
          >
            {t.signInOrCreateAccount}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;