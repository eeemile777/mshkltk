import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import { FaSpinner } from 'react-icons/fa';

const SignupPage: React.FC = () => {
  const { t, signup } = React.useContext(AppContext);
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !username || !password || !confirmPassword) {
      setError(t.fieldRequired);
      return;
    }
    if (password.length < 8) {
      setError(t.passwordMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      await signup({ first_name: firstName, last_name: lastName, username, password });
      navigate(PATHS.HOME);
    } catch (err) {
      if (err instanceof Error && err.message.includes('exists')) {
        setError(t.usernameTaken);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card dark:bg-surface-dark p-8 rounded-2xl shadow-lg w-full">
      <h2 className="text-3xl font-bold text-center mb-6 text-navy dark:text-text-primary-dark">{t.signupTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.firstName}</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border-border-light dark:border-border-dark rounded-xl focus:ring-teal"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.lastName}</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border-border-light dark:border-border-dark rounded-xl focus:ring-teal"/>
            </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.username}</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border-border-light dark:border-border-dark rounded-xl focus:ring-teal"/>
        </div>
        <div>
          <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.password}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border-border-light dark:border-border-dark rounded-xl focus:ring-teal"/>
        </div>
        <div>
          <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">{t.confirmPassword}</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-3 bg-muted dark:bg-bg-dark border-border-light dark:border-border-dark rounded-xl focus:ring-teal"/>
        </div>

        {error && <p className="text-coral dark:text-coral-dark text-sm text-center py-2">{error}</p>}

        <p className="text-xs text-center text-text-secondary dark:text-text-secondary-dark">{t.guestHint}</p>

        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-teal hover:bg-opacity-90 disabled:bg-gray-400">
          {loading ? <FaSpinner className="animate-spin" /> : t.create}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link to={PATHS.AUTH_LOGIN} className="text-sm text-teal dark:text-teal-dark hover:underline">
          لديك حساب بالفعل؟ تسجيل الدخول
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
