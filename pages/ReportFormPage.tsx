import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { ReportCategory, Credibility, Theme } from '../types';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaCamera, FaCheckCircle, FaExclamationCircle, FaSpinner, FaTrash, FaMapMarkerAlt, FaRegAddressCard } from 'react-icons/fa';
import { PATHS, TILE_ATTRIBUTION, TILE_URL_DARK, TILE_URL_LIGHT } from '../constants';
import { createCategoryIcon, createDefaultIcon } from '../utils/mapIcons';

const DraggableMarker: React.FC<{ position: L.LatLngTuple, setPosition: (pos: L.LatLngTuple) => void, icon: L.DivIcon | L.Icon }> = ({ position, setPosition, icon }) => {
    const markerRef = React.useRef<L.Marker>(null);
    const map = useMap();

    React.useEffect(() => {
        if (map) map.setView(position, 15);
    }, [position, map]);

    const eventHandlers = React.useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                setPosition([lat, lng]);
            }
        },
    }), [setPosition]);

    return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={icon} />;
};

const ReportFormPage: React.FC = () => {
    const { t, submitReport, currentUser, theme, language } = React.useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [images, setImages] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<string[]>([]);
    const [category, setCategory] = React.useState<ReportCategory | ''>((location.state as any)?.category || '');
    const [description, setDescription] = React.useState('');
    const [mapCenter, setMapCenter] = React.useState<L.LatLngTuple>([33.8938, 35.5018]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [credibilityCheck, setCredibilityCheck] = React.useState<Credibility>(Credibility.Pending);
    const [address, setAddress] = React.useState<string>('');
    const [isGeocoding, setIsGeocoding] = React.useState(false);
    const [geocodeError, setGeocodeError] = React.useState('');

    const markerIcon = React.useMemo(() => {
        if (category) {
            return createCategoryIcon(category, theme);
        }
        return createDefaultIcon(theme);
    }, [category, theme]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).slice(0, 3 - images.length); // Limit to 3 images
            setImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
            
            if (previews.length === 0) { // Check credibility on first image
                setCredibilityCheck(Credibility.Pending);
                setTimeout(() => {
                    setCredibilityCheck(Math.random() > 0.2 ? Credibility.Pass : Credibility.NeedsReview);
                }, 1500);
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }
    
    const handleUseCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMapCenter([latitude, longitude]);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setGeocodeError(t.fetchError || "Could not get location. Please enable location services.");
            },
            { enableHighAccuracy: true }
        );
    };

    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (mapCenter) {
                setIsGeocoding(true);
                setGeocodeError('');
                setAddress('');
                fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${mapCenter[0]}&lon=${mapCenter[1]}&accept-language=${language}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data && data.display_name) {
                            setAddress(data.display_name);
                        } else {
                            setGeocodeError(t.addressNotFound);
                        }
                    })
                    .catch(error => {
                        console.error('Reverse geocoding error:', error);
                        setGeocodeError(t.fetchError || 'Failed to fetch. Please check your internet connection.');
                    })
                    .finally(() => {
                        setIsGeocoding(false);
                    });
            }
        }, 1000); // 1s debounce

        return () => {
            clearTimeout(handler);
        };
    }, [mapCenter, language, t.addressNotFound, t.fetchError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0 || !category || !description || !currentUser) return;
        
        setIsSubmitting(true);
        try {
            await submitReport({
                created_by: currentUser.id,
                category,
                note: description,
                lat: mapCenter[0],
                lng: mapCenter[1],
                area: address || "Unknown Location",
                photo_urls: previews, // In real app, upload files and get URLs
            });
            navigate(PATHS.HOME);
        } catch (error) {
            console.error("Failed to submit report", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const credibilityContent = () => {
        switch(credibilityCheck) {
            case Credibility.Pending: return <span className="flex items-center text-sm text-sky dark:text-cyan-dark"><FaSpinner className="animate-spin me-2" /> {t.checkingCredibility}</span>;
            case Credibility.Pass: return <span className="flex items-center text-sm text-teal dark:text-teal-dark"><FaCheckCircle className="me-2" /> {t.credibilityPass}</span>;
            case Credibility.NeedsReview: return <span className="flex items-center text-sm text-coral dark:text-coral-dark"><FaExclamationCircle className="me-2" /> {t.credibilityNeedsReview}</span>;
        }
    };

    const tileUrl = theme === Theme.DARK ? TILE_URL_DARK : TILE_URL_LIGHT;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-navy dark:text-text-primary-dark">{t.newReport}</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <label className="block text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.uploadPhoto} (Max 3)</label>
                    <div className="p-4 bg-muted dark:bg-surface-dark rounded-xl">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {previews.map((src, i) => (
                                <div key={i} className="relative">
                                    <img src={src} alt={`Preview ${i+1}`} className="w-full h-24 object-cover rounded-lg"/>
                                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-coral text-white rounded-full p-1"><FaTrash size={12}/></button>
                                </div>
                            ))}
                        </div>
                        {images.length < 3 && (
                            <label htmlFor="file-upload" className="relative cursor-pointer w-full flex flex-col items-center justify-center p-6 border-2 border-border-light dark:border-border-dark border-dashed rounded-lg text-center hover:border-teal dark:hover:border-teal-dark">
                                <FaCamera className="mx-auto h-10 w-10 text-text-secondary dark:text-text-secondary-dark mb-2" />
                                <span className="text-sm font-semibold text-teal dark:text-teal-dark">{t.uploadPhoto}</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageChange} />
                            </label>
                        )}
                        {previews.length > 0 && <div className="pt-4 text-center">{credibilityContent()}</div>}
                    </div>
                </div>

                <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="text-lg font-bold text-navy dark:text-text-primary-dark">{t.dragPin}</label>
                        <button type="button" onClick={handleUseCurrentLocation} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-teal dark:text-teal-dark bg-teal/10 rounded-full hover:bg-teal/20 transition-colors">
                            <FaMapMarkerAlt />
                            {t.useCurrentLocation}
                        </button>
                    </div>
                     <div className="h-64 w-full rounded-xl overflow-hidden shadow-md">
                        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} zoomSnap={0.25} zoomDelta={0.25}>
                            <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
                            <DraggableMarker position={mapCenter} setPosition={setMapCenter} icon={markerIcon} />
                        </MapContainer>
                    </div>
                    <div className="mt-4 p-4 bg-muted dark:bg-surface-dark rounded-xl flex items-start gap-4">
                        <FaRegAddressCard className="h-6 w-6 text-teal dark:text-teal-dark mt-1 flex-shrink-0" />
                        <div>
                            <label className="font-bold text-navy dark:text-text-primary-dark">{t.address}</label>
                            {isGeocoding ? (
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2"><FaSpinner className="animate-spin" /> {t.fetchingAddress}</p>
                            ) : geocodeError ? (
                                <p className="text-sm text-coral dark:text-coral-dark">{geocodeError}</p>
                            ) : (
                                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{address || t.privacyNotice}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="category" className="block text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.category}</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as ReportCategory)} required
                            className="mt-1 block w-full p-3 text-base border-border-light dark:border-border-dark bg-card dark:bg-surface-dark focus:outline-none focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark rounded-xl"
                        >
                            <option value="" disabled>{t.selectCategory}</option>
                            {Object.values(ReportCategory).map(cat => (
                                <option key={cat} value={cat}>{t[cat]}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.describeProblem}</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={500} required
                            className="mt-1 block w-full p-3 shadow-sm sm:text-sm border-border-light dark:border-border-dark bg-card dark:bg-surface-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark"
                        ></textarea>
                    </div>
                </div>

                <div>
                    <button type="submit" disabled={isSubmitting || images.length === 0 || !category || !description || credibilityCheck !== Credibility.Pass}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <FaSpinner className="animate-spin h-6 w-6"/> : t.submitReport}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportFormPage;