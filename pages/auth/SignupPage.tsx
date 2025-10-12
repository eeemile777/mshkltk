import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';
import { FaSpinner, FaCamera, FaArrowLeft } from 'react-icons/fa6';
import { getAvatarUrl, DEFAULT_AVATAR_URL } from '../../data/mockImages';

const SignupPage: React.FC = () => {
  const { t, signup } = React.useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isUpgrading = location.state?.upgrading === true;
  
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [avatarPreview, setAvatarPreview] = React.useState(DEFAULT_AVATAR_URL);
  
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      await signup({ 
          first_name: firstName, 
          last_name: lastName, 
          username, 
          password,
          avatarUrl: avatarPreview 
      }, { upgradingFromGuest: isUpgrading });
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
    <div className="bg-card dark:bg-surface-dark p-8 rounded-2xl shadow-lg w-full relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-text-primary-dark transition-colors" aria-label="Go back">
        <FaArrowLeft size={20} />
      </button>

      <h2 className="text-3xl font-bold text-center mb-6 text-navy dark:text-text-primary-dark">{t.signupTitle}</h2>
      
      <div className="flex justify-center mb-6">
          <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
          <button type="button" onClick={() => avatarInputRef.current?.click()} className="relative w-32 h-32 rounded-full group ring-4 ring-teal/50">
            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full rounded-full object-cover" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera size={32} />
            </div>
          </button>
      </div>

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
          {t.alreadyHaveAccount}
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;