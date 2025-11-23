import { apiRequest } from './core.service';
import { Comment } from '../types';
import { getNotifications } from './notifications.service';

export const addComment = async (reportId: string, text: string, user?: any): Promise<{ comment: Comment; newNotifications: any[] }> => {
    const comment = await apiRequest<Comment>('/comments', {
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

export const getCommentsByReportId = async (reportId: string): Promise<Comment[]> => {
    return apiRequest<Comment[]>(`/comments/report/${reportId}`);
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

/**
 * @deprecated Use getCommentsByReportId() instead
 */
export const fetchCommentsByReportId = async (reportId: string): Promise<Comment[]> => {
    return await getCommentsByReportId(reportId);
};
