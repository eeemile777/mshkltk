import React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import InteractiveMap from '../../components/InteractiveMap';
import Spinner from '../../components/Spinner';
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
      <InteractiveMap
        reports={allReports}
        reportPathPrefix="/superadmin/reports/:id"
        hideUserLocationMarker={true}
        categoriesOverride={categoriesObject}
      />
    </div>
  );
};

export default SuperAdminMapPage;
