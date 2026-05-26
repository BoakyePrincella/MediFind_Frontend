import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import { getProduct } from '../api/public';
import type { Product, ShopProduct } from '../types';
import { storageUrl } from '../utils/media';

export default function ProductPage() {
  const { slug }   = useParams<{ slug: string }>();
  const navigate   = useNavigate();

  const [product,      setProduct]      = useState<Product | null>(null);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [cityFilter,   setCityFilter]   = useState('');
  const [sortBy,       setSortBy]       = useState<'price' | 'distance'>('price');

  useEffect(() => {
    if (!slug) return;

    getProduct(slug)
      .then(r => {
        setProduct(r.data.product);
        setShopProducts(r.data.shops);
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Apply city filter and sort locally — no extra API call needed
  const filtered = shopProducts
    .filter(sp => {
      if (!cityFilter) return true;
      return sp.shop?.city === cityFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'distance') {
        const da = a.shop?.distance ?? 9999;
        const db = b.shop?.distance ?? 9999;
        return da - db;
      }
      return 0;
    });

  const inStockCount    = filtered.filter(sp => sp.in_stock).length;
  const lowestPrice     = filtered.length > 0 ? Math.min(...filtered.map(sp => sp.price)) : null;
  const highestPrice    = filtered.length > 0 ? Math.max(...filtered.map(sp => sp.price)) : null;

  if (loading) return <Layout><Spinner /></Layout>;
  if (!product) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>›</span>
          <Link to="/search" className="hover:text-gray-600 transition-colors">Products</Link>
          <span>›</span>
          {product.category && (
            <>
              <Link
                to={`/search?category_id=${product.category_id}`}
                className="hover:text-gray-600 transition-colors"
              >
                {product.category.name}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-gray-600">{product.name}</span>
        </div>

        {/* ── Product header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex gap-6 items-start">

            {/* Product image or emoji placeholder */}
            <div className="w-28 h-28 rounded-xl bg-green-50 flex items-center justify-center text-5xl shrink-0 overflow-hidden">
              {product.image ? (
                <img
                  src={storageUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                '💊'
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Category badge */}
              {product.category && (
                <Link
                  to={`/search?category_id=${product.category_id}`}
                  className="inline-block text-xs text-gray-400 bg-gray-100 hover:bg-green-50 hover:text-green-600 px-2 py-0.5 rounded-full mb-2 transition-colors"
                >
                  {product.category.name}
                </Link>
              )}

              <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>

              {product.brand && (
                <p className="text-sm text-gray-400 mt-0.5">by {product.brand}</p>
              )}

              {product.description && (
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Price range summary */}
              {lowestPrice !== null && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="bg-green-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Price range</p>
                    <p className="text-sm font-semibold text-green-700">
                      {lowestPrice === highestPrice
                        ? `GH₵ ${lowestPrice.toFixed(2)}`
                        : `GH₵ ${lowestPrice.toFixed(2)} – ${highestPrice!.toFixed(2)}`
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">Available at</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {inStockCount} shop{inStockCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Filter and sort bar ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-800">
            Where to buy
            {filtered.length > 0 && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({filtered.length} {filtered.length === 1 ? 'shop' : 'shops'})
              </span>
            )}
          </h2>

          <div className="flex gap-2">
            {/* City filter */}
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-400 bg-white text-gray-600"
            >
              <option value="">All cities</option>
              <option value="Accra">Accra</option>
              <option value="Kumasi">Kumasi</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'price' | 'distance')}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-400 bg-white text-gray-600"
            >
              <option value="price">Sort: Lowest price</option>
              <option value="distance">Sort: Nearest first</option>
            </select>
          </div>
        </div>

        {/* ── Shop listings ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-sm font-medium text-gray-600">
              No shops found{cityFilter ? ` in ${cityFilter}` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try selecting a different city
            </p>
            {cityFilter && (
              <button
                onClick={() => setCityFilter('')}
                className="mt-3 text-xs text-green-600 hover:underline"
              >
                Show all cities
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sp, index) => (
              <div
                key={sp.id}
                onClick={() => navigate(`/shops/${sp.shop?.slug}`)}
                className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-sm transition-all ${
                  sp.in_stock
                    ? 'border-gray-100 hover:border-green-200'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Rank badge — lowest price gets a highlight */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                    index === 0 && sortBy === 'price'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Shop avatar */}
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg shrink-0">
                    🏪
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {sp.shop?.name}
                      </p>
                      {sp.shop?.is_verified && (
                        <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      📍 {sp.shop?.address}, {sp.shop?.city}
                      {sp.shop?.distance != null && (
                        <span className="ml-1 text-blue-500">
                          · {sp.shop.distance.toFixed(1)} km away
                        </span>
                      )}
                    </p>

                    {/* Notes — e.g. "prescription required" */}
                    {sp.notes && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠ {sp.notes}
                      </p>
                    )}

                    {/* Shop capability tags */}
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {sp.shop?.offers_delivery && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          🚚 Delivery
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Walk-in
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and stock — right side */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold text-green-600">
                    GH₵ {sp.price.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${
                    sp.in_stock
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}>
                    {sp.in_stock ? 'In stock' : 'Out of stock'}
                  </span>
                  <p className="text-xs text-gray-300 mt-1">
                    View shop →
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* ── Back to search ── */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to results
          </button>
        </div>

      </div>
    </Layout>
  );
}
