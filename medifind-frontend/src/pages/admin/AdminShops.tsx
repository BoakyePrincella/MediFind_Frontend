import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import {
  adminGetShops,
  adminCreateShop,
  adminVerifyShop,
  adminDeleteShop,
} from '../../api/admin';
import type { Shop } from '../../types';

export default function AdminShops() {
  const [shops,    setShops]    = useState<Shop[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total,    setTotal]    = useState(0);
  const [filter,   setFilter]   = useState<'all' | 'unverified'>('all');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);

  // Form fields
  const [ownerName,     setOwnerName]     = useState('');
  const [ownerEmail,    setOwnerEmail]    = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerPhone,    setOwnerPhone]    = useState('');
  const [shopName,      setShopName]      = useState('');
  const [address,       setAddress]       = useState('');
  const [city,          setCity]          = useState('Accra');
  const [latitude,      setLatitude]      = useState('');
  const [longitude,     setLongitude]     = useState('');
  const [offersDelivery,setOffersDelivery]= useState(false);
  const [deliveryRadius,setDeliveryRadius]= useState('');

  useEffect(() => { load(); }, [page, filter]);

  const load = () => {
    setLoading(true);
    adminGetShops({
      verified: filter === 'unverified' ? false : undefined,
      page,
    })
      .then(r => {
        setShops(r.data.data);
        setLastPage(r.data.last_page);
        setTotal(r.data.total);
      })
      .catch(() => setError('Could not load shops.'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminCreateShop({
        owner_name:         ownerName,
        owner_email:        ownerEmail,
        owner_password:     ownerPassword,
        owner_phone:        ownerPhone || undefined,
        name:               shopName,
        address,
        city,
        latitude:           latitude  ? Number(latitude)  : undefined,
        longitude:          longitude ? Number(longitude) : undefined,
        offers_delivery:    offersDelivery,
        delivery_radius_km: deliveryRadius ? Number(deliveryRadius) : undefined,
      });
      // Reset form
      setOwnerName(''); setOwnerEmail(''); setOwnerPassword('');
      setOwnerPhone(''); setShopName(''); setAddress('');
      setCity('Accra'); setLatitude(''); setLongitude('');
      setOffersDelivery(false); setDeliveryRadius('');
      setShowForm(false);
      setSuccess('Shop and owner account created successfully.');
      setTimeout(() => setSuccess(''), 4000);
      load();
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      if (errs) {
        const first = Object.values(errs)[0] as string[];
        setError(first[0]);
      } else {
        setError(err.response?.data?.message ?? 'Could not create shop.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (shop: Shop) => {
    setError('');
    try {
      await adminVerifyShop(shop.id);
      setSuccess(`${shop.name} has been verified.`);
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch {
      setError('Could not verify shop.');
    }
  };

  const handleDelete = async (shop: Shop) => {
    if (!confirm(`Delete "${shop.name}" and its owner account? This cannot be undone.`)) return;
    setError('');
    try {
      await adminDeleteShop(shop.id);
      setSuccess('Shop deleted.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not delete shop.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Shops</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} shops on the platform</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            {showForm ? '✕ Cancel' : '+ Add shop'}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Add shop form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-700">Add new shop</h2>

            <div className="border-b border-gray-100 pb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Owner account
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
                  <input value={ownerName} onChange={e => setOwnerName(e.target.value)} required placeholder="Kofi Mensah"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                  <input value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} required type="email" placeholder="owner@shop.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                  <input value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} required type="password" placeholder="Min 8 characters"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Phone <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <input value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="0244 000 000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Shop details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Shop name</label>
                  <input value={shopName} onChange={e => setShopName(e.target.value)} required placeholder="Kofi Pharmacy Osu"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 bg-white">
                    <option value="Accra">Accra</option>
                    <option value="Kumasi">Kumasi</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} required placeholder="45 Oxford Street, Osu"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Latitude <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="5.5600" type="number" step="any"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Longitude <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-0.1870" type="number" step="any"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400" />
                </div>

                {/* Delivery toggle */}
                <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Offers delivery</p>
                      <p className="text-xs text-gray-400 mt-0.5">Does this shop deliver to customers?</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOffersDelivery(!offersDelivery)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${offersDelivery ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${offersDelivery ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {offersDelivery && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery radius (km)</label>
                      <input value={deliveryRadius} onChange={e => setDeliveryRadius(e.target.value)} placeholder="e.g. 5" type="number" min="1"
                        className="w-32 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-green-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Creating...' : 'Create shop and owner account'}
            </button>
          </form>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { label: 'All shops',   value: 'all'        },
            { label: 'Unverified',  value: 'unverified' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setFilter(tab.value as any); setPage(1); }}
              className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${
                filter === tab.value
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Shops list */}
        {loading ? <Spinner /> : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {shops.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-3xl mb-2">🏪</p>
                  <p className="text-sm">No shops found.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    <div className="col-span-4">Shop</div>
                    <div className="col-span-2">City</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2"></div>
                  </div>
                  {shops.map(shop => (
                    <div
                      key={shop.id}
                      className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-4">
                        <p className="text-sm font-medium text-gray-800">{shop.name}</p>
                        <p className="text-xs text-gray-400 truncate">{shop.address}</p>
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">{shop.city}</div>
                      <div className="col-span-2 text-sm text-gray-500 truncate">
                        {shop.owner?.fullname ?? '—'}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        {shop.is_verified ? (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 flex gap-2 justify-end">
                        {!shop.is_verified && (
                          <button
                            onClick={() => handleVerify(shop)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        <Link
                          to={`/shops/${shop.slug}`}
                          target="_blank"
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(shop)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {lastPage > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  ← Previous
                </button>
                <span className="text-sm text-gray-500 px-2">Page {page} of {lastPage}</span>
                <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}