import { useState, useEffect } from 'react';
import { GoogleMap, Marker, Circle } from '@react-google-maps/api';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import ShopCard from '../components/ui/ShopCard';
import Spinner from '../components/ui/Spinner';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { searchProducts, getCategories, getShops } from '../api/public';
import type { Product, Category, Shop } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read everything from the URL — this is the single source of truth
  const q          = searchParams.get('q') ?? '';
  const categoryId = searchParams.get('category_id') ?? '';
  const city       = searchParams.get('city') ?? '';
  const type       = searchParams.get('type') ?? 'products'; // 'products' or 'shops'
  const lat        = searchParams.get('lat') ?? '';
  const lng        = searchParams.get('lng') ?? '';
  const radiusKm   = searchParams.get('radius_km') ?? '5';
  const { isLoaded } = useGoogleMaps();

  const [query,      setQuery]      = useState(q);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [shops,      setShops]      = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [lastPage,   setLastPage]   = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [locating,   setLocating]   = useState(false);

  // Load categories once for the sidebar filter
  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
  }, []);

  // Re-run search whenever URL params or page changes
  useEffect(() => {
    setLoading(true);
    setProducts([]);
    setShops([]);

    if (type === 'shops') {
      // Searching for shops
      getShops({
        city:      city || undefined,
        lat:       lat  ? Number(lat)  : undefined,
        lng:       lng  ? Number(lng)  : undefined,
        radius_km:  lat && lng ? Number(radiusKm) : undefined,
        page,
      }).then(r => {
        setShops(r.data.data);
        setTotal(r.data.total);
        setLastPage(r.data.last_page);
      }).finally(() => setLoading(false));
    } else {
      // Searching for products
      searchProducts({
        q:           q           || undefined,
        category_id: categoryId  ? Number(categoryId) : undefined,
        city:        city        || undefined,
        page,
      }).then(r => {
        setProducts(r.data.data);
        setTotal(r.data.total);
        setLastPage(r.data.last_page);
      }).finally(() => setLoading(false));
    }
  }, [q, categoryId, city, type, lat, lng, radiusKm, page]);

  // When user types and submits the search bar
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ q: query, type: 'products' });
  };

  // When a filter changes — update URL, reset to page 1
  const applyFilter = (key: string, value: string) => {
    setPage(1);
    const current = Object.fromEntries(searchParams.entries());
    if (value) {
      setSearchParams({ ...current, [key]: value, page: '1' });
    } else {
      delete current[key];
      setSearchParams({ ...current, page: '1' });
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const current = Object.fromEntries(searchParams.entries());
        setPage(1);
        setSearchParams({
          ...current,
          type: 'shops',
          lat: String(position.coords.latitude),
          lng: String(position.coords.longitude),
          radius_km: current.radius_km ?? radiusKm,
          page: '1',
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    const current = Object.fromEntries(searchParams.entries());
    delete current.lat;
    delete current.lng;
    delete current.radius_km;
    setPage(1);
    setSearchParams({ ...current, page: '1' });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for medicines, cosmetics, supplements..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
          />
          <button
            type="submit"
            className="px-5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex gap-8">

          {/* ── Sidebar filters ── */}
          <aside className="hidden md:block w-52 shrink-0">

            {/* Toggle: Products vs Shops */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Looking for
            </p>
            <div className="flex flex-col gap-1 mb-6">
              {[
                { label: 'Products',  value: 'products' },
                { label: 'Shops',     value: 'shops'    },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => applyFilter('type', opt.value)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    type === opt.value
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Category filter — only shown for products */}
            {type === 'products' && (
              <>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Category
                </p>
                <div className="flex flex-col gap-1 mb-6">
                  <button
                    onClick={() => applyFilter('category_id', '')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      !categoryId
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => applyFilter('category_id', String(cat.id))}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                        categoryId === String(cat.id)
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* City filter */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              City
            </p>
            <div className="flex flex-col gap-1">
              {['', 'Accra', 'Kumasi'].map(c => (
                <button
                  key={c}
                  onClick={() => applyFilter('city', c)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    city === c
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c || 'All cities'}
                </button>
              ))}
            </div>

            {type === 'shops' && (
              <div className="mt-6">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Distance
                </p>
                <button
                  onClick={useMyLocation}
                  disabled={locating}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    lat && lng
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  } disabled:opacity-60`}
                >
                  {locating ? 'Finding location...' : 'Near me'}
                </button>

                {lat && lng && (
                  <>
                    <select
                      value={radiusKm}
                      onChange={e => applyFilter('radius_km', e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-green-400 bg-white"
                    >
                      {[5, 10, 20, 50].map(radius => (
                        <option key={radius} value={radius}>
                          Within {radius} km
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={clearLocation}
                      className="mt-2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear location
                    </button>
                  </>
                )}
              </div>
            )}

          </aside>

          {/* ── Results area ── */}
          <div className="flex-1 min-w-0">

            {/* Results count + active filters */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p className="text-sm text-gray-400">
                {loading
                  ? 'Searching...'
                  : `${total} ${type === 'shops' ? 'shop' : 'product'}${total !== 1 ? 's' : ''} found`
                }
                {q && (
                  <span className="text-gray-600 ml-1">
                    for "<strong>{q}</strong>"
                  </span>
                )}
              </p>

              {/* Active filter pills */}
              <div className="flex gap-2 flex-wrap">
                {categoryId && (
                  <button
                    onClick={() => applyFilter('category_id', '')}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                  >
                    {categories.find(c => String(c.id) === categoryId)?.name} ✕
                  </button>
                )}
                {city && (
                  <button
                    onClick={() => applyFilter('city', '')}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                  >
                    {city} ✕
                  </button>
                )}
                {lat && lng && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    📍 Near you
                  </span>
                )}
              </div>
            </div>

            {/* Loading state */}
            {loading && <Spinner />}

            {/* Products grid */}
            {!loading && type === 'products' && (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-sm font-medium">No products found</p>
                    <p className="text-xs mt-1">Try a different search term or remove filters</p>
                    <button
                      onClick={() => {
                        setQuery('');
                        setSearchParams({});
                      }}
                      className="mt-4 text-xs text-green-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Shops grid */}
            {!loading && type === 'shops' && (
              <>
                {shops.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <p className="text-4xl mb-3">🏪</p>
                    <p className="text-sm font-medium">No shops found</p>
                    <p className="text-xs mt-1">Try a different city or remove filters</p>
                  </div>
                ) : (
                  <>
                    {lat && lng && isLoaded && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '200px' }}
                          center={{ lat: Number(lat), lng: Number(lng) }}
                          zoom={13}
                          options={{
                            streetViewControl: false,
                            mapTypeControl:    false,
                            fullscreenControl: false,
                            zoomControl:       false,
                          }}
                        >
                          {/* Customer location marker */}
                          <Marker
                            position={{ lat: Number(lat), lng: Number(lng) }}
                            icon={{
                              path: google.maps.SymbolPath.CIRCLE,
                              scale: 8,
                              fillColor: '#1D9E75',
                              fillOpacity: 1,
                              strokeColor: '#fff',
                              strokeWeight: 2,
                            }}
                          />
                          {/* Search radius circle */}
                          <Circle
                            center={{ lat: Number(lat), lng: Number(lng) }}
                            radius={Number(radiusKm) * 1000}
                            options={{
                              fillColor:     '#1D9E75',
                              fillOpacity:   0.08,
                              strokeColor:   '#1D9E75',
                              strokeOpacity: 0.3,
                              strokeWeight:  1,
                            }}
                          />
                        </GoogleMap>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {shops.map(s => (
                        <ShopCard key={s.id} shop={s} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Pagination */}
            {!loading && lastPage > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500 px-2">
                  Page {page} of {lastPage}
                </span>
                <button
                  disabled={page === lastPage}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}
