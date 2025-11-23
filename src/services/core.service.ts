import { User } from '../types';

import { APP_CONFIG } from '../constants/config';

export const API_BASE_URL = APP_CONFIG.API_BASE_URL;

// --- Helper Functions ---

/**
 * Get the auth token from localStorage
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

/**
 * Set the auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
};

/**
 * Remove the auth token from localStorage
 */
export const clearAuthToken = (): void => {
    localStorage.removeItem('auth_token');
};

/**
 * Make an authenticated API request
 */
export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}, requireAuth: boolean = true): Promise<T> => {
    const token = localStorage.getItem('auth_token'); // Fixed key consistency (was mshkltk-token in one place)
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Only require auth if explicitly requested and no token exists
    if (requireAuth && !token) {
        throw new Error('No token provided');
    }

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
export const transformUser = (user: any): User | null => {
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
    } as User;
};
