import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShopLayout from '../../components/layout/ShopLayout';
import Spinner from '../../components/ui/Spinner';
import { getMyShop } from '../../api/shop';
import type { Shop } from '../../types';

export default function ShopDashboard() {
  const [shop,    setShop]    = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getMyShop()
      .then(r => setShop(r.data))
      .catch(() => setError('Could not load your shop details.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ShopLayout><Spinner /></ShopLayout>;

  if (error) return (
    <ShopLayout>
      <div className="p-8 text-center text-red-500 text-sm">{error}</div>
    </ShopLayout>
  );

  return (
    <ShopLayout>
      <div className="p-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome back{shop ? `, ${shop.name}` : ''}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here is an overview of your shop on MediFind GH
          </p>
        </div>

        {/* ── Status banner ── */}
        {shop && !shop.is_verified && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
            <span className="text-xl shrink-0">⏳</span>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Your shop is pending verification
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                The MediFind GH team will verify your shop shortly.
                You can still add products in the meantime.
              </p>
            </div>
          </div>
        )}

        {shop && shop.is_verified && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
            <span className="text-xl shrink-0">✅</span>
            <div>
              <p className="text-sm font-medium text-green-800">
                Your shop is verified and live
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Customers can find your shop and products on MediFind GH.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats cards ── */}
        {shop && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-2xl font-semibold text-gray-800">
                {shop.shop_products_count ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Products listed</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-2xl font-semibold text-gray-800">
                {shop.city}
              </p>
              <p className="text-xs text-gray-400 mt-1">City</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-2xl font-semibold text-gray-800">
                {shop.is_verified ? '✓' : '–'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Verification</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-2xl font-semibold text-gray-800">
                {shop.offers_delivery ? 'Yes' : 'No'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Delivery</p>
            </div>
          </div>
        )}

        {/* ── Shop details card ── */}
        {shop && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Shop details</h2>
              <Link
                to="/dashboard/settings"
                className="text-xs text-green-600 hover:underline"
              >
                Edit settings
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Shop name</p>
                <p className="text-gray-700">{shop.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                <p className="text-gray-700">{shop.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Address</p>
                <p className="text-gray-700">{shop.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Delivery radius</p>
                <p className="text-gray-700">
                  {shop.offers_delivery && shop.delivery_radius_km
                    ? `${shop.delivery_radius_km} km`
                    : 'No delivery'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/dashboard/inventory"
            className="bg-white rounded-xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all flex items-center gap-4"
          >
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-xl shrink-0">
              📦
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Manage inventory</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Add products, update prices, toggle stock
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/settings"
            className="bg-white rounded-xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all flex items-center gap-4"
          >
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-xl shrink-0">
              ⚙️
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Shop settings</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Update address, phone, delivery options
              </p>
            </div>
          </Link>
        </div>

      </div>
    </ShopLayout>
  );
}