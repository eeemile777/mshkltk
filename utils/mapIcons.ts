import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants';
import { ReportCategory, Theme } from '../types';
import { IconType } from 'react-icons';
import { FaMapMarkerAlt } from 'react-icons/fa';

const createBaseIcon = (IconComponent: IconType, color: string, theme: Theme): L.DivIcon => {
    const pinBorderColor = theme === Theme.DARK ? '#1E2A38' : '#FFFFFF';

    const markerHtml = ReactDOMServer.renderToString(
        React.createElement('div', { style: { position: 'relative', width: '40px', height: '55px' } },
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    bottom: '1px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '10px solid transparent',
                    borderRight: '10px solid transparent',
                    borderTop: `15px solid ${pinBorderColor}`,
                    filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.2))'
                }
            }),
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    bottom: '3px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `12px solid ${color}`,
                }
            }),
            React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
                    border: `2px solid ${pinBorderColor}`
                }
            },
            React.createElement(IconComponent, { style: { color: 'white', fontSize: '20px' } }))
        )
    );

    return new L.DivIcon({
        html: markerHtml,
        className: '',
        iconSize: [40, 55],
        iconAnchor: [20, 55], // Tip of the pin (bottom center)
        popupAnchor: [0, -50] // Anchor popup above the circle part of the pin
    });
};

export const createCategoryIcon = (category: ReportCategory, theme: Theme): L.DivIcon => {
    const IconComponent = CATEGORY_ICONS[category];
    const color = theme === Theme.DARK ? CATEGORY_COLORS[category].dark : CATEGORY_COLORS[category].light;
    return createBaseIcon(IconComponent, color, theme);
};

export const createDefaultIcon = (theme: Theme): L.DivIcon => {
    const color = theme === Theme.DARK ? '#B0B8C1' : '#0D3B66'; // Muted Navy/Gray
    return createBaseIcon(FaMapMarkerAlt, color, theme);
}
