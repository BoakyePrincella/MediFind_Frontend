import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import { getCart, removeCartItem, unwrap, updateCartItem } from '../api/orders';
import type { Cart } from '../types';
import { storageUrl } from '../utils/media';

const money = (value?: number) => `GHS ${(Number(value) || 0).toFixed(2)}`;

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadCart = () => {
    setLoading(true);
    getCart()
      .then(r => setCart(unwrap(r.data)))
      .catch(() => setError('Could not load your cart. Please try again.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadCart, []);

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(id);
    setError('');
    try {
      const { data } = await updateCartItem(id, { quantity });
      setCart(unwrap(data));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not update cart item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id: number) => {
    setUpdatingId(id);
    setError('');
    try {
      const { data } = await removeCartItem(id);
      setCart(unwrap(data));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not remove cart item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const items = cart?.items ?? [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Cart</h1>
            <p className="text-sm text-gray-400 mt-1">Reserve for walk-in pickup or request delivery.</p>
          </div>
          <Link to="/orders" className="text-sm text-green-600 hover:underline">
            My orders
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-16 px-4 text-center">
            <p className="text-sm font-medium text-gray-700">Your cart is empty</p>
            <p className="text-xs text-gray-400 mt-1">Find a nearby shop and add products you want to pick up or receive.</p>
            <Link
              to="/search"
              className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {item.product?.image ? (
                      <img
                        src={storageUrl(item.product.image)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>Med</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name ?? `Product #${item.product_id}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {item.shop?.name ?? `Shop #${item.shop_id}`}
                    </p>
                    <p className="text-sm text-green-600 font-semibold mt-2">
                      {money(item.unit_price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id || item.quantity <= 1}
                        className="w-8 h-8 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-9 text-center text-sm text-gray-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="w-8 h-8 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updatingId === item.id}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white border border-gray-100 rounded-2xl p-5 h-fit">
              <h2 className="text-base font-semibold text-gray-900">Summary</h2>
              <div className="flex justify-between text-sm mt-5">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">{money(cart?.subtotal ?? cart?.total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Delivery fee is calculated at checkout. Walk-in pickup has no delivery fee.
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700"
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
