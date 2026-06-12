import { useState, useEffect } from 'react';
import ShopLayout from '../../components/layout/ShopLayout';
import AddressAutocomplete from '../../components/ui/AddressAutocomplete';
import Spinner from '../../components/ui/Spinner';
import { getMyShop, updateMyShop } from '../../api/shop';
import type { Shop } from '../../types';

export default function ShopSettings() {
  const [shop,    setShop]    = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  // Form state
  const [description,       setDescription]       = useState('');
  const [phone,             setPhone]             = useState('');
  const [address,           setAddress]           = useState('');
  const [addressValid,      setAddressValid]      = useState(true);
  const [latitude,          setLatitude]          = useState<number | null>(null);
  const [longitude,         setLongitude]         = useState<number | null>(null);
  const [offersDelivery,    setOffersDelivery]    = useState(false);
  const [deliveryRadius,    setDeliveryRadius]    = useState('');

  useEffect(() => {
    getMyShop()
      .then(r => {
        const s = r.data;
        setShop(s);
        setDescription(s.description ?? '');
        setPhone(s.phone ?? '');
        setAddress(s.address ?? '');
        setAddressValid(Boolean(s.address));
        setLatitude(s.latitude);
        setLongitude(s.longitude);
        setOffersDelivery(s.offers_delivery);
        setDeliveryRadius(s.delivery_radius_km ? String(s.delivery_radius_km) : '');
      })
      .catch(() => setError('Could not load shop details.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    if (!addressValid) {
      setSaving(false);
      setError('Please choose a valid address from the suggestions before saving.');
      return;
    }

    // We use FormData because the endpoint accepts file uploads too
    const formData = new FormData();
    formData.append('description',       description);
    formData.append('phone',             phone);
    formData.append('address',           address);
    if (latitude != null && longitude != null) {
      formData.append('latitude',         String(latitude));
      formData.append('longitude',        String(longitude));
    }
    formData.append('offers_delivery',   offersDelivery ? '1' : '0');
    if (offersDelivery && deliveryRadius) {
      formData.append('delivery_radius_km', deliveryRadius);
    }

    try {
      const updated = await updateMyShop(formData);
      setShop(updated.data);
      setAddress(updated.data.address ?? address);
      setAddressValid(true);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Could not save changes.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ShopLayout><Spinner /></ShopLayout>;

  return (
    <ShopLayout>
      <div className="p-8 max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-800">Shop settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Update your shop information visible to customers
          </p>
        </div>

        {/* ── Read-only info banner ── */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 mb-6">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Managed by admin — contact MediFind GH to change these
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Shop name</p>
              <p className="text-gray-700 font-medium">{shop?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">City</p>
              <p className="text-gray-700 font-medium">{shop?.city}</p>
            </div>
          </div>
        </div>

        {/* ── Success banner ── */}
        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
            ✓ Changes saved successfully
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0244 000 000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
            />
          </div>

          <div>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              onValidityChange={valid => {
                setAddressValid(valid);
                if (!valid) {
                  setLatitude(null);
                  setLongitude(null);
                }
              }}
              onSelect={result => {
                setLatitude(result.latitude);
                setLongitude(result.longitude);
              }}
              placeholder="Street address"
              helperText="If you have moved, choose your new address from the suggestions and your map location updates automatically."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description
              <span className="text-gray-300 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell customers about your shop — what you specialise in, your hours, etc."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors resize-none"
            />
          </div>

          {/* Delivery toggle */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery service</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Show a delivery badge on your shop profile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOffersDelivery(!offersDelivery)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  offersDelivery ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  offersDelivery ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {offersDelivery && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Delivery radius (km)
                </label>
                <input
                  type="number"
                  value={deliveryRadius}
                  onChange={e => setDeliveryRadius(e.target.value)}
                  placeholder="e.g. 5"
                  min="1"
                  max="50"
                  className="w-32 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-400 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving || !addressValid}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

        </form>
      </div>
    </ShopLayout>
  );
}
