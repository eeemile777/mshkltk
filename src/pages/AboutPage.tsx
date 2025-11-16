import React from 'react';
import { AppContext } from '../contexts/AppContext';

const AboutPage: React.FC = () => {
  const { t } = React.useContext(AppContext);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-card dark:bg-surface-dark p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4 text-teal dark:text-teal-dark">{t.appTitle}</h1>
        <p className="text-lg text-text-secondary dark:text-text-secondary-dark mb-8">{t.about}</p>
        
        <div className="border-t border-border-light dark:border-border-dark my-6"></div>

        <h2 className="text-2xl font-bold mb-3 text-navy dark:text-text-primary-dark">{t.mission}</h2>
        <p className="text-text-secondary dark:text-text-secondary-dark leading-relaxed mb-6">
          {t.mission}
        </p>

        <h2 className="text-2xl font-bold mb-3 text-navy dark:text-text-primary-dark">{t.contact}</h2>
        <p className="text-text-secondary dark:text-text-secondary-dark">
          <a href="mailto:contact@mshkltk.app" className="text-teal dark:text-teal-dark hover:underline">
            contact@mshkltk.app
          </a>
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
