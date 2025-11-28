import { apiRequest } from './core.service';
import { APP_CONFIG } from '../constants/config';
import { DynamicCategory, DynamicBadge } from '../types';

export const getDynamicCategories = async (): Promise<DynamicCategory[]> => {
    const response = await apiRequest<{ categories: any[] }>(
        '/config/categories',
        {},
        false
    );
    const categories = Array.isArray(response.categories) ? response.categories : [];
    // Normalize backend snake_case to frontend expected shape
    return categories.map((cat: any) => {
        const subCats = Array.isArray(cat.subCategories)
            ? cat.subCategories
            : Array.isArray(cat.sub_categories)
            ? cat.sub_categories
            : [];
        return {
            id: cat.id,
            name_en: cat.name_en,
            name_ar: cat.name_ar,
            icon: cat.icon,
            color_light: cat.color_light ?? cat.color,
            color_dark: cat.color_dark ?? cat.color_dark ?? cat.color_light ?? cat.color,
            is_active: cat.is_active ?? true,
            // Convert subcategory items to expected shape { id, name_en, name_ar }
            subCategories: subCats.map((sub: any) => ({
                id: sub.id,
                name_en: sub.name_en ?? sub.label_en ?? sub.name,
                name_ar: sub.name_ar ?? sub.label_ar ?? sub.name,
            })),
        } as DynamicCategory;
    });
};

export const createCategory = async (categoryData: any): Promise<any> => {
    // Map frontend field names to backend (supports both label and name)
    const payload = {
        id: categoryData.id,
        name_en: categoryData.name_en,
        name_ar: categoryData.name_ar,
        label_en: categoryData.name_en, // Backend accepts both
        label_ar: categoryData.name_ar,
        icon: categoryData.icon,
        color: categoryData.color || categoryData.color_light || '#4A90E2',
        color_dark: categoryData.color_dark || categoryData.color || '#4A90E2',
        sub_categories: categoryData.subCategories || categoryData.sub_categories || [],
        is_active: categoryData.is_active ?? true,
    };
    return apiRequest('/config/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const updateCategory = async (categoryId: string, updates: any): Promise<any> => {
    // Map frontend field names to backend (supports both label and name)
    const payload: any = {};
    if (updates.name_en !== undefined) {
        payload.name_en = updates.name_en;
        payload.label_en = updates.name_en; // Sync both fields
    }
    if (updates.name_ar !== undefined) {
        payload.name_ar = updates.name_ar;
        payload.label_ar = updates.name_ar; // Sync both fields
    }
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.color_light !== undefined) {
        payload.color = updates.color_light;
        payload.color_dark = updates.color_dark || updates.color_light;
    }
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.color_dark !== undefined) payload.color_dark = updates.color_dark;
    if (updates.subCategories !== undefined) payload.sub_categories = updates.subCategories;
    if (updates.sub_categories !== undefined) payload.sub_categories = updates.sub_categories;
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;

    return apiRequest(`/config/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
};

export const deleteCategory = async (categoryId: string): Promise<any> => {
    return apiRequest(`/config/categories/${categoryId}`, {
        method: 'DELETE',
    });
};

export const getDynamicBadges = async (): Promise<DynamicBadge[]> => {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/config/badges`);
    if (!response.ok) {
        throw new Error('Failed to fetch badges');
    }
    const data = await response.json();
    return data.badges;
};

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

export const updateBadge = async (badgeId: string, updates: any): Promise<any> => {
    return apiRequest(`/config/badges/${badgeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
};

export const deleteBadge = async (badgeId: string): Promise<any> => {
    return apiRequest(`/config/badges/${badgeId}`, {
        method: 'DELETE',
    });
};

export const getGamificationSettings = async (): Promise<any> => {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/config/gamification`);
    if (!response.ok) {
        throw new Error('Failed to fetch gamification settings');
    }
    return response.json();
};

export const updateGamificationSettings = async (settings: {
    pointsRules: Array<{ id: string; points: number; description: string }>;
}): Promise<any> => {
    return apiRequest('/config/gamification', {
        method: 'PUT',
        body: JSON.stringify(settings),
    });
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
