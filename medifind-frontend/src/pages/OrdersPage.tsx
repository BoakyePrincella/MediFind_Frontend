import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import { getOrders, unwrap } from '../api/orders';
import type { Order, PaginatedResponse } from '../types';

const money = (value?: number) => `GHS ${(Number(value) || 0).toFixed(2)}`;

const statusLabel = (status?: string) =>
  (status ?? 'pending').replaceAll('_', ' ');

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders()
      .then(r => {
        const payload = unwrap(r.data);
        setOrders(Array.isArray(payload) ? payload : (payload as PaginatedResponse<Order>).data);
      })
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My orders</h1>
            <p className="text-sm text-gray-400 mt-1">Track pickup reservations and deliveries.</p>
          </div>
          <Link to="/cart" className="text-sm text-green-600 hover:underline">
            View cart
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-16 px-4 text-center">
            <p className="text-sm font-medium text-gray-700">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Your pickup and delivery orders will appear here.</p>
            <Link
              to="/search"
              className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    {order.fulfillment_type ?? 'pickup'} · {statusLabel(order.order_status)}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-green-600">{money(order.total_amount)}</p>
                  <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                    {statusLabel(order.payment_status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
