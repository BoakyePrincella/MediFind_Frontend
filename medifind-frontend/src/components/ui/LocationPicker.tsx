import { useState, useRef, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  Autocomplete,
} from '@react-google-maps/api';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface LocationResult {
  address:   string;
  latitude:  number;
  longitude: number;
}

interface Props {
  onSelect: (result: LocationResult) => void;
  defaultAddress?: string;
}

const GHANA_CENTER = { lat: 5.6037, lng: -0.1870 }; // Accra

const MAP_STYLES = {
  width:  '100%',
  height: '320px',
  borderRadius: '12px',
};

export default function LocationPicker({ onSelect, defaultAddress }: Props) {
  const { isLoaded } = useGoogleMaps();

  const [marker,  setMarker]  = useState<google.maps.LatLngLiteral | null>(null);
  const [address, setAddress] = useState(defaultAddress ?? '');
  const [mapRef,  setMapRef]  = useState<google.maps.Map | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // When admin selects an address from the autocomplete dropdown
  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const addr = place.formatted_address ?? address;

    setMarker({ lat, lng });
    setAddress(addr);
    mapRef?.panTo({ lat, lng });
    mapRef?.setZoom(17);

    onSelect({ address: addr, latitude: lat, longitude: lng });
  }, [mapRef, address, onSelect]);

  // When admin clicks anywhere on the map
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarker({ lat, lng });

    // Reverse geocode — convert coordinates back to a human address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const addr = results[0].formatted_address;
        setAddress(addr);
        onSelect({ address: addr, latitude: lat, longitude: lng });
      } else {
        // No address found — still save coordinates
        onSelect({ address: address, latitude: lat, longitude: lng });
      }
    });
  }, [address, onSelect]);

  // "Use my current location" button
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setMarker({ lat, lng });
      mapRef?.panTo({ lat, lng });
      mapRef?.setZoom(17);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const addr = results[0].formatted_address;
          setAddress(addr);
          onSelect({ address: addr, latitude: lat, longitude: lng });
        } else {
          onSelect({ address: '', latitude: lat, longitude: lng });
        }
      });
    });
  }, [mapRef, onSelect]);

  if (!isLoaded) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      {/* Address autocomplete input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Search address
        </label>
        <div className="flex gap-2">
          <Autocomplete
            onLoad={ref => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceSelect}
            options={{
              componentRestrictions: { country: 'gh' }, // Ghana only
              fields: ['formatted_address', 'geometry'],
            }}
            className="flex-1"
          >
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Type shop address — e.g. 45 Oxford Street, Osu, Accra"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
            />
          </Autocomplete>

          {/* Current location button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            title="Use current location"
            className="shrink-0 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors text-base"
          >
            📍
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Type the address above, click the map to drop a pin, or press 📍 to use current location
        </p>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={MAP_STYLES}
        center={marker ?? GHANA_CENTER}
        zoom={marker ? 16 : 7}
        onLoad={map => setMapRef(map)}
        onClick={handleMapClick}
        options={{
          streetViewControl:   false,
          mapTypeControl:      false,
          fullscreenControl:   false,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
        }}
      >
        {marker && (
          <Marker
            position={marker}
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>

      {/* Coordinates display */}
      {marker && (
        <div className="flex gap-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-gray-400">Latitude</p>
            <p className="text-sm font-medium text-gray-700 font-mono">
              {marker.lat.toFixed(6)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Longitude</p>
            <p className="text-sm font-medium text-gray-700 font-mono">
              {marker.lng.toFixed(6)}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400">Address</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{address}</p>
          </div>
        </div>
      )}

    </div>
  );
}