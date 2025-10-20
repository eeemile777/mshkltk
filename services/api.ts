/**
 * Real API Service
 * This file replaces mockApi.ts and connects to the actual backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// --- Helper Functions ---

/**
 * Get the auth token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Set the auth token in localStorage
 */
const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove the auth token from localStorage
 */
const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Make an authenticated API request
 */
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

/**
 * Transform user data from backend (snake_case) to frontend (camelCase)
 */
const transformUser = (user: any): any => {
  if (!user) return null;
  
  return {
    ...user,
    // Transform snake_case to camelCase
    reportsConfirmed: user.reports_confirmed ?? user.reportsConfirmed ?? 0,
    reports_count: user.reports_count ?? 0, // Keep snake_case for backward compatibility
    avatarUrl: user.avatar_url ?? user.avatarUrl,
    display_name: user.display_name, // Keep for backward compatibility
    first_name: user.first_name, // Keep for backward compatibility
    last_name: user.last_name, // Keep for backward compatibility
    is_anonymous: user.is_anonymous ?? false, // Keep for backward compatibility
    is_active: user.is_active ?? true, // Keep for backward compatibility
    onboarding_complete: user.onboarding_complete ?? false, // Keep for backward compatibility
    municipality_id: user.municipality_id, // Keep for backward compatibility
    portal_access_level: user.portal_access_level, // Keep for backward compatibility
    subscribedReportIds: user.subscribed_report_ids ?? user.subscribedReportIds ?? [],
    confirmedReportIds: user.confirmed_report_ids ?? user.confirmedReportIds ?? [],
    created_at: user.created_at, // Keep for backward compatibility
  };
};

// --- Authentication ---

export const register = async (userData: {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}): Promise<{ user: any; token: string }> => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  setAuthToken(response.token);
  return { ...response, user: transformUser(response.user) };
};

export const login = async (username: string, password: string): Promise<{ user: any; token: string }> => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setAuthToken(response.token);
  return { ...response, user: transformUser(response.user) };
};

export const logout = (): void => {
  clearAuthToken();
};

export const verifyToken = async (): Promise<{ valid: boolean; user?: any }> => {
  try {
    const response = await apiRequest('/auth/verify', { method: 'POST' });
    return { ...response, user: response.user ? transformUser(response.user) : undefined };
  } catch {
    return { valid: false };
  }
};

// --- Reports ---

export const createReport = async (reportData: any): Promise<any> => {
  return apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
};

export const getReports = async (filters?: {
  municipality?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
  }

  const queryString = params.toString();
  return apiRequest(`/reports${queryString ? `?${queryString}` : ''}`);
};

export const getReportById = async (reportId: string): Promise<any> => {
  return apiRequest(`/reports/${reportId}`);
};

export const getNearbyReports = async (lat: number, lng: number, radius = 5): Promise<any[]> => {
  return apiRequest(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
};

export const updateReport = async (reportId: string, updates: any): Promise<any> => {
  return apiRequest(`/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const confirmReport = async (reportId: string, user?: any): Promise<{ report: any; newNotifications: any[] }> => {
  const report = await apiRequest(`/reports/${reportId}/confirm`, { method: 'POST' });
  
  // Fetch any new notifications that may have been generated
  // In production, the backend should return these directly
  const notifications = await getNotifications(10, 0);
  
  return {
    report,
    newNotifications: notifications.filter((n: any) => 
      n.report_id === reportId && !n.read
    ),
  };
};

export const subscribeToReport = async (reportId: string): Promise<any> => {
  return apiRequest(`/reports/${reportId}/subscribe`, { method: 'POST' });
};

export const unsubscribeFromReport = async (reportId: string): Promise<any> => {
  return apiRequest(`/reports/${reportId}/subscribe`, { method: 'DELETE' });
};

export const deleteReport = async (reportId: string): Promise<any> => {
  return apiRequest(`/reports/${reportId}`, { method: 'DELETE' });
};

export const getReportStats = async (municipality?: string): Promise<any> => {
  const queryString = municipality ? `?municipality=${municipality}` : '';
  return apiRequest(`/reports/stats${queryString}`);
};

// --- Comments ---

export const addComment = async (reportId: string, text: string, user?: any): Promise<{ comment: any; newNotifications: any[] }> => {
  const comment = await apiRequest('/comments', {
    method: 'POST',
    body: JSON.stringify({ report_id: reportId, text }),
  });

  // Fetch any new notifications that may have been generated
  // The backend creates notifications automatically when a comment is added
  const notifications = await getNotifications(10, 0);
  
  return {
    comment,
    newNotifications: notifications.filter((n: any) => 
      n.report_id === reportId && !n.read
    ),
  };
};

export const getCommentsByReportId = async (reportId: string): Promise<any[]> => {
  return apiRequest(`/comments/report/${reportId}`);
};

export const updateComment = async (commentId: string, text: string): Promise<any> => {
  return apiRequest(`/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  });
};

