import { Link } from 'react-router-dom';
import type { Shop } from '../../types';

export default function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link
      to={`/shops/${shop.slug}`}
      className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 hover:border-green-200 hover:shadow-sm transition-all"
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-xl shrink-0">
        🏪
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800 truncate">{shop.name}</p>
          {shop.is_verified && (
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full shrink-0 font-medium">
              ✓ Verified
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-0.5 truncate">
          📍 {shop.address}, {shop.city}
          {shop.distance != null && ` · ${shop.distance.toFixed(1)} km`}
        </p>

        <div className="flex gap-2 mt-2 flex-wrap">
          {shop.offers_delivery && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              🚚 Delivery
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            Walk-in
          </span>
        </div>
      </div>
    </Link>
  );
}