import { useEffect, useRef, useState } from 'react';

interface AddressResult {
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
  };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: AddressResult) => void;
  onValidityChange?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

const getCity = (suggestion: Suggestion) => {
  const address = suggestion.address;
  return address?.city ??
    address?.town ??
    address?.village ??
    address?.municipality ??
    address?.county ??
    address?.state;
};

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  onValidityChange,
  label = 'Address',
  placeholder = 'Start typing an address',
  helperText,
  required = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const selectedAddressRef = useRef('');

  useEffect(() => {
    const query = value.trim();

    if (query === selectedAddressRef.current) {
      return;
    }

    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError('');

      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '6',
        countrycodes: 'gh',
      });

      fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        signal: controller.signal,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Address search failed.');
          }

          return response.json() as Promise<Suggestion[]>;
        })
        .then(results => {
          setSuggestions(results);
          setOpen(results.length > 0);
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          setSuggestions([]);
          setOpen(false);
          setError('Address suggestions are unavailable right now. Try again in a moment.');
        })
        .finally(() => setSearching(false));
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  const handleInputChange = (nextValue: string) => {
    selectedAddressRef.current = '';
    onChange(nextValue);
    onValidityChange?.(false);
    setOpen(nextValue.trim().length >= 3);
  };

  const handleSelect = (suggestion: Suggestion) => {
    selectedAddressRef.current = suggestion.display_name;
    onChange(suggestion.display_name);
    onValidityChange?.(true);
    onSelect?.({
      address: suggestion.display_name,
      city: getCity(suggestion),
      latitude: Number(suggestion.lat),
      longitude: Number(suggestion.lon),
      placeId: String(suggestion.place_id),
    });
    setOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
      />

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors"
            >
              {suggestion.display_name}
            </button>
          ))}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-gray-400 mt-1">
          {helperText}
        </p>
      )}
      {searching && (
        <p className="text-xs text-gray-400 mt-1">
          Looking for matching addresses...
        </p>
      )}
      {error && (
        <p className="text-xs text-amber-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
