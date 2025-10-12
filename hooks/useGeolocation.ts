import * as React from 'react';

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

const useGeolocation = (options: PositionOptions = {}) => {
  const [state, setState] = React.useState<GeolocationState>({
    loading: true,
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

  React.useEffect(() => {
    let isMounted = true;
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

    navigator.geolocation.getCurrentPosition(onEvent, onEventError, options);

    const watchId = navigator.geolocation.watchPosition(onEvent, onEventError, options);

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return state;
};

export default useGeolocation;
