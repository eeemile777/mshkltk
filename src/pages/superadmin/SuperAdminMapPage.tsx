import React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import InteractiveMap from '../../components/InteractiveMap';
import Spinner from '../../components/Spinner';
import ErrorBoundary from '../../components/ErrorBoundary';
import { ICON_MAP, CATEGORIES } from '../../constants';
import { ReportCategory } from '../../types';

const SuperAdminMapPage: React.FC = () => {
  const { allReports, loading, categories: dynamicCategories } = React.useContext(SuperAdminContext);
  const { t } = React.useContext(AppContext);

  const categoriesObject = React.useMemo(() => {
    // FIX: Changed reduce to start with a copy of the static CATEGORIES object.
    // This ensures a fully-typed object is always returned, satisfying the 'categoriesOverride' prop type.
    // Dynamic categories will overwrite the static defaults.
    return (dynamicCategories || []).reduce((acc, cat) => {
        acc[cat.id as ReportCategory] = {
            icon: ICON_MAP[cat.icon] || ICON_MAP['FaQuestion'],
            color: { light: cat.color_light, dark: cat.color_dark },
            name_en: cat.name_en,
            name_ar: cat.name_ar,
            subCategories: cat.subCategories.reduce((subAcc, sub) => {
                (subAcc as any)[sub.id] = { name_en: sub.name_en, name_ar: sub.name_ar };
                return subAcc;
            }, {})
        };
        return acc;
    }, { ...CATEGORIES });
  }, [dynamicCategories]);


  if (loading) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Spinner />
        </div>
    );
  }

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg -m-6">
      <ErrorBoundary fallback={
        <div className="h-full flex items-center justify-center bg-muted dark:bg-bg-dark">
          <div className="text-center p-8">
            <p className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">
              Map Loading Error
            </p>
            <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
              Please refresh the page (Cmd+Shift+R)
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal-dark transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }>
        <InteractiveMap
          reports={allReports}
          reportPathPrefix="/superadmin/reports/:id"
          hideUserLocationMarker={true}
          categoriesOverride={categoriesObject}
        />
      </ErrorBoundary>
    </div>
  );
};

export default SuperAdminMapPage;
