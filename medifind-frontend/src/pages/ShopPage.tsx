import { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { getShop } from '../api/public';
import type { Shop, ShopProduct } from '../types';
import { storageUrl } from '../utils/media';

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isLoaded } = useGoogleMaps();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!slug) return;

    getShop(slug)
      .then(r => {
        setShop(r.data.shop);
        setProducts(r.data.products);
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const searchTerm = search.toLowerCase();
  const filtered = products.filter(sp =>
    sp.product?.name.toLowerCase().includes(searchTerm) ||
    sp.product?.brand?.toLowerCase().includes(searchTerm) ||
    sp.product?.category?.name.toLowerCase().includes(searchTerm)
  );

  const mapsUrl = shop?.latitude && shop?.longitude
    ? `https://www.google.com/maps?q=${shop.latitude},${shop.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(
        `${shop?.name ?? ''} ${shop?.address ?? ''} ${shop?.city ?? ''}`
      )}`;

  const inStockCount = products.filter(sp => sp.in_stock).length;
  const outOfStockCount = products.filter(sp => !sp.in_stock).length;

  if (loading) return <Layout><Spinner /></Layout>;
  if (!shop) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link
            to="/search?type=shops"
            className="hover:text-gray-600 transition-colors"
          >
            Shops
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{shop.name}</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-sm font-medium text-green-700 shrink-0 overflow-hidden">
              {shop.logo ? (
                <img
                  src={storageUrl(shop.logo)}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                'Shop'
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-gray-900">{shop.name}</h1>
                {shop.is_verified && (
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400 mt-1">
                {shop.address}, {shop.city}
              </p>

              {shop.phone && (
                <a
                  href={`tel:${shop.phone}`}
                  className="text-sm text-gray-400 mt-0.5 hover:text-green-600 transition-colors block"
                >
                  {shop.phone}
                </a>
              )}

              {shop.description && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {shop.description}
                </p>
              )}

              <div className="flex gap-2 mt-4 flex-wrap">
                {shop.offers_delivery && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium">
                    Delivery available
                    {shop.delivery_radius_km && (
                      <span className="ml-1 opacity-70">
                        within {shop.delivery_radius_km} km
                      </span>
                    )}
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
                  Walk-in
                </span>
                {shop.phone && (
                  <a
                    href={`tel:${shop.phone}`}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Call shop
                  </a>
                  )}
              </div>

              {shop.latitude && shop.longitude && isLoaded && (
                <div className="mt-5 rounded-xl overflow-hidden border border-gray-100">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '180px' }}
                    center={{ lat: shop.latitude, lng: shop.longitude }}
                    zoom={16}
                    options={{
                      streetViewControl: false,
                      mapTypeControl:    false,
                      fullscreenControl: false,
                      zoomControl:       false,
                      gestureHandling:   'none',
                    }}
                  >
                    <Marker
                      position={{ lat: shop.latitude, lng: shop.longitude }}
                      animation={google.maps.Animation.DROP}
                    />
                  </GoogleMap>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 bg-white border-t border-gray-100 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium"
                  >
                    📍 Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-semibold text-gray-800">{products.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total products</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-semibold text-green-600">{inStockCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">In stock</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-semibold text-red-400">{outOfStockCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">Out of stock</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-800">
            Products
            {filtered.length !== products.length && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({filtered.length} of {products.length})
              </span>
            )}
          </h2>

          {products.length > 5 && (
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search this shop..."
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-400 transition-colors w-48"
            />
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-sm font-medium text-gray-600">No products listed yet</p>
            <p className="text-xs text-gray-400 mt-1">
              This shop has not added any products yet
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-sm font-medium text-gray-600">
              No products matching "{search}"
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-xs text-green-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(sp => (
              <Link
                key={sp.id}
                to={`/products/${sp.product?.slug}`}
                className={`bg-white rounded-xl border p-4 flex justify-between items-start hover:shadow-sm transition-all ${
                  sp.in_stock
                    ? 'border-gray-100 hover:border-green-200'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {sp.product?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sp.product?.category?.name}
                    {sp.product?.brand && (
                      <span className="ml-1 text-gray-300">- {sp.product.brand}</span>
                    )}
                  </p>
                  {sp.notes && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      Note: {sp.notes}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-green-600">
                    GHS {sp.price.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                    sp.in_stock
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {sp.in_stock ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to results
          </button>
        </div>
      </div>
    </Layout>
  );
}
