import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import ShopCard from '../components/ui/ShopCard';
import Spinner from '../components/ui/Spinner';
import { getCategories, searchProducts, getShops } from '../api/public';
import { useLocation } from '../hooks/useLocation';
import type { Category, Product, Shop } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  pharmacy:    '💊',
  cosmetics:   '✨',
  supplements: '🛡️',
  herbal:      '🌿',
  'baby-care': '🍼',
  'first-aid': '🩹',
};

export default function HomePage() {
  const navigate                                      = useNavigate();
  const { lat, lng, loading: locLoading,
          error: locError, granted, requestLocation } = useLocation();

  const [query,        setQuery]        = useState('');
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [shops,        setShops]        = useState<Shop[]>([]);
  const [nearbyShops,  setNearbyShops]  = useState<Shop[]>([]);
  const [nearbyLoading,setNearbyLoading]= useState(false);
  const [pageLoading,  setPageLoading]  = useState(true);

  // Load homepage data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes, shopRes] = await Promise.all([
          getCategories(),
          searchProducts({}),
          getShops({}),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data.data.slice(0, 8));
        setShops(shopRes.data.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  // When location is granted — load nearby shops
  useEffect(() => {
    if (!lat || !lng) return;

    setNearbyLoading(true);
    getShops({ lat, lng, radius_km: 5 })
      .then(r => setNearbyShops(r.data.data))
      .catch(err => console.error(err))
      .finally(() => setNearbyLoading(false));
  }, [lat, lng]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Layout>

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100 py-16 px-4 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 leading-snug">
          Find any medicine or product
          <span className="text-green-600 block">at shops near you</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Search across pharmacies and cosmetic shops in Accra & Kumasi
        </p>

        <form
          onSubmit={handleSearch}
          className="max-w-lg mx-auto flex border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        >
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for Paracetamol, Nivea cream, Vitamin C..."
            className="flex-1 px-5 py-3.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="px-6 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick suggestions */}
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {['Paracetamol', 'Vitamin C', 'Cetaphil', 'Nivea', 'Amoxicillin', 'Coartem'].map(s => (
            <button
              key={s}
              onClick={() => navigate(`/search?q=${s}`)}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-full text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {pageLoading ? (
          <Spinner />
        ) : (
          <>
            {/* ── Location banner or nearby shops ── */}
            {!granted && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 mb-10 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Find shops near you right now
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Allow location access to see pharmacies and cosmetic shops within walking distance
                  </p>
                  {locError && (
                    <p className="text-xs text-red-500 mt-1">{locError}</p>
                  )}
                </div>
                <button
                  onClick={requestLocation}
                  disabled={locLoading}
                  className="text-xs bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors shrink-0 font-medium disabled:opacity-60 flex items-center gap-2"
                >
                  {locLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>📍 Enable location</>
                  )}
                </button>
              </div>
            )}

            {/* ── Nearby shops — shown after location granted ── */}
            {granted && (
              <section className="mb-12">
                <div className="flex justify-between items-baseline mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-gray-800">
                      Shops near you
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 Within 5 km of your current location
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/search?type=shops&lat=${lat}&lng=${lng}`)}
                    className="text-xs text-green-600 hover:underline"
                  >
                    See all nearby
                  </button>
                </div>

                {nearbyLoading ? (
                  <Spinner />
                ) : nearbyShops.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 px-5 py-8 text-center">
                    <p className="text-2xl mb-2">🏪</p>
                    <p className="text-sm text-gray-500">
                      No verified shops found within 5 km of your location
                    </p>
                    <button
                      onClick={() => navigate(`/search?type=shops&lat=${lat}&lng=${lng}&radius_km=20`)}
                      className="text-xs text-green-600 hover:underline mt-2 block"
                    >
                      Search within 20 km instead
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {nearbyShops.slice(0, 6).map(s => (
                      <ShopCard key={s.id} shop={s} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Categories ── */}
            <section className="mb-12">
              <div className="flex justify-between items-baseline mb-5">
                <h2 className="text-base font-semibold text-gray-800">
                  Browse by category
                </h2>
                <button
                  onClick={() => navigate('/search')}
                  className="text-xs text-green-600 hover:underline"
                >
                  View all
                </button>
              </div>

              {categories.length === 0 ? (
                <p className="text-sm text-gray-400">No categories yet.</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/search?category_id=${cat.id}`)}
                      className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-green-200 hover:shadow-sm transition-all group"
                    >
                      <div className="text-2xl mb-2">
                        {CATEGORY_ICONS[cat.slug] ?? '🏥'}
                      </div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                        {cat.name}
                      </p>
                      {cat.products_count !== undefined && (
                        <p className="text-xs text-gray-300 mt-0.5">
                          {cat.products_count} items
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* ── Trending products ── */}
            {products.length > 0 && (
              <section className="mb-12">
                <div className="flex justify-between items-baseline mb-5">
                  <h2 className="text-base font-semibold text-gray-800">
                    Trending products
                  </h2>
                  <button
                    onClick={() => navigate('/search')}
                    className="text-xs text-green-600 hover:underline"
                  >
                    See all
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {products.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {/* ── All verified shops ── */}
            {!granted && shops.length > 0 && (
              <section>
                <div className="flex justify-between items-baseline mb-5">
                  <h2 className="text-base font-semibold text-gray-800">
                    Verified shops
                  </h2>
                  <button
                    onClick={() => navigate('/search?type=shops')}
                    className="text-xs text-green-600 hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {shops.map(s => (
                    <ShopCard key={s.id} shop={s} />
                  ))}
                </div>
              </section>
            )}

          </>
        )}
      </div>
    </Layout>
  );
}