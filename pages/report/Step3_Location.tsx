import * as React from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { AppContext } from '../../contexts/AppContext';
import { Report, ReportData } from '../../types';
import { PATHS } from '../../constants';
import { FaLocationDot, FaRegAddressCard, FaSpinner, FaArrowLeft, FaArrowRight, FaCity, FaGlobe, FaMagnifyingGlass } from 'react-icons/fa6';
import { GoogleGenAI, Type } from '@google/genai';
import InteractiveMap from '../../components/InteractiveMap';
import AiRejectionNotice from './AiRejectionNotice';

interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
}

// Haversine distance calculation in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const NearbyReportCard: React.FC<{ report: Report & { distance: number } }> = ({ report }) => {
    const { t, language, categories } = React.useContext(AppContext);
    const title = language === 'ar' ? report.title_ar : report.title_en;
    const distanceText = report.distance < 1000
        ? t.distanceAwayMeters.replace('{distance}', String(Math.round(report.distance)))
        : t.distanceAwayKm.replace('{distance}', String((report.distance / 1000).toFixed(1)));
    const categoryData = categories[report.category];
    const categoryName = categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : report.category;


    return (
        <Link to={PATHS.REPORT_DETAILS.replace(':id', report.id)} state={{ from: 'reportWizard' }} className="block bg-card dark:bg-surface-dark p-3 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
                <img src={report.photo_urls[0]} alt={title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-navy dark:text-text-primary-dark truncate">{title}</p>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{categoryName}</p>
                    <p className="text-xs font-semibold text-sky dark:text-cyan-dark">{distanceText}</p>
                </div>
            </div>
        </Link>
    );
};


const Step3Location: React.FC<{
  reportData: ReportData;
  updateReportData: (updates: Partial<ReportData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setWizardStep: (step: number | ((prevStep: number) => number)) => void;
}> = ({
  reportData,
  updateReportData,
  nextStep,
  prevStep,
  setWizardStep,
}) => {
  const { t, language, reports, flyToLocation } = React.useContext(AppContext);
  
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const userHasManuallySetLocation = React.useRef(false);

  const [geoState, setGeoState] = React.useState<{ loading: boolean; error: string | null }>({
    loading: !reportData.location,
    error: null,
  });
  
  // Separate states for search functionality
  const [searchQuery, setSearchQuery] = React.useState(reportData.address);
  const [suggestions, setSuggestions] = React.useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  const [isReverseGeocoding, setIsReverseGeocoding] = React.useState(false);
  const [isDetectingMunicipality, setIsDetectingMunicipality] = React.useState(false);
  
  const [nearbyReports, setNearbyReports] = React.useState<(Report & { distance: number })[]>([]);


  // --- Map and Location Logic ---

  const handleUseCurrentLocation = React.useCallback(async (isInitialFetch: boolean = false) => {
    setGeoState({ loading: true, error: null });
    if (!isInitialFetch) {
        userHasManuallySetLocation.current = false;
    }
    if (!navigator.geolocation) {
      const fallbackLocation: L.LatLngTuple = [33.8938, 35.5018];
      if (isInitialFetch) updateReportData({ location: fallbackLocation });
      flyToLocation(fallbackLocation, 15);
      setGeoState({ loading: false, error: 'Geolocation is not supported.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (userHasManuallySetLocation.current) {
            setGeoState({ loading: false, error: null });
            return;
        }
        const newLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
        updateReportData({ location: newLocation, address: '', municipality: '' });
        flyToLocation(newLocation, 15);
        setGeoState({ loading: false, error: null });
      },
      (error) => {
        console.error('Geolocation error:', error);
        const fallbackLocation: L.LatLngTuple = [33.8938, 35.5018];
        if (isInitialFetch) updateReportData({ location: fallbackLocation });
        flyToLocation(fallbackLocation, 15);
        setGeoState({ loading: false, error: t.geolocationPermissionDenied });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [t.geolocationPermissionDenied, updateReportData, flyToLocation]);
  
  React.useEffect(() => {
    if (!reportData.location) {
      // Set a default location immediately (Beirut, Lebanon) before geolocation loads
      const defaultLocation: [number, number] = [33.8938, 35.5018];
      updateReportData({ location: defaultLocation });
      handleUseCurrentLocation(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Search and Geocoding Logic ---
  
  // Sync address from pin drag to search input
  React.useEffect(() => {
      if (!showSuggestions) {
          setSearchQuery(reportData.address);
      }
  }, [reportData.address, showSuggestions]);

  // Debounced search for addresses
  React.useEffect(() => {
    if (!searchQuery || !showSuggestions) {
        setSuggestions([]);
        return;
    }
    const handler = setTimeout(() => {
        setIsSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=${language}`;
        fetch(url, { headers: { 'User-Agent': 'Mshkltk Civic Reporting App/1.0 (contact@mshkltk.app)' }})
            .then(res => res.json())
            .then((data: NominatimResult[]) => setSuggestions(data))
            .catch(console.error)
            .finally(() => setIsSearching(false));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, showSuggestions, language]);

  // Reverse geocoding when pin moves
  React.useEffect(() => {
    if (!reportData.location) return;
    const handler = setTimeout(() => {
      setIsReverseGeocoding(true);
      const [lat, lon] = reportData.location!;
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=${language}`;
      fetch(url, { headers: { 'User-Agent': 'Mshkltk Civic Reporting App/1.0 (contact@mshkltk.app)' }})
        .then(res => res.json())
        .then(data => updateReportData({ address: data?.display_name || t.addressNotFound }))
        .catch(() => updateReportData({ address: t.fetchError }))
        .finally(() => setIsReverseGeocoding(false));
    }, 500);
    return () => clearTimeout(handler);
  }, [reportData.location, language, t.addressNotFound, t.fetchError, updateReportData]);

  // AI Municipality Detection
  React.useEffect(() => {
    const address = reportData.address;
    if (!address || reportData.municipality || address === t.addressNotFound || address === t.fetchError || !process.env.API_KEY || isReverseGeocoding) {
        return;
    }
    const detectMunicipality = async () => {
      setIsDetectingMunicipality(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are a Lebanese geography expert. Given the address: "${address}", identify the official municipality. Respond with ONLY the municipality name in lowercase English. Your response must be a single, valid JSON object with one key: "municipality".`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { municipality: { type: Type.STRING } }, required: ["municipality"] } } });
        const result = JSON.parse(response.text);
        if (result.municipality) updateReportData({ municipality: result.municipality });
      } catch (error) {
        console.error("Municipality detection error:", error);
        updateReportData({ municipality: 'unknown' });
      } finally {
        setIsDetectingMunicipality(false);
      }
    };
    const debounceTimer = setTimeout(detectMunicipality, 300);
    return () => clearTimeout(debounceTimer);
  }, [reportData.address, reportData.municipality, t.addressNotFound, t.fetchError, isReverseGeocoding, updateReportData]);
  
  // Find nearby reports when pin moves
  React.useEffect(() => {
    if (!reportData.location) return;

    const handler = setTimeout(() => {
      const [lat, lon] = reportData.location!;
      const reportsWithDistance = reports
        .map(report => ({
          ...report,
          distance: getDistance(lat, lon, report.lat, report.lng)
        }))
        .filter(report => report.distance <= 200);

      reportsWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyReports(reportsWithDistance.slice(0, 3));
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [reportData.location, reports]);


  const handleSuggestionClick = (suggestion: NominatimResult) => {
    userHasManuallySetLocation.current = true;
    const newLocation: L.LatLngTuple = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    updateReportData({ location: newLocation, address: suggestion.display_name, municipality: '' });
    setShowSuggestions(false);
    flyToLocation(newLocation, 15);
  };
  
  React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;
  const NextIcon = language === 'ar' ? FaArrowLeft : FaArrowRight;
  const isNextDisabled = isReverseGeocoding || isDetectingMunicipality || !reportData.address || reportData.address === t.addressNotFound || !reportData.municipality || reportData.municipality === 'unknown' || geoState.loading;

  if (geoState.loading || !reportData.location) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
        <FaSpinner className="animate-spin text-4xl text-teal dark:text-teal-dark mb-4" {...({} as any)} />
        <h1 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-2">{t.useCurrentLocation}</h1>
        <p className="text-text-secondary dark:text-text-secondary-dark mb-4">{t.fetchingAddress}</p>
        {geoState.error && <p className="mt-4 p-4 bg-coral/10 text-coral dark:text-coral-dark rounded-xl max-w-sm font-semibold">{geoState.error}</p>}
      </div>
    );
  }

  const backStepTarget = reportData.detectedIssues.length > 1 ? 3 : 2;

  return (
    <div className="flex flex-col h-full w-full">
        <div className="flex-grow min-h-0 overflow-y-auto pb-4 pr-1 space-y-4">
            <AiRejectionNotice reportData={reportData} onGoBack={() => setWizardStep(2)} />
            <div className="text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-2">{t.dragPin}</h1>
                <p className="text-lg text-text-secondary dark:text-text-secondary-dark">{t.privacyNotice}</p>
            </div>

            <div className="relative w-full flex-shrink-0" style={{ height: 280 }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg bg-muted dark:bg-bg-dark">
                    <InteractiveMap 
                        reports={reports}
                        isDraggablePinVisible={true}
                        draggablePinPosition={reportData.location}
                        onDraggablePinDragStart={() => {
                            userHasManuallySetLocation.current = true;
                        }}
                        onDraggablePinMove={(position) => {
                            updateReportData({ location: position, municipality: '' });
                        }}
                        initialCenter={reportData.location || undefined}
                        initialZoom={15}
                        hideUserLocationMarker={true}
                    />
                </div>
                <button type="button" onClick={() => handleUseCurrentLocation(false)} className="absolute top-4 right-4 z-[500] flex items-center gap-2 px-3 py-2 text-sm font-semibold text-teal dark:text-teal-dark bg-card dark:bg-surface-dark rounded-full shadow-lg hover:scale-105 transition-transform">
                    <FaLocationDot {...({} as any)} />
                    {t.useCurrentLocation}
                </button>
            </div>
            
            <div className="p-4 bg-muted dark:bg-surface-dark rounded-xl flex items-start gap-4 text-start transition-shadow duration-300 animate-subtle-glow">
            <FaRegAddressCard className="h-6 w-6 text-teal dark:text-teal-dark mt-2 flex-shrink-0" {...({} as any)} />
            <div className="relative w-full" ref={searchContainerRef}>
                <label className="font-bold text-navy dark:text-text-primary-dark">{t.address}</label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={t.fetchingAddress}
                        className="w-full bg-transparent border-0 border-b-2 border-border-light dark:border-border-dark focus:border-teal dark:focus:border-teal-dark focus:ring-0 p-1 text-sm text-text-secondary dark:text-text-secondary-dark"
                    />
                    {(isReverseGeocoding || isSearching) && <FaSpinner className="animate-spin absolute top-1/2 -translate-y-1/2 right-2 text-teal dark:text-teal-dark" {...({} as any)} />}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-card dark:bg-surface-dark rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto border border-border-light dark:border-border-dark">
                        {suggestions.map(s => (
                            <button key={s.place_id} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-3 py-2 hover:bg-muted dark:hover:bg-bg-dark text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2">
                            <FaMagnifyingGlass size={12} className="flex-shrink-0" {...({} as any)} /> <span>{s.display_name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            </div>
            
            <div className="p-4 bg-muted dark:bg-surface-dark rounded-xl flex items-start gap-4 text-start">
                <FaCity className="h-6 w-6 text-teal dark:text-teal-dark mt-1 flex-shrink-0" {...({} as any)} />
                <div>
                    <label className="font-bold text-navy dark:text-text-primary-dark">{t.municipality}</label>
                    {isDetectingMunicipality ? (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2"><FaSpinner className="animate-spin" {...({} as any)} /> {t.aiAnalyzing}</p>
                    ) : (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark capitalize">{reportData.municipality || 'Not detected'}</p>
                    )}
                </div>
            </div>

            <div className="p-4 bg-muted dark:bg-surface-dark rounded-xl flex items-start gap-4 text-start">
                <FaGlobe className="h-6 w-6 text-teal dark:text-teal-dark mt-1 flex-shrink-0" {...({} as any)} />
                <div>
                    <label className="font-bold text-navy dark:text-text-primary-dark">Coordinates</label>
                    {reportData.location ? (
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark font-mono">Lat: {reportData.location[0].toFixed(6)}, Lng: {reportData.location[1].toFixed(6)}</p>
                    ) : ( <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Waiting for location...</p> )}
                </div>
            </div>
            
            {nearbyReports.length > 0 && (
            <div className="p-4 bg-mango/10 dark:bg-mango-dark/10 rounded-xl animate-fade-in">
                <h3 className="font-bold text-mango dark:text-mango-dark mb-2">{t.similarReportsNearby}</h3>
                <div className="space-y-2">
                {nearbyReports.map(report => <NearbyReportCard key={report.id} report={report} />)}
                </div>
            </div>
            )}
      </div>
      
      <div className="flex-shrink-0 py-4 w-full flex items-center justify-between">
          <button type="button" onClick={() => setWizardStep(backStepTarget)} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-surface-dark rounded-full hover:bg-opacity-90">
            <BackIcon /> {t.backStep}
          </button>
          <button type="button" onClick={nextStep} disabled={isNextDisabled} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {t.nextStep} <NextIcon />
          </button>
      </div>
    </div>
  );
};

export default Step3Location;