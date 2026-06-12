import { useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

const LIBRARIES: ('places')[] = ['places'];

export function useGoogleMaps() {
  const [authError, setAuthError] = useState(false);
  const loader = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
    language: 'en',
    region: 'GH',
  });

  useEffect(() => {
    window.gm_authFailure = () => setAuthError(true);

    return () => {
      window.gm_authFailure = undefined;
    };
  }, []);

  return { ...loader, authError };
}
