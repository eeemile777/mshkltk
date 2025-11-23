import { apiRequest, getAuthToken } from './core.service';
import { Report, ReportFilters, ReportStatus } from '../types';
import { getNotifications } from './notifications.service';

export const createReport = async (reportData: any): Promise<any> => {
    return apiRequest('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
    });
};

export const fetchReports = (filters?: ReportFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.municipalityId) params.append('municipality_id', filters.municipalityId);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    // Allow guests to fetch reports without authentication
    return apiRequest<Report[]>(`/reports${queryString ? `?${queryString}` : ''}`, {}, false);
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

/**
 * Fetch report history by report ID
 */
export const fetchHistoryByReportId = async (reportId: string): Promise<any[]> => {
    const response = await apiRequest<{ history: any[] }>(`/reports/${reportId}/history`);
    return response.history || [];
};

/**
 * Fetch all report history (Super Admin only)
 */
export const fetchAllReportHistory = async (): Promise<any[]> => {
    // PERFORMANCE FIX: Use bulk fetch endpoint instead of N+1 queries
    return apiRequest<any[]>('/reports/history/all');
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

/**
 * Delete report and all associated data
 */
export const deleteReportAndAssociatedData = async (reportId: string, user?: any): Promise<void> => {
    await deleteReport(reportId);
};

/**
 * Fetch trending reports (with backend algorithm)
 */
export const fetchTrendingReports = async (municipality?: string, limit: number = 20): Promise<any[]> => {
    const params = new URLSearchParams();
    if (municipality) params.append('municipality', municipality);
    params.append('limit', limit.toString());

    const queryString = params.toString();
    return apiRequest(`/reports/trending${queryString ? `?${queryString}` : ''}`, {}, false);
};
