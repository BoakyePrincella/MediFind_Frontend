import { useJsApiLoader } from '@react-google-maps/api';

const LIBRARIES: ('places')[] = ['places'];

export function useGoogleMaps() {
  return useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });
}