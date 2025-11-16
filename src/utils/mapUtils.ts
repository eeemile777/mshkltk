import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { ReportCategory, Theme } from '../types';
import { CATEGORIES } from '../constants';

const ICON_SIZE = 36; // The size of the div icon

/**
 * Generates an L.DivIcon for a given report category and theme.
 * This creates a custom HTML marker that can be styled with CSS.
 * @param category The report category.
 * @param theme The current application theme ('light' or 'dark').
 * @param categories The dynamic categories object from context.
 * @returns A Leaflet L.DivIcon instance.
 */
export const createCategoryIcon = (category: ReportCategory, theme: Theme, categories: any): L.DivIcon => {
  // FIX: Add robust fallback to static CATEGORIES constant to prevent errors if a category is missing from dynamic config.
  const categoryData = categories[category] || CATEGORIES[category] || CATEGORIES['other_unknown'];
  const fallbackCategory = CATEGORIES['other_unknown'];

  // This check is a final safeguard, but should not be hit if CATEGORIES is correctly defined.
  if (!categoryData) {
    console.warn(`Category data for "${category}" not found in dynamic or static config.`);
  }

  const effectiveCategoryData = categoryData || fallbackCategory;

  const IconComponent = effectiveCategoryData.icon;
  const color = effectiveCategoryData.color.light; // Always use light theme color for consistency.
  const iconSize = ICON_SIZE * 0.5;
  const iconColor = '#FFFFFF'; // Make icon inside white for contrast

  const iconHtml = ReactDOMServer.renderToString(
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: color, // Use category color for the pin background
          borderColor: color,
          width: `${ICON_SIZE}px`,
          height: `${ICON_SIZE}px`,
          borderWidth: '3px',
        },
        className: `report-leaflet-div-icon`, // Removed theme class as it's handled by bgColor
      },
      React.createElement(
        'div',
        {
          className: 'icon-inner',
          style: { color: iconColor } // Use white for the icon
        },
        React.createElement(IconComponent, { size: iconSize })
      )
    )
  );

  return L.divIcon({
    html: iconHtml,
    className: 'report-marker-icon', // Add className so Leaflet applies proper styling context
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE],
    popupAnchor: [0, -ICON_SIZE],
  });
};