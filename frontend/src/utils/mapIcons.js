import L from 'leaflet';

/**
 * Creates a custom div-based icon for Leaflet markers.
 * @param {string} content - The HTML content for the icon (e.g., 'A', 'B', '🚌', '•', '📍').
 * @param {string} bgColor - The background color for the circular icon (e.g., '#ef4444').
 * @param {string} textColor - The color for the icon's text/emoji.
 * @returns {L.DivIcon} A Leaflet DivIcon instance.
 */
export const createDivIcon = (content, bgColor, textColor = 'white') => {
    return L.divIcon({
        html: `
            <div style="
                background-color: ${bgColor};
                width: 24px; /* Reduced from 30px */
                height: 24px; /* Reduced from 30px */
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2); /* Slightly reduced shadow */
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${textColor}; /* Use textColor parameter */
                font-weight: bold;
                font-size: 12px; /* Reduced from 14px */
            ">
                ${content}
            </div>
        `,
        className: 'custom-div-icon',
        iconSize: [24, 24], // Reduced from 30px
        iconAnchor: [12, 12], // Adjusted anchor for new size
    });
};

// Define the reusable icons with updated sizes
export const originIcon = createDivIcon('A', '#10b981');
export const destinationIcon = createDivIcon('B', '#ef4444');
export const busStopIcon = createDivIcon('•', '#6b7280');
export const busIcon = createDivIcon('🚌', '#3b82f6', 'white'); // Emoji are typically larger, no specific textColor needed.
export const userLocationIcon = createDivIcon('📍', '#8b5cf6', 'white'); // Emoji are typically larger, no specific textColor needed.