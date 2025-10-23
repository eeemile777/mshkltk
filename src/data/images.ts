import { ReportCategory } from '../types';

// --- Avatar Generator ---
// Creates a simple, colored SVG avatar with the first initial of a seed string.
const simpleHash = (str: string): number => {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// A palette of professional, brand-aligned colors.
const PALETTE = ['#00BFA6', '#FFA62B', '#0D3B66', '#4BA3C3', '#FF5A5F', '#417505', '#9013FE'];

export const getAvatarUrl = (seed: string): string => {
    const hash = Math.abs(simpleHash(seed));
    const backgroundColor = PALETTE[hash % PALETTE.length];
    const initial = (seed.charAt(0) || '?').toUpperCase();

    // A clean, modern SVG design for the avatar.
    const svg = `
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="${backgroundColor}" />
            <text
                x="50%"
                y="52%"
                dominant-baseline="middle"
                text-anchor="middle"
                font-family="Inter, -apple-system, sans-serif"
                font-size="50"
                font-weight="bold"
                fill="#FFFFFF">
                ${initial}
            </text>
        </svg>
    `;
    // FIX: Correctly encode the SVG string to handle Unicode characters before btoa.
    // This prevents errors if the seed (e.g., a username) contains non-Latin-1 characters.
    const encodedSvg = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encodedSvg}`;
};

// --- Anonymous User Avatar ---
const ANONYMOUS_AVATAR_SVG_STRING = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#E9E9E9'/><g fill='#C4C4C4'><circle cx='50' cy='38' r='22'/><path d='M12,100 C12,65 88,65 88,100 Z'/></g></svg>`;

const encodedAnonymousAvatar = btoa(unescape(encodeURIComponent(ANONYMOUS_AVATAR_SVG_STRING)));
export const DEFAULT_AVATAR_URL = `data:image/svg+xml;base64,${encodedAnonymousAvatar}`;

// --- Report Image Generator ---
// For reports without actual photos, generate a placeholder based on category
export const getReportImageUrl = (category: ReportCategory | string, index?: number): string => {
    // Simple placeholder - in production this would return actual uploaded image URLs
    return `https://picsum.photos/400/300?random=${category}${index || ''}`;
};