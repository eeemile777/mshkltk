import { apiRequest } from './core.service';
import { Notification } from '../types';

export const getNotifications = async (limit = 50, offset = 0): Promise<Notification[]> => {
    return apiRequest<Notification[]>(`/notifications?limit=${limit}&offset=${offset}`);
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
    return apiRequest<{ count: number }>('/notifications/unread-count');
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

/**
 * @deprecated Use getNotifications() instead
 */
export const fetchNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    return await getNotifications();
};
