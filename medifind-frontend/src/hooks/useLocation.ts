import { useState, useCallback } from 'react';

interface LocationState {
  lat:      number | null;
  lng:      number | null;
  error:    string | null;
  loading:  boolean;
  granted:  boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    lat:     null,
    lng:     null,
    error:   null,
    loading: false,
    granted: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({
        ...s,
        error: 'Your browser does not support location services.',
      }));
      return;
    }

    setState(s => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      // Success
      pos => {
        setState({
          lat:     pos.coords.latitude,
          lng:     pos.coords.longitude,
          error:   null,
          loading: false,
          granted: true,
        });
      },
      // Error
      err => {
        let message = 'Could not get your location.';

        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable right now.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
        }

        setState(s => ({ ...s, loading: false, error: message }));
      },
      // Options
      {
        enableHighAccuracy: true,  // use GPS not just wifi/cell
        timeout:            10000, // give up after 10 seconds
        maximumAge:         60000, // accept a cached location up to 1 min old
      }
    );
  }, []);

  return { ...state, requestLocation };
}