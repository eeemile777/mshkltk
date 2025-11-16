import React from 'react';
import L from 'leaflet';
import { PortalContext } from '../../contexts/PortalContext';
import InteractiveMap from '../../components/InteractiveMap';
import Spinner from '../../components/Spinner';

const MUNICIPALITY_COORDS: { [key: string]: { center: L.LatLngTuple, zoom: number, bounds: L.LatLngBoundsExpression, minZoom: number } } = {
    beirut: { center: [33.8938, 35.5018], zoom: 13, bounds: [[33.85, 35.45], [33.93, 35.56]], minZoom: 12 },
    tripoli: { center: [34.4363, 35.8444], zoom: 13, bounds: [[34.38, 35.78], [34.48, 35.90]], minZoom: 12 },
    jounieh: { center: [33.983, 35.641], zoom: 13, bounds: [[33.93, 35.59], [34.03, 35.69]], minZoom: 12 },
    byblos: { center: [34.123, 35.651], zoom: 13, bounds: [[34.07, 35.60], [34.17, 35.70]], minZoom: 12 },
    aley: { center: [33.805, 35.600], zoom: 13, bounds: [[33.75, 35.55], [33.85, 35.65]], minZoom: 12 },
    broummana: { center: [33.890, 35.617], zoom: 13, bounds: [[33.84, 35.56], [33.94, 35.66]], minZoom: 12 },
    sidon: { center: [33.559, 35.371], zoom: 13, bounds: [[33.50, 35.32], [33.60, 35.42]], minZoom: 12 },
    tyre: { center: [33.273, 35.193], zoom: 13, bounds: [[33.22, 35.14], [33.32, 35.24]], minZoom: 12 },
    nabatieh: { center: [33.378, 35.485], zoom: 13, bounds: [[33.32, 35.43], [33.42, 35.53]], minZoom: 12 },
    zahle: { center: [33.846, 35.906], zoom: 13, bounds: [[33.80, 35.85], [33.90, 35.95]], minZoom: 12 },
    baalbek: { center: [34.006, 36.208], zoom: 13, bounds: [[33.95, 36.15], [34.05, 36.25]], minZoom: 12 },
    batroun: { center: [34.255, 35.658], zoom: 13, bounds: [[34.20, 35.60], [34.30, 35.70]], minZoom: 12 },
    zgharta: { center: [34.398, 35.895], zoom: 13, bounds: [[34.35, 35.84], [34.45, 35.94]], minZoom: 12 },
    qalamoun: { center: [34.373, 35.781], zoom: 13, bounds: [[34.32, 35.73], [34.42, 35.83]], minZoom: 12 },
};

const DEFAULT_LEBANON_VIEW = {
    center: [33.8547, 35.8623] as L.LatLngTuple,
    zoom: 8,
};

const PortalMapPage: React.FC = () => {
    const { reports, loading, currentUser, categories } = React.useContext(PortalContext);

    const mapProps = React.useMemo(() => {
        if (!currentUser) return DEFAULT_LEBANON_VIEW;

        // Primary strategy: If reports exist, fit the map to their locations.
        if (reports && reports.length > 0) {
            const reportCoords = reports.map(r => [r.lat, r.lng] as L.LatLngTuple);
            const bounds = L.latLngBounds(reportCoords);
            if (bounds.isValid()) {
                // Return bounds for the map to fit.
                return { initialBounds: bounds };
            }
        }

        // Fallback strategy (if no reports): Fit to the user's defined scope.
        if (currentUser.role === 'municipality' && currentUser.municipality_id && MUNICIPALITY_COORDS[currentUser.municipality_id]) {
            const config = MUNICIPALITY_COORDS[currentUser.municipality_id];
            return {
                initialCenter: config.center,
                initialZoom: config.zoom,
                bounds: config.bounds,
                minZoom: config.minZoom,
            };
        }

        if ((currentUser.role === 'union_of_municipalities' || currentUser.role === 'utility') && currentUser.scoped_municipalities && currentUser.scoped_municipalities.length > 0) {
            const bounds = L.latLngBounds([]);
            currentUser.scoped_municipalities.forEach(munId => {
                if (MUNICIPALITY_COORDS[munId]) {
                    bounds.extend(MUNICIPALITY_COORDS[munId].bounds);
                }
            });
            if (bounds.isValid()) {
                return { initialBounds: bounds };
            }
        }

        // Final fallback if no scope or reports are available.
        return DEFAULT_LEBANON_VIEW;
    }, [currentUser, reports]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg -m-6">
            <InteractiveMap
                reports={reports}
                reportPathPrefix="/portal/reports/:id"
                hideUserLocationMarker={true}
                categoriesOverride={categories}
                {...mapProps}
            />
        </div>
    );
};

export default PortalMapPage;