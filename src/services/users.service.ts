import { apiRequest, transformUser } from './core.service';
import { User } from '../types';

export const getCurrentUser = async (): Promise<User | null> => {
    const user = await apiRequest('/users/me');
    return transformUser(user);
};

export const getUserById = async (userId: string): Promise<User | null> => {
    const user = await apiRequest(`/users/${userId}`);
    return transformUser(user);
};

export const updateCurrentUser = async (updates: any): Promise<User | null> => {
    const user = await apiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
    return transformUser(user);
};

export const getLeaderboard = async (limit = 50): Promise<User[]> => {
    const users = await apiRequest<any[]>(`/users/leaderboard?limit=${limit}`);
    return users.map(transformUser).filter((u): u is User => u !== null);
};

export const getAllPortalUsers = async (): Promise<User[]> => {
    const users = await apiRequest<any[]>('/users/portal/all');
    return users.map(transformUser).filter((u): u is User => u !== null);
};

export const getAllUsers = async (): Promise<User[]> => {
    const users = await apiRequest<any[]>('/users/all');
    return users.map(transformUser).filter((u): u is User => u !== null);
};

export const deleteUser = async (userId: string): Promise<any> => {
    return apiRequest(`/users/${userId}`, { method: 'DELETE' });
};

/**
 * Get current portal user
 */
export const getCurrentPortalUser = async (): Promise<User | null> => {
    return await getCurrentUser();
};

/**
 * List all users (Super Admin only)
 */
export const listUsers = async (): Promise<User[]> => {
    return await getAllUsers();
};

/**
 * Get current super admin user
 */
export const getCurrentSuperAdminUser = async (): Promise<User | null> => {
    return await getCurrentUser();
};

/**
 * Fetch audit logs (Super Admin only)
 */
export const fetchAuditLogs = async (filters?: { entity_type?: string; actor_id?: string; limit?: number; offset?: number }): Promise<any[]> => {
    const params = new URLSearchParams();

    if (filters) {
        if (filters.entity_type) params.append('entity_type', filters.entity_type);
        if (filters.actor_id) params.append('actor_id', filters.actor_id);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const response = await apiRequest<{ logs: any[] }>(`/audit-logs${queryString ? `?${queryString}` : ''}`);
    return response.logs || [];
};

/**
 * Update user (admin function - Super Admin only)
 */
export const updateUser = async (userId: string, updates: any, adminUser?: any): Promise<any> => {
    // If updating self, use the PATCH /users/me endpoint
    if (userId === adminUser?.id) {
        return await updateCurrentUser(updates);
    }

    // Otherwise, use the admin PATCH /users/:id endpoint (requires super_admin role)
    return await apiRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });
};

/**
 * Create admin user (Super Admin only)
 */
export const createAdminUser = async (userData: any, adminUser?: any): Promise<any> => {
    return apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

/**
 * Fetch leaderboard users (alias for getLeaderboard)
 */
export const fetchLeaderboardUsers = async (): Promise<User[]> => {
    return getLeaderboard(50);
};

/**
 * @deprecated Use updateCurrentUser() instead
 */
export const updateUserAvatar = async (avatarUrl: string): Promise<any> => {
    return await updateCurrentUser({ avatar_url: avatarUrl });
};
