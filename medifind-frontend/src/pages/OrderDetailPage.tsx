import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import { cancelOrder, getOrder, trackOrder, unwrap } from '../api/orders';
import type { Order, OrderTrackingEvent } from '../types';

const money = (value?: number) => `GHS ${(Number(value) || 0).toFixed(2)}`;
const label = (status?: string) => (status ?? '').replaceAll('_', ' ');

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const loadOrder = () => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([getOrder(id), trackOrder(id)])
      .then(results => {
        const detail = results[0].status === 'fulfilled' ? unwrap(results[0].value.data) : null;
        const tracking = results[1].status === 'fulfilled' ? unwrap(results[1].value.data) : null;
        setOrder({ ...(detail ?? tracking), ...(tracking ?? {}) } as Order);
      })
      .catch(() => setError('Could not load this order.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const requestCancel = async () => {
    if (!id || !window.confirm('Cancel this order?')) return;
    setCancelling(true);
    setError('');
    try {
      const { data } = await cancelOrder(id, 'Cancelled by customer');
      setOrder(unwrap(data));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;
  if (!order) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-gray-500">
          Order not found.
        </div>
      </Layout>
    );
  }

  const tracking = (order.tracking ?? order.tracking_histories ?? []) as OrderTrackingEvent[];
  const canCancel = ['pending_payment', 'paid', 'confirmed'].includes(order.order_status);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <Link to="/orders" className="text-xs text-gray-400 hover:text-gray-600">Back to orders</Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-1">{order.order_number}</h1>
          </div>
          {canCancel && (
            <button
              onClick={requestCancel}
              disabled={cancelling}
              className="text-sm text-red-500 border border-red-100 rounded-xl px-4 py-2 hover:bg-red-50 disabled:opacity-60"
            >
              {cancelling ? 'Cancelling...' : 'Cancel order'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-5">
            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Items</h2>
              <div className="space-y-3">
                {(order.items ?? []).map(item => (
                  <div key={item.id} className="flex justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {item.product?.name ?? item.product_name ?? `Product #${item.product_id}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Qty {item.quantity} · {money(item.unit_price)}</p>
                    </div>
                    <p className="font-medium text-gray-800 shrink-0">{money(item.total_price)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Tracking</h2>
              {tracking.length === 0 ? (
                <p className="text-sm text-gray-400">Tracking updates will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {tracking.map((event, index) => (
                    <div key={event.id ?? `${event.status}-${index}`} className="flex gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {event.title ?? label(event.status)}
                        </p>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="bg-white border border-gray-100 rounded-2xl p-5 h-fit">
            <h2 className="text-base font-semibold text-gray-900">Order status</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Fulfillment</span>
                <span className="capitalize font-medium">{order.fulfillment_type ?? 'pickup'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order</span>
                <span className="capitalize font-medium">{label(order.order_status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="capitalize font-medium">{label(order.payment_status)}</span>
              </div>
              {order.delivery_status && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="capitalize font-medium">{label(order.delivery_status)}</span>
                </div>
              )}
            </div>

            {order.pickup_code && (
              <div className="mt-5 bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs text-green-700 font-medium">Pickup code</p>
                <p className="text-2xl font-semibold tracking-wide text-green-900 mt-1">{order.pickup_code}</p>
                <p className="text-xs text-green-700 mt-2">Show this code when you walk into the shop.</p>
              </div>
            )}

            <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{money(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span>{money(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-green-600">{money(order.total_amount)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
