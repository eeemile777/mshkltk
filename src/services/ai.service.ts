import { apiRequest } from './core.service';

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