export const deleteComment = async (commentId: string): Promise<any> => {
  return apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
};

// --- Notifications ---

export const getNotifications = async (limit = 50, offset = 0): Promise<any[]> => {
  return apiRequest(`/notifications?limit=${limit}&offset=${offset}`);
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  return apiRequest('/notifications/unread-count');
};

export const markNotificationAsRead = async (notificationId: string): Promise<any> => {
  return apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
};

export const markAllNotificationsAsRead = async (): Promise<any> => {
  return apiRequest('/notifications/mark-all-read', { method: 'POST' });
};

export const deleteNotification = async (notificationId: string): Promise<any> => {
  return apiRequest(`/notifications/${notificationId}`, { method: 'DELETE' });
};

export const deleteAllNotifications = async (): Promise<any> => {
  return apiRequest('/notifications', { method: 'DELETE' });
};

// --- Users ---

export const getCurrentUser = async (): Promise<any> => {
  const user = await apiRequest('/users/me');
  return transformUser(user);
};

export const getUserById = async (userId: string): Promise<any> => {
  const user = await apiRequest(`/users/${userId}`);
  return transformUser(user);
};

export const updateCurrentUser = async (updates: any): Promise<any> => {
  const user = await apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return transformUser(user);
};

export const getLeaderboard = async (limit = 50): Promise<any[]> => {
  const users = await apiRequest(`/users/leaderboard?limit=${limit}`);
  return users.map(transformUser);
};

export const getAllPortalUsers = async (): Promise<any[]> => {
  const users = await apiRequest('/users/portal/all');
  return users.map(transformUser);
};

export const deleteUser = async (userId: string): Promise<any> => {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' });
};

// --- Media ---

export const uploadMedia = async (base64Data: string, folder = 'reports'): Promise<{ url: string }> => {
  return apiRequest('/media/upload', {
    method: 'POST',
    body: JSON.stringify({ base64Data, folder }),
  });
};

export const uploadMultipleMedia = async (base64Array: string[], folder = 'reports'): Promise<{ urls: string[] }> => {
  return apiRequest('/media/upload-multiple', {
    method: 'POST',
    body: JSON.stringify({ base64Array, folder }),
  });
};

export const getMediaStatus = async (): Promise<{ configured: boolean; message: string }> => {
  return apiRequest('/media/status');
};

// --- Legacy Mock API Compatibility Layer ---
// These functions maintain compatibility with the frontend code that still references mockApi patterns.
// They map to the new real API endpoints above.

/**
 * @deprecated Use getCurrentUser() instead
 */
export const setCurrentUser = async (user: any, isTemporary?: boolean): Promise<void> => {
  // This was used in mockApi to set session storage. Now it's a no-op since JWT handles session.
  // The backend manages authentication state via JWT tokens.
  console.warn('setCurrentUser is deprecated - session is managed by JWT');
};

/**
 * @deprecated Use register() instead
 */
export const createUser = async (userData: any): Promise<any> => {
  const response = await register(userData);
  return response.user;
};

/**
 * @deprecated Anonymous users should be handled differently in production
 * For now, creates a temporary account
 */
export const createAnonymousUser = async (): Promise<any> => {
  const randomId = Math.random().toString(36).substring(2, 11);
  const response = await register({
    username: `guest_${randomId}`,
    password: `temp_${Date.now()}`,
    first_name: 'Guest',
  });
  return { ...response.user, is_anonymous: true };
};

/**
 * @deprecated Use register() with user update instead
 */
export const upgradeAnonymousUser = async (currentUser: any, userData: any): Promise<any> => {
  // In production, this should be a dedicated endpoint
  // For now, update the current user
  return await updateCurrentUser(userData);
};

/**
 * @deprecated Use login() instead
 */
export const loginUser = async (credentials: any): Promise<any> => {
  const response = await login(credentials.username, credentials.password);
  return response.user;
};

/**
 * @deprecated Use getReports() instead
 */
export const fetchReports = async (): Promise<any[]> => {
  return await getReports();
};

/**
 * @deprecated Use getNotifications() instead
 */
export const fetchNotificationsByUserId = async (userId: string): Promise<any[]> => {
  return await getNotifications();
};

/**
 * @deprecated Use getCommentsByReportId() instead
 */
export const fetchCommentsByReportId = async (reportId: string): Promise<any[]> => {
  return await getCommentsByReportId(reportId);
};

/**
 * Legacy function: Submit a report
 * The second parameter (user) is ignored since authentication is handled by JWT
 */
export const submitReport = async (reportData: any, user?: any): Promise<any> => {
  return await createReport(reportData);
};

/**
 * @deprecated Use updateCurrentUser() instead
 */
export const updateUserAvatar = async (avatarUrl: string): Promise<any> => {
  return await updateCurrentUser({ avatar_url: avatarUrl });
};

/**
 * Legacy function: Toggle subscription
 * Returns report, user, and notifications in the old format
 */
export const toggleSubscription = async (reportId: string, userId: string): Promise<{ report: any; user: any; newNotifications: any[] }> => {
  // Check current subscription status
  const currentUser = await getCurrentUser();
  const isSubscribed = currentUser.subscribedReportIds?.includes(reportId);

  // Toggle subscription
  if (isSubscribed) {
    await unsubscribeFromReport(reportId);
  } else {
    await subscribeToReport(reportId);
  }

  // Fetch updated data
  const [updatedUser, updatedReport] = await Promise.all([
    getCurrentUser(),
    getReportById(reportId),
  ]);

  return {
    report: updatedReport,
    user: updatedUser,
    newNotifications: [], // Notifications are fetched separately
  };
};

/**
 * Fetch report history (not yet implemented on backend)
 */
export const fetchHistoryByReportId = async (reportId: string): Promise<any[]> => {
  // TODO: Implement on backend
  console.warn('fetchHistoryByReportId not yet implemented on backend');
  return [];
};

/**
 * Fetch all report history (not yet implemented on backend)
 */
export const fetchAllReportHistory = async (): Promise<any[]> => {
  // TODO: Implement on backend
  console.warn('fetchAllReportHistory not yet implemented on backend');
  return [];
};

/**
 * Get current portal user
 */
export const getCurrentPortalUser = async (): Promise<any> => {
  return await getCurrentUser();
};

/**
 * List all users (Super Admin only)
 */
export const listUsers = async (): Promise<any[]> => {
  return await getAllPortalUsers();
};

/**
 * Update report status (legacy function for portal)
 */
export const updateReportStatus = async (
  reportId: string,
  status: string,
  resolution_photo_url?: string,
  user?: any
): Promise<any> => {
  const updates: any = { status };
  if (resolution_photo_url) {
    updates.resolution_photo_url = resolution_photo_url;
  }
  return await updateReport(reportId, updates);
};

// --- Super Admin Functions ---

/**
 * Get current super admin user
 */
export const getCurrentSuperAdminUser = async (): Promise<any> => {
  return await getCurrentUser();
};

/**
 * Fetch audit logs (not yet implemented on backend)
 */
export const fetchAuditLogs = async (): Promise<any[]> => {
  // TODO: Implement on backend
  console.warn('fetchAuditLogs not yet implemented on backend');
  return [];
};

/**
 * Delete report and all associated data
 */
export const deleteReportAndAssociatedData = async (reportId: string, user?: any): Promise<void> => {
  await deleteReport(reportId);
};

/**
 * Update user (admin function)
 */
export const updateUser = async (userId: string, updates: any, adminUser?: any): Promise<any> => {
  // In production, this should validate admin permissions
  // For now, map to the updateCurrentUser if it's the current user
  if (userId === adminUser?.id) {
    return await updateCurrentUser(updates);
  }
  // TODO: Implement admin update user endpoint on backend
  console.warn('updateUser for other users not yet implemented on backend');
  return updates;
};

/**
 * Create admin user
 */
export const createAdminUser = async (userData: any, adminUser?: any): Promise<any> => {
  // TODO: Implement on backend with proper role assignment
  return await register(userData);
};

/**
 * Update dynamic category (not yet implemented on backend)
 */
export const updateDynamicCategory = async (category: any, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('updateDynamicCategory not yet implemented on backend');
};

/**
 * Add dynamic category (not yet implemented on backend)
 */
export const addDynamicCategory = async (category: any, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('addDynamicCategory not yet implemented on backend');
};

/**
 * Delete dynamic category (not yet implemented on backend)
 */
export const deleteDynamicCategory = async (categoryId: string, categoryName: string, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('deleteDynamicCategory not yet implemented on backend');
};

/**
 * Update gamification settings (not yet implemented on backend)
 */
export const updateGamificationSettings = async (settings: any, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('updateGamificationSettings not yet implemented on backend');
};

/**
 * Update dynamic badge (not yet implemented on backend)
 */
export const updateDynamicBadge = async (badge: any, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('updateDynamicBadge not yet implemented on backend');
};

/**
 * Add dynamic badge (not yet implemented on backend)
 */
export const addDynamicBadge = async (badge: any, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('addDynamicBadge not yet implemented on backend');
};

/**
 * Delete dynamic badge (not yet implemented on backend)
 */
export const deleteDynamicBadge = async (badgeId: string, badgeName: string, adminUser?: any): Promise<void> => {
  // TODO: Implement on backend
  console.warn('deleteDynamicBadge not yet implemented on backend');
};

// Export helper functions
export { getAuthToken, setAuthToken, clearAuthToken };
