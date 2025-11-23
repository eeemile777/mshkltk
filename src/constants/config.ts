export const APP_CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    DEFAULT_COORDINATES: {
        lat: 33.8938,
        lng: 35.5018, // Beirut
    },
    DEFAULT_MAP_ZOOM: 13,
    DEFAULT_SEARCH_RADIUS_KM: 5,
    PAGINATION: {
        DEFAULT_LIMIT: 20,
        DEFAULT_OFFSET: 0,
    },
    MAP_TILE_LAYER: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    MAP_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    DATE_FORMAT: 'MMM d, yyyy',
    DATETIME_FORMAT: 'MMM d, yyyy h:mm a',
};

export const REPORT_STATUSES = {
    NEW: 'new',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
} as const;

export const REPORT_SEVERITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export const USER_ROLES = {
    CITIZEN: 'citizen',
    MUNICIPALITY: 'municipality',
    SUPER_ADMIN: 'super_admin',
    UTILITY: 'utility',
    UNION: 'union_of_municipalities',
} as const;
