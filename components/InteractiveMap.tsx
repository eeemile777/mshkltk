import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat';

import { AppContext } from '../contexts/AppContext';
import { Report, Theme, TimeFilter, ReportCategory, ReportSeverity, DynamicCategory } from '../types';
import { PATHS, TILE_URLS, TILE_ATTRIBUTION, CATEGORIES } from '../constants';
import MapControls from './MapControls';
import { FaCircleCheck } from 'react-icons/fa6';
import { createCategoryIcon } from '../utils/mapUtils';
import useGeolocation from '../hooks/useGeolocation';
import { getReportImageUrl } from '../data/mockImages';

interface InteractiveMapProps {
    reports: Report[];
    initialCenter?: L.LatLngTuple;
    initialZoom?: number;
    initialBounds?: L.LatLngBoundsExpression;
    reportPathPrefix?: string;
    // New props for draggable pin in creation mode
    isDraggablePinVisible?: boolean;
    draggablePinPosition?: L.LatLngTuple | null;
    onDraggablePinMove?: (position: L.LatLngTuple) => void;
    onDraggablePinDragStart?: () => void; // New prop for drag start event
    hideUserLocationMarker?: boolean;
    hideControls?: boolean;
    // Props for restricting map view
    bounds?: L.LatLngBoundsExpression;
    minZoom?: number;
    categoriesOverride?: typeof CATEGORIES;
}

const checkTimeFilter = (report: Report, filter: TimeFilter): boolean => {
    if (filter === TimeFilter.All) return true;
    const now = new Date().getTime();
    const reportTime = new Date(report.created_at).getTime();
    const diff = now - reportTime;
    const hours24 = 24 * 60 * 60 * 1000;
    const days7 = 7 * hours24;
    const days30 = 30 * hours24;
    switch (filter) {
        case TimeFilter.Day: return diff <= hours24;
        case TimeFilter.Week: return diff <= days7;
        case TimeFilter.Month: return diff <= days30;
        default: return true;
    }
};

const SeverityIndicator: React.FC<{ severity: ReportSeverity; className?: string }> = ({ severity, className = '' }) => {
    const severityMap = {
        [ReportSeverity.High]: { text: '!!!', title: 'High' },
        [ReportSeverity.Medium]: { text: '!!', title: 'Medium' },
        [ReportSeverity.Low]: { text: '!', title: 'Low' },
    };
    const { text, title } = severityMap[severity] || severityMap.low;
    
    return (
        <span className={`font-black text-lg text-coral dark:text-coral-dark ${className}`} title={`Severity: ${title}`}>
            {text}
        </span>
    );
};

// --- Helper hook to convert data URLs to more performant object URLs ---
const useObjectUrl = (dataUrl: string | undefined): string | undefined => {
  const [objectUrl, setObjectUrl] = React.useState<string | undefined>();

  React.useEffect(() => {
    // If it's not a data URL, just use it as is (e.g., a regular URL or an existing blob URL)
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      setObjectUrl(dataUrl);
      return;
    }

    let objectUrlValue: string | undefined;

    try {
        const arr = dataUrl.split(',');
        if (arr.length < 2) throw new Error("Invalid data URL");

        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) throw new Error("Could not parse MIME type from data URL");
        const mime = mimeMatch[1];
        
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {type:mime});
        
        objectUrlValue = URL.createObjectURL(blob);
        setObjectUrl(objectUrlValue);
    } catch (error) {
        console.error("Error converting data URL to object URL:", error);
        // Fallback to the original dataUrl if conversion fails.
        // This might be less performant but is better than showing nothing.
        setObjectUrl(dataUrl);
    }

    return () => {
      if (objectUrlValue) {
        URL.revokeObjectURL(objectUrlValue);
      }
    };
  }, [dataUrl]);

  return objectUrl;
};


