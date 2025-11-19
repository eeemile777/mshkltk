import { useState, useEffect, useRef } from 'react';

interface GeolocationState {
  loading: boolean;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  error: GeolocationPositionError | null;
}

const useGeolocation = (options: PositionOptions = {}, enabled: boolean = true) => {
  const [state, setState] = useState<GeolocationState>({
    loading: enabled,
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: Date.now(),
    error: null,
  });

  // STABILITY FIX: Use ref to avoid dependency changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    let isMounted = true;
    let watchId: number | undefined;
    let lastUpdate = 0;
    const MIN_UPDATE_INTERVAL = 5000; // Minimum 5 seconds between updates

    const onEvent = (event: GeolocationPosition) => {
      if (!isMounted) return;
      
      // Throttle updates to avoid excessive geolocation requests
      const now = Date.now();
      if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
        return;
      }
      lastUpdate = now;

      setState({
        loading: false,
        accuracy: event.coords.accuracy,
        altitude: event.coords.altitude,
        altitudeAccuracy: event.coords.altitudeAccuracy,
        heading: event.coords.heading,
        latitude: event.coords.latitude,
        longitude: event.coords.longitude,
        speed: event.coords.speed,
        timestamp: event.timestamp,
        error: null,
      });
    };

    const onEventError = (error: GeolocationPositionError) => {
      if (isMounted) {
        setState(s => ({ ...s, loading: false, error }));
      }
    };

    // Use watchPosition for continuous tracking instead of just getCurrentPosition
    // With optimized options to reduce battery drain and violation warnings
    if (navigator.geolocation) {
      const defaultOptions: PositionOptions = {
        enableHighAccuracy: false, // Use low accuracy by default to reduce battery/processing
        maximumAge: 10000, // Cache position for 10 seconds
        timeout: 27000, // 27 second timeout
        ...optionsRef.current // Allow override
      };
      watchId = navigator.geolocation.watchPosition(onEvent, onEventError, defaultOptions);
    }

    return () => {
      isMounted = false;
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled]); // STABILITY FIX: Remove options from dependencies

  return state;
};

export default useGeolocation;
