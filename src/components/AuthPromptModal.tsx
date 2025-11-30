import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS } from '../constants';

const AuthPromptModal: React.FC = () => {
  const { isAuthPromptOpen, closeAuthPrompt, t } = React.useContext(AppContext);
  const navigate = useNavigate();



  if (!isAuthPromptOpen) return null;

  const handleSignup = () => {
    closeAuthPrompt();
    navigate(PATHS.AUTH_SIGNUP);
  };

  const handleLogin = () => {
    closeAuthPrompt();
    navigate(PATHS.AUTH_LOGIN);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={closeAuthPrompt} />
      <div className="relative bg-card dark:bg-surface-dark rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <button
          className="absolute top-3 end-3 text-text-secondary dark:text-text-secondary-dark"
          onClick={closeAuthPrompt}
          aria-label={t.close}
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-2">
          {t.createAccountToReport}
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
          {t.createAccountToReportSubtitle}
        </p>
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-teal text-white font-semibold"
            onClick={handleSignup}
          >
            {t.signup}
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-muted dark:bg-bg-dark text-navy dark:text-text-primary-dark font-semibold"
            onClick={handleLogin}
          >
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
