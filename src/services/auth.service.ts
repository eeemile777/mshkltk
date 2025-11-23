import { apiRequest, setAuthToken, clearAuthToken, transformUser } from './core.service';
import { User } from '../types';

export const register = async (userData: {
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
}): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }, false);

    setAuthToken(response.token);
    return { ...response, user: transformUser(response.user) as User };
};

export const login = async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    }, false);

    setAuthToken(response.token);
    return { ...response, user: transformUser(response.user) as User };
};

export const logout = (): void => {
    clearAuthToken();
};

export const verifyToken = async (): Promise<{ valid: boolean; user?: User }> => {
    try {
        const response = await apiRequest<{ valid: boolean; user?: any }>('/auth/verify', { method: 'POST' });
        return { ...response, user: response.user ? transformUser(response.user) as User : undefined };
    } catch {
        return { valid: false };
    }
};
