import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { CATEGORIES } from '../constants';
import { ReportCategory, Theme } from '../types';

const ICON_SIZE = 36; // The size of the div icon

/**
 * Generates an L.DivIcon for a given report category and theme.
 * This creates a custom HTML marker that can be styled with CSS.
 * @param category The report category.
 * @param theme The current application theme ('light' or 'dark').
 * @returns A Leaflet L.DivIcon instance.
 */
export const createCategoryIcon = (category: ReportCategory, theme: Theme): L.DivIcon => {
  const categoryData = CATEGORIES[category];
  if (!categoryData) {
    // Fallback for unknown categories
    return new L.DivIcon({ className: 'leaflet-div-icon' });
  }

  const IconComponent = categoryData.icon;
  const color = theme === Theme.DARK ? categoryData.color.dark : categoryData.color.light;
  const iconSize = ICON_SIZE * 0.5;

  const iconHtml = ReactDOMServer.renderToString(
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: color,
          width: `${ICON_SIZE}px`,
          height: `${ICON_SIZE}px`,
          borderWidth: '3px',
        },
        className: `report-leaflet-div-icon ${theme}`,
      },
      React.createElement(
        'div',
        {
          className: 'icon-inner',
        },
        React.createElement(IconComponent, { size: iconSize })
      )
    )
  );

  return L.divIcon({
    html: iconHtml,
    className: '', // We apply classes directly in the HTML for more control
    iconSize: [ICON_SIZE, ICON_SIZE],
    iconAnchor: [ICON_SIZE / 2, ICON_SIZE],
    popupAnchor: [0, -ICON_SIZE],
  });
};