import * as React from 'react';
import { AppContext } from '../../contexts/AppContext';
import ReportFormPage from '../../pages/ReportFormPage';
import * as api from '../../services/mockApi';
import Spinner from '../Spinner';
import { PATHS } from '../../constants';

const SuperAdminReportCreator: React.FC = () => {
  const { setTempUserOverride, startWizard, isWizardActive, resetWizard } = React.useContext(AppContext);
  const [isPreparing, setIsPreparing] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const prepareAnonymousSession = async () => {
      // Create a new anonymous user for this session
      const anonymousUser = await api.createAnonymousUser();
      if (isMounted) {
        // BUG FIX: Await the user override to ensure the session is fully set in context
        // before proceeding to start the wizard. This prevents a race condition.
        await setTempUserOverride(anonymousUser);
        
        // We must start the wizard AFTER setting the user override
        // to ensure all subsequent components have the correct context.
        startWizard();
        setIsPreparing(false);
      }
    };

    // Only prepare a new session if the wizard isn't already active.
    // This prevents re-creating users if the component re-renders.
    if (!isWizardActive) {
      prepareAnonymousSession();
    } else {
      // If the wizard is already active, we can just show the page.
      setIsPreparing(false);
    }

    // On unmount, clean up by resetting the wizard and clearing the user override.
    return () => {
      isMounted = false;
      resetWizard();
      setTempUserOverride(null);
    };
    // The dependency array is intentionally empty to run this logic only once on mount and cleanup on unmount.
    // Functions from context are stable and don't need to be dependencies.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show a spinner while the anonymous user is being created and the wizard is being initialized.
  if (isPreparing || !isWizardActive) {
      return <div className="h-full w-full flex items-center justify-center bg-sand dark:bg-bg-dark"><Spinner /></div>
  }

  // Once prepared, render the existing citizen report form page.
  // It will now use the temporary anonymous user from AppContext.
  return <ReportFormPage onSuccessRedirectPath={PATHS.SUPER_ADMIN_REPORTS} />;
};

export default SuperAdminReportCreator;