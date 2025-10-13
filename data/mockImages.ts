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
// This SVG creates the generic person icon as requested.
const ANONYMOUS_AVATAR_SVG_STRING = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#E9E9E9'/><g fill='#C4C4C4'><circle cx='50' cy='38' r='22'/><path d='M12,100 C12,65 88,65 88,100 Z'/></g></svg>`;

export const DEFAULT_AVATAR_URL = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(ANONYMOUS_AVATAR_SVG_STRING)))}`;


// --- Report Placeholder Generator ---
// Creates a placeholder image on a canvas for reports, ensuring no external dependencies.
export const getReportImageUrl = (category: ReportCategory, categoriesData: any, width = 600, height = 400): string => {
    if (width === 0 || height === 0) {
        console.warn("getReportImageUrl called with zero dimension, falling back to SVG avatar.");
        return getAvatarUrl(category);
    }
    try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return getAvatarUrl(category); // Fallback to an SVG if canvas fails
        }

        const categoryData = categoriesData[category];
        
        if (!categoryData || !categoryData.color) {
             console.warn(`Canvas placeholder generation: Category data for "${category}" is missing or invalid. Using fallback.`);
             ctx.fillStyle = '#9E9E9E'; // A neutral gray
             ctx.fillRect(0, 0, width, height);
             ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
             ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
             ctx.shadowBlur = 5;
             ctx.font = `bold ${height / 12}px Inter, sans-serif`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText('Invalid Category', width / 2, height / 2);
             return canvas.toDataURL('image/png');
        }

        const color = categoryData.color.light; // Use light color as a base for vibrancy
        const categoryName = categoryData.name_en;

        // Background Gradient for a professional look
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `${color}30`); // Lighter, more transparent
        gradient.addColorStop(1, `${color}80`); // Darker, more opaque
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Text with a subtle shadow for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 5;
        ctx.font = `bold ${height / 12}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(categoryName, width / 2, height / 2);

        return canvas.toDataURL('image/png');
    } catch (e) {
        // In case of any error (e.g., in a weird browser environment), fallback to a safe SVG.
        console.error("Canvas placeholder generation failed:", e);
        return getAvatarUrl(category);
    }
};