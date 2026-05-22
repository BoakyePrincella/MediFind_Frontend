import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import ShopCard from '../components/ui/ShopCard';
import Spinner from '../components/ui/Spinner';
import { getCategories, searchProducts, getShops } from '../api/public';
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
  const navigate = useNavigate();
  const [query,      setQuery]      = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [shops,      setShops]      = useState<Shop[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // All three requests fire at the same time
        const [catRes, prodRes, shopRes] = await Promise.all([
          getCategories(),
          searchProducts({}),
          getShops({}),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data.data.slice(0, 8));  // first 8 only
        setShops(shopRes.data.data.slice(0, 6));     // first 6 only
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Layout>

      {/* ── Hero section ── */}
      <div className="bg-white border-b border-gray-100 py-16 px-4 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 leading-snug">
          Find any medicine or product
          <span className="text-green-600 block">at shops near you</span>
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Search across pharmacies and cosmetic shops in Accra & Kumasi
        </p>

        {/* Search bar */}
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

        {/* Quick search suggestions */}
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {['Paracetamol', 'Vitamin C', 'Cetaphil', 'Nivea', 'Amoxicillin', 'Sanitizer'].map(s => (
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

      {/* ── Page content ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* ── Categories grid ── */}
            <section className="mb-12">
              <div className="flex justify-between items-baseline mb-5">
                <h2 className="text-base font-semibold text-gray-800">Browse by category</h2>
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
                  <h2 className="text-base font-semibold text-gray-800">Trending products</h2>
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

            {/* ── Location nudge banner ── */}
            <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 flex items-center justify-between mb-12 gap-4">
              <div>
                <p className="text-sm font-medium text-green-800">Find shops near you</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Allow location to see pharmacies within walking distance
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(pos => {
                    navigate(
                      `/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&type=shops`
                    );
                  });
                }}
                className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shrink-0 font-medium"
              >
                📍 Enable location
              </button>
            </div>

            {/* ── Verified shops ── */}
            {shops.length > 0 && (
              <section>
                <div className="flex justify-between items-baseline mb-5">
                  <h2 className="text-base font-semibold text-gray-800">Verified shops</h2>
                  <button
                    onClick={() => navigate('/search?type=shops')}
                    className="text-xs text-green-600 hover:underline"
                  >
                    View all shops
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {shops.map(s => (
                    <ShopCard key={s.id} shop={s} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state — when no data at all */}
            {products.length === 0 && shops.length === 0 && categories.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">💊</p>
                <p className="text-sm font-medium">Platform is being set up</p>
                <p className="text-xs mt-1">Check back soon — shops and products are being added</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}