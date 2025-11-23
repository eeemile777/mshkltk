import { apiRequest } from './core.service';

export const uploadMedia = async (base64Data: string, folder = 'reports'): Promise<{ url: string }> => {
    return apiRequest<{ url: string }>('/media/upload', {
        method: 'POST',
        body: JSON.stringify({ base64Data, folder }),
    });
};

export const uploadMultipleMedia = async (base64Array: string[], folder = 'reports'): Promise<{ urls: string[] }> => {
    return apiRequest<{ urls: string[] }>('/media/upload-multiple', {
        method: 'POST',
        body: JSON.stringify({ base64Array, folder }),
    });
};

export const getMediaStatus = async (): Promise<{ configured: boolean; message: string }> => {
    return apiRequest<{ configured: boolean; message: string }>('/media/status');
};
