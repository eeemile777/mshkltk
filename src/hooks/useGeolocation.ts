import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!enabled) {
      setState(s => ({ ...s, loading: false }));
      return;
    }

    let isMounted = true;
    let watchId: number | undefined;

    const onEvent = (event: GeolocationPosition) => {
      if (isMounted) {
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
      }
    };

    const onEventError = (error: GeolocationPositionError) => {
      if (isMounted) {
        setState(s => ({ ...s, loading: false, error }));
      }
    };

    // Use watchPosition for continuous tracking instead of just getCurrentPosition
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(onEvent, onEventError, options);
    }

    return () => {
      isMounted = false;
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, options]);

  return state;
};

export default useGeolocation;
