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

export const getAllUsers = async (): Promise<any[]> => {
  const users = await apiRequest('/users/all');
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
 * Fetch report history by report ID
 */
export const fetchHistoryByReportId = async (reportId: string): Promise<any[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch report history');
  }
  
  return await response.json();
};

/**
 * Fetch all report history (Super Admin only)
 */
export const fetchAllReportHistory = async (): Promise<any[]> => {
  // For now, we'll fetch all reports and their histories
  // In production, you might want a dedicated endpoint for this
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/reports`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  
  const reports = await response.json();
  
  // Fetch history for each report
  const allHistory = await Promise.all(
    reports.map(async (report: any) => {
      try {
        return await fetchHistoryByReportId(report.id);
      } catch (error) {
        console.error(`Failed to fetch history for report ${report.id}:`, error);
        return [];
      }
    })
  );
  
  // Flatten the array
  return allHistory.flat();
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
  return await getAllUsers(); // Changed from getAllPortalUsers to get ALL users including citizens
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
 * Fetch audit logs (Super Admin only)
 */
export const fetchAuditLogs = async (filters?: { entity_type?: string; actor_id?: string; limit?: number; offset?: number }): Promise<any[]> => {
  const token = getAuthToken();
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.entity_type) params.append('entity_type', filters.entity_type);
    if (filters.actor_id) params.append('actor_id', filters.actor_id);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
  }
  
  const url = `${API_BASE_URL}/audit-logs${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }
  
  const data = await response.json();
  return data.logs || [];
};

/**
 * Delete report and all associated data
 */
export const deleteReportAndAssociatedData = async (reportId: string, user?: any): Promise<void> => {
  await deleteReport(reportId);
};

/**
 * Update user (admin function - Super Admin only)
 */
export const updateUser = async (userId: string, updates: any, adminUser?: any): Promise<any> => {
  const token = getAuthToken();
  
  // If updating self, use the PATCH /users/me endpoint
  if (userId === adminUser?.id) {
    return await updateCurrentUser(updates);
  }
  
  // Otherwise, use the admin PATCH /users/:id endpoint (requires super_admin role)
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
  
  return await response.json();
};

/**
 * Create admin user (Super Admin only)
 */
export const createAdminUser = async (userData: any, adminUser?: any): Promise<any> => {
  const token = getAuthToken();
  
  // Use the new POST /api/users endpoint (requires super_admin role)
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create admin user');
  }
  
  return await response.json();
};

/**
 * Update dynamic category (Super Admin only) - NOW IMPLEMENTED
 */
export const updateDynamicCategory = async (category: any, adminUser?: any): Promise<void> => {
  await updateCategory(category.id, category);
};

/**
 * Add dynamic category (Super Admin only) - NOW IMPLEMENTED
 */
export const addDynamicCategory = async (category: any, adminUser?: any): Promise<void> => {
  await createCategory(category);
};

/**
 * Delete dynamic category (Super Admin only) - NOW IMPLEMENTED
 */
export const deleteDynamicCategory = async (categoryId: string, categoryName: string, adminUser?: any): Promise<void> => {
  await deleteCategory(categoryId);
};

/**
 * Update dynamic badge (Super Admin only) - NOW IMPLEMENTED
 */
export const updateDynamicBadge = async (badge: any, adminUser?: any): Promise<void> => {
  await updateBadge(badge.id, badge);
};

/**
 * Add dynamic badge (Super Admin only) - NOW IMPLEMENTED
 */
export const addDynamicBadge = async (badge: any, adminUser?: any): Promise<void> => {
  await createBadge(badge);
};

/**
 * Delete dynamic badge (Super Admin only) - NOW IMPLEMENTED
 */
export const deleteDynamicBadge = async (badgeId: string, badgeName: string, adminUser?: any): Promise<void> => {
  await deleteBadge(badgeId);
};

// --- Additional Functions for Compatibility ---

/**
 * Fetch trending reports (with backend algorithm)
 */
export const fetchTrendingReports = async (municipality?: string, limit: number = 20): Promise<any[]> => {
  const params = new URLSearchParams();
  if (municipality) params.append('municipality', municipality);
  params.append('limit', limit.toString());
  
  const url = `${API_BASE_URL}/reports/trending${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch trending reports');
  }
  
  return await response.json();
};

/**
 * Fetch leaderboard users (alias for getLeaderboard)
 */
export const fetchLeaderboardUsers = async (): Promise<any[]> => {
  return getLeaderboard(50);
};

// --- Configuration API ---

/**
 * Get all dynamic categories
 */
export const getDynamicCategories = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/config/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  const data = await response.json();
  return data.categories;
};

/**
 * Create new category (Super Admin only)
 */
export const createCategory = async (categoryData: {
  name_en: string;
  name_ar: string;
  icon: string;
  color: string;
  is_active?: boolean;
}): Promise<any> => {
  return apiRequest('/config/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

/**
 * Update category (Super Admin only)
 */
export const updateCategory = async (categoryId: string, updates: any): Promise<any> => {
  return apiRequest(`/config/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete category (Super Admin only)
 */
export const deleteCategory = async (categoryId: string): Promise<any> => {
  return apiRequest(`/config/categories/${categoryId}`, {
    method: 'DELETE',
  });
};

/**
 * Get all gamification badges
 */
export const getDynamicBadges = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/config/badges`);
  if (!response.ok) {
    throw new Error('Failed to fetch badges');
  }
  const data = await response.json();
  return data.badges;
};

/**
 * Create new badge (Super Admin only)
 */
export const createBadge = async (badgeData: {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  points_reward: number;
  is_active?: boolean;
}): Promise<any> => {
  return apiRequest('/config/badges', {
    method: 'POST',
    body: JSON.stringify(badgeData),
  });
};

/**
 * Update badge (Super Admin only)
 */
export const updateBadge = async (badgeId: string, updates: any): Promise<any> => {
  return apiRequest(`/config/badges/${badgeId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Delete badge (Super Admin only)
 */
export const deleteBadge = async (badgeId: string): Promise<any> => {
  return apiRequest(`/config/badges/${badgeId}`, {
    method: 'DELETE',
  });
};

/**
 * Get gamification settings
 */
export const getGamificationSettings = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/config/gamification`);
  if (!response.ok) {
    throw new Error('Failed to fetch gamification settings');
  }
  return response.json();
};

/**
 * Update gamification settings (Super Admin only)
 */
export const updateGamificationSettings = async (settings: {
  pointsRules: Array<{ id: string; points: number; description: string }>;
}): Promise<any> => {
  return apiRequest('/config/gamification', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// --- AI API ---

/**
 * Analyze media using AI
 */
export const analyzeMedia = async (params: {
  mediaData: string;
  mimeType: string;
  language?: string;
  availableCategories?: string[];
}): Promise<{ category: string; title: string; description: string }> => {
  return apiRequest('/ai/analyze-media', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

/**
 * Detect municipality from GPS coordinates
 */
export const detectMunicipality = async (latitude: number, longitude: number): Promise<{
  municipality: string;
  region: string;
  address: string;
}> => {
  return apiRequest('/ai/detect-municipality', {
    method: 'POST',
    body: JSON.stringify({ latitude, longitude }),
  });
};

/**
 * Transcribe audio to text
 */
export const transcribeAudio = async (params: {
  audioData: string;
  mimeType: string;
  language?: string;
}): Promise<{ text: string }> => {
  return apiRequest('/ai/transcribe-audio', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

// Export helper functions
export { getAuthToken, setAuthToken, clearAuthToken };