// --- Popup Component ---
const MapPopup: React.FC<{ report: Report; onNavigate: () => void; }> = ({ report, onNavigate }) => {
    const { t, language, categories, theme } = React.useContext(AppContext);
    const title = language === 'ar' ? report.title_ar : report.title_en;
    const dataUrl = report.photo_urls?.[0];
    const objectUrl = useObjectUrl(dataUrl);
    
    const finalUrl = objectUrl || getReportImageUrl(report.category, categories, 256, 112);
    const isVideo = dataUrl?.startsWith('data:video/');

    return (
        <div className="w-64 max-w-[90vw] overflow-hidden rounded-xl bg-card dark:bg-surface-dark shadow-lg">
            {isVideo ? (
                <video src={finalUrl} className="w-full h-28 object-cover" muted loop playsInline autoPlay />
            ) : (
                <img src={finalUrl} alt={title} className="w-full h-28 object-cover" />
            )}
            <div className="p-3">
                <h3 className="font-bold text-base text-navy dark:text-text-primary-dark line-clamp-2 mb-1">{title}</h3>
                <div className="flex justify-between items-center text-xs text-text-secondary dark:text-text-secondary-dark mb-2">
                    <p>{report.area}</p>
                    <div className="flex items-center gap-2">
                         <SeverityIndicator severity={report.severity} className="text-base" />
                        <div className="flex items-center gap-1 font-bold text-mango dark:text-mango-dark">
                            <FaCircleCheck /><span>{report.confirmations_count}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onNavigate}
                    className="block text-center w-full bg-teal text-white py-1.5 px-3 rounded-full hover:bg-opacity-90 transition-colors text-sm font-bold"
                >
                    {t.viewFullReport}
                </button>
            </div>
        </div>
    );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
    reports,
    initialCenter,
    initialZoom,
    initialBounds,
    reportPathPrefix,
    isDraggablePinVisible,
    draggablePinPosition,
    onDraggablePinMove,
    onDraggablePinDragStart,
    hideUserLocationMarker,
    hideControls,
    bounds,
    minZoom,
    categoriesOverride
}) => {
    const {
      theme, mapCenter, mapZoom, setMapView, mapTargetLocation, clearMapTarget,
      activeCategories, activeStatuses, activeTimeFilter, t, language, categories
    } = React.useContext(AppContext);
    
    const effectiveCategories = categoriesOverride || categories;
    
    const geolocation = useGeolocation({ enableHighAccuracy: true });
    const navigate = useNavigate();
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<L.Map | null>(null);
    const tileLayerRef = React.useRef<L.TileLayer | null>(null);
    const clusterGroupRef = React.useRef<L.FeatureGroup | null>(null);
    const heatLayerRef = React.useRef<any | null>(null); // Using 'any' for leaflet.heat typings
    const draggableMarkerRef = React.useRef<L.Marker | null>(null);
    const userLocationMarkerRef = React.useRef<L.Marker | null>(null);
    const initialLocationSetRef = React.useRef(false);
    const isPinDraggingRef = React.useRef(false);

    // FIX: Create a ref to track the latest `isDraggablePinVisible` state. This prevents
    // the 'moveend' event listener from causing re-renders that interfere with pin dragging.
    const isDraggablePinVisibleRef = React.useRef(isDraggablePinVisible);
    React.useEffect(() => {
        isDraggablePinVisibleRef.current = isDraggablePinVisible;
    }, [isDraggablePinVisible]);


    const filteredReports = React.useMemo(() => {
        const showAllCategories = activeCategories.size === 0;
        const showAllStatuses = activeStatuses.size === 0;
        return reports.filter(report => {
            const categoryMatch = showAllCategories || activeCategories.has(report.category);
            const statusMatch = showAllStatuses || activeStatuses.has(report.status);
            const timeMatch = checkTimeFilter(report, activeTimeFilter);
            return categoryMatch && statusMatch && timeMatch;
        });
    }, [reports, activeCategories, activeStatuses, activeTimeFilter]);

    // Initialize map
    React.useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        // Prioritize a "fly to" target for the initial view to prevent jumping.
        const initialViewTarget = mapTargetLocation;

        const center: L.LatLngTuple = initialViewTarget
            ? [initialViewTarget[0], initialViewTarget[1]]
            : (initialCenter || mapCenter || [33.87, 35.85]);
        
        const zoom = initialViewTarget?.[2]
            ? initialViewTarget[2]
            : (initialZoom || mapZoom || 8.5);

        const mapOptions: L.MapOptions = {
            center: center,
            zoom: zoom,
            zoomControl: false,
            attributionControl: true,
        };
        
        if (bounds) {
            mapOptions.maxBounds = bounds;
            mapOptions.maxBoundsViscosity = 1.0;
        }
        if (minZoom) {
            mapOptions.minZoom = minZoom;
        }

        const map = L.map(mapContainer.current, mapOptions);
        mapRef.current = map;
        
        if (initialBounds) {
            // Use a small timeout to ensure the map container has its final dimensions
            // before fitting bounds, which helps calculate the correct zoom level.
            setTimeout(() => {
                if (mapRef.current) { // Re-check in case component unmounted
                    mapRef.current.fitBounds(initialBounds, { padding: [50, 50] });
                }
            }, 100);
        }

        tileLayerRef.current = L.tileLayer(TILE_URLS.light, { attribution: TILE_ATTRIBUTION }).addTo(map);

        const iconCreateFunction = (cluster: any) => {
            const children = cluster.getAllChildMarkers();
            const childCount = children.length;
            const MAX_FAN_PINS = 3;
            const pinsToShow = children.slice(0, MAX_FAN_PINS);
            const overflowCount = childCount > MAX_FAN_PINS ? childCount - MAX_FAN_PINS : 0;
            
            let totalSpreadAngle = pinsToShow.length === 2 ? 25 : 45;
            const angleStep = pinsToShow.length > 1 ? totalSpreadAngle / (pinsToShow.length - 1) : 0;
            const startAngle = -totalSpreadAngle / 2;

            const pinsHtml = pinsToShow.map((marker: any, i: number) => {
                const categoryKey = marker.options.category as ReportCategory;
                const categoryData = effectiveCategories[categoryKey] || CATEGORIES[categoryKey] || CATEGORIES['other_unknown'];
                
                if (!categoryData) {
                    console.warn(`Category data for "${categoryKey}" not found in dynamic or static config during cluster creation.`);
                    return '';
                }

                const IconComponent = categoryData.icon;
                const color = categoryData.color.light;
                const iconSize = 36 * 0.5;
                const iconColor = '#FFFFFF';
                const iconInnerHtml = ReactDOMServer.renderToString(React.createElement(IconComponent, { size: iconSize }));
                const angle = startAngle + (i * angleStep);
                const zIndex = pinsToShow.length - i;
                
                return `
                    <div class="fan-pin-wrapper" style="transform: rotate(${angle}deg); z-index: ${zIndex};">
                        <div class="report-leaflet-div-icon" style="background-color: ${color}; border: 3px solid ${color}; width: 36px; height: 36px;">
                            <div class="icon-inner" style="color: ${iconColor};">${iconInnerHtml}</div>
                        </div>
                    </div>
                `;
            }).join('');
            
            const overflowHtml = overflowCount > 0
                ? `<div class="fan-overflow-badge">${overflowCount > 99 ? '99+' : `${overflowCount}+`}</div>`
                : '';
            
            const finalHtml = `<div class="fan-cluster-container">${pinsHtml}${overflowHtml}</div>`;

            return L.divIcon({
                html: finalHtml,
                className: 'fan-cluster',
                iconSize: [60, 60],
                iconAnchor: [30, 60]
            });
        };

        clusterGroupRef.current = (L as any).markerClusterGroup({
            maxClusterRadius: 30,
            iconCreateFunction: iconCreateFunction,
        }).addTo(map);
        
        const heatGradient = {
            0.4: 'rgba(75, 163, 195, 0.4)',
            0.6: 'rgba(0, 191, 166, 0.5)',
            0.8: 'rgba(255, 166, 43, 0.6)',
            1.0: 'rgba(255, 90, 95, 0.7)'
        };
        
        heatLayerRef.current = (L as any).heatLayer([], {
            radius: 35,
            blur: 25,
            max: 60,
            gradient: heatGradient,
        }).addTo(map);

        map.on('moveend', () => {
            // FIX: Check the ref here. If the draggable pin is visible, we are in a report creation
            // flow and should not update the global map view state. This prevents re-renders
            // that interfere with the user's interaction (like dragging the pin).
            if (isDraggablePinVisibleRef.current) return;

            if (!mapRef.current) return;
            const center = mapRef.current.getCenter();
            setMapView([center.lat, center.lng], mapRef.current.getZoom());
        });
        
        // This prevents the geolocation effect from overriding our target.
        if (initialViewTarget) {
            initialLocationSetRef.current = true;
        }
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once

    // Apply CSS filter for dark mode
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSize()?.y) return;

        const tileLayer = tileLayerRef.current;
        if (!tileLayer) return;

        const tilePane = tileLayer.getContainer();
        if (tilePane) {
            if (theme === Theme.DARK) {
                // Lighter land, more vibrant water
                tilePane.style.filter = 'invert(100%) hue-rotate(180deg) brightness(110%) contrast(90%) saturate(150%)';
            } else {
                // Darker land, richer colors
                tilePane.style.filter = 'brightness(95%) contrast(105%) saturate(105%)';
            }
        }
    }, [theme]);

    // Update data layers when filtered reports change
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSize()?.y) return;

        const clusterGroup = clusterGroupRef.current;
        const heatLayer = heatLayerRef.current;

        if (!clusterGroup || !heatLayer) {
            return;
        }
        
        clusterGroup.clearLayers();
        
        const heatData: [number, number, number][] = [];
        const markers: L.Marker[] = [];

        filteredReports.forEach(report => {
            const icon = createCategoryIcon(report.category, theme, effectiveCategories);
            const marker = L.marker([report.lat, report.lng], {
                icon,
                category: report.category,
            } as any);

            marker.on('click', () => {
                const handleNavigate = () => {
                    const path = (reportPathPrefix || PATHS.REPORT_DETAILS).replace(':id', report.id);
                    navigate(path);
                    if (mapRef.current) {
                        mapRef.current.closePopup();
                    }
                };

                const placeholder = document.createElement('div');
                const root = createRoot(placeholder);
                root.render(<MapPopup report={report} onNavigate={handleNavigate} />);
                
                if(mapRef.current) {
                    L.popup({ offset: [0, -25], minWidth: 256 })
                        .setLatLng([report.lat, report.lng])
                        .setContent(placeholder)
                        .openOn(mapRef.current);
                }
            });
            
            markers.push(marker);
            heatData.push([report.lat, report.lng, report.confirmations_count]);
        });
        
        (clusterGroup as any).addLayers(markers);
        heatLayer.setLatLngs(heatData);

    }, [filteredReports, theme, t, navigate, reportPathPrefix, language, effectiveCategories]);

    // Fly-to Controller for subsequent clicks when map is already mounted
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSize()?.y) return;

        if (mapTargetLocation) {
            const [lat, lng, zoom] = mapTargetLocation;
            map.flyTo([lat, lng], zoom || 15, { duration: 1.5 });
            
            // FIX: Wait for the fly-to animation to finish before clearing the target.
            // This prevents a race condition where the target is cleared before the map can use it,
            // which was causing navigation to fail or the map to jump.
            map.once('moveend', () => {
                clearMapTarget();
            });
            
            initialLocationSetRef.current = true;
        }
    }, [mapTargetLocation, clearMapTarget]);

    // Initial fly-to user location
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSize()?.y) return;

        if (hideUserLocationMarker) {
            return;
        }

        if (geolocation.latitude && geolocation.longitude && !initialLocationSetRef.current) {
            map.flyTo([geolocation.latitude, geolocation.longitude], 13, { duration: 1.5 });
            initialLocationSetRef.current = true;
        }
    }, [geolocation.latitude, geolocation.longitude, hideUserLocationMarker]);
    
    // User location marker management
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSize()?.y) return;
        
        if (hideUserLocationMarker) {
            if (userLocationMarkerRef.current) {
                userLocationMarkerRef.current.remove();
                userLocationMarkerRef.current = null;
            }
            return;
        }

        if (geolocation.latitude && geolocation.longitude) {
            const userLatLng: L.LatLngTuple = [geolocation.latitude, geolocation.longitude];

            if (userLocationMarkerRef.current) {
                userLocationMarkerRef.current.setLatLng(userLatLng);
            } else {
                const iconHtml = `<div class="user-location-marker"><div class="pulse"></div><div class="dot"></div></div>`;
                const userIcon = L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });
                const marker = L.marker(userLatLng, {
                    icon: userIcon,
                    zIndexOffset: 1000,
                    interactive: false,
                }).addTo(map);
                userLocationMarkerRef.current = marker;
            }
        } else {
            if (userLocationMarkerRef.current) {
                userLocationMarkerRef.current.remove();
                userLocationMarkerRef.current = null;
            }
        }
    }, [geolocation.latitude, geolocation.longitude, hideUserLocationMarker]);


    // Effect for the draggable pin
    React.useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSize()?.y) return;

        if (!isDraggablePinVisible) {
            if (draggableMarkerRef.current) {
                draggableMarkerRef.current.remove();
                draggableMarkerRef.current = null;
            }
            return;
        }

        if (isDraggablePinVisible && !draggableMarkerRef.current && draggablePinPosition) {
             const pinIconHtml = `
                <div class="relative flex justify-center items-center">
                    <div class="absolute w-12 h-12 bg-teal/30 rounded-full animate-pulse-dot"></div>
                    <div class="w-6 h-6 bg-teal rounded-full ring-4 ring-white dark:ring-surface-dark shadow-lg"></div>
                </div>`;
            const pinIcon = L.divIcon({
                html: pinIconHtml,
                className: '',
                iconSize: [48, 48],
                iconAnchor: [24, 24],
            });

            const marker = L.marker(draggablePinPosition, {
                draggable: true,
                icon: pinIcon,
                zIndexOffset: 2000,
            }).addTo(map);

            marker.on('dragstart', () => {
                isPinDraggingRef.current = true;
                onDraggablePinDragStart?.();
            });

            marker.on('dragend', () => {
                isPinDraggingRef.current = false;
                const { lat, lng } = marker.getLatLng();
                onDraggablePinMove?.([lat, lng]);
            });

            draggableMarkerRef.current = marker;

        } else if (draggableMarkerRef.current && draggablePinPosition) {
            // CRITICAL FIX: The `isDragging()` method does not exist on L.Marker.
            // We now use our `isPinDraggingRef` which is correctly updated by drag events.
            if (!isPinDraggingRef.current) {
                draggableMarkerRef.current.setLatLng(draggablePinPosition);
            }
        }
    }, [isDraggablePinVisible, draggablePinPosition, onDraggablePinMove, onDraggablePinDragStart]);


    return (
        <div className="relative h-full w-full">
            <div ref={mapContainer} className="h-full w-full" />
            {!isDraggablePinVisible && !hideControls && <MapControls />}
        </div>
    );
};

export default InteractiveMap;
