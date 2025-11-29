import { updateCurrentUser, getCurrentUser } from './users.service';
import { register as authRegister, login as authLogin } from './auth.service';
import {
    createReport,
    getReportById,
    subscribeToReport,
    unsubscribeFromReport
} from './reports.service';
import { getNotifications } from './notifications.service';
import { getCommentsByReportId } from './comments.service';

// --- Legacy Mock API Compatibility Layer ---

/**
 * @deprecated Use getCurrentUser() instead
 */
export const setCurrentUser = async (user: any, isTemporary?: boolean): Promise<void> => {
    console.warn('setCurrentUser is deprecated - session is managed by JWT');
};

/**
 * @deprecated Use register() instead
 */
export const createUser = async (userData: any): Promise<any> => {
    const response = await authRegister(userData);
    return response.user;
};

/**
 * @deprecated Anonymous users should be handled differently in production
 * For now, creates a temporary account
 */
export const createAnonymousUser = async (): Promise<any> => {
    const randomId = Math.random().toString(36).substring(2, 11);
    const response = await authRegister({
        username: `guest_${randomId}`,
        password: `Temp_${Date.now()}123`, // Meets complexity: Uppercase, Lowercase, Number, >8 chars
        first_name: 'Guest',
    });
    
    // Mark user as anonymous in the backend
    try {
        await updateCurrentUser({ is_anonymous: true });
    } catch (err) {
        console.warn('Failed to mark user as anonymous:', err);
    }
    
    return { ...response.user, is_anonymous: true };
};

/**
 * @deprecated Use register() with user update instead
 */
export const upgradeAnonymousUser = async (currentUser: any, userData: any): Promise<any> => {
    return await updateCurrentUser(userData);
};

/**
 * @deprecated Use login() instead
 */
export const loginUser = async (credentials: any): Promise<any> => {
    const response = await authLogin(credentials.username, credentials.password);
    return response.user;
};


/**
 * Legacy function: Submit a report
 */
export const submitReport = async (reportData: any, user?: any): Promise<any> => {
    return await createReport(reportData);
};

/**
 * Legacy function: Toggle subscription
 */
export const toggleSubscription = async (reportId: string, userId: string): Promise<{ report: any; user: any; newNotifications: any[] }> => {
    const currentUser = await getCurrentUser();
    const isSubscribed = currentUser?.subscribedReportIds?.includes(reportId);

    if (isSubscribed) {
        await unsubscribeFromReport(reportId);
    } else {
        await subscribeToReport(reportId);
    }

    const [updatedUser, updatedReport] = await Promise.all([
        getCurrentUser(),
        getReportById(reportId),
    ]);

    return {
        report: updatedReport,
        user: updatedUser,
        newNotifications: [],
    };
};
