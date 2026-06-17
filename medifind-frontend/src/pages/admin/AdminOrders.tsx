import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import { adminGetOrders, adminGetOrderStats, adminUpdateOrderStatus } from '../../api/admin';
import type { Order } from '../../types';

const statuses = ['', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'];
const money = (value?: number) => `GHS ${(Number(value) || 0).toFixed(2)}`;
const label = (value?: string) => (value ?? '').replaceAll('_', ' ');
const orderList = (payload: any): Order[] => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, ready: 0, completed: 0, cancelled: 0, revenue: 0,
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadOrders = () => {
    setLoading(true);
    setError('');
    Promise.all([
      adminGetOrders({ status: status || undefined }),
      adminGetOrderStats(),
    ])
      .then(([ordersRes, statsRes]) => {
        setOrders(orderList(ordersRes.data));
        setStats(statsRes.data.data);
      })
      .catch((err: any) => setError(err.response?.data?.message ?? 'Could not load platform orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, [status]);

  const updateStatus = async (order: Order, nextStatus: string) => {
    setSavingId(order.id);
    setError('');
    try {
      const { data } = await adminUpdateOrderStatus(order.id, nextStatus);
      setOrders(current => current.map(item => item.id === order.id ? data.data : item));
      adminGetOrderStats().then(r => setStats(r.data.data));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not update order status.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Orders & Delivery</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Platform-wide order monitoring across customers, shops, pickup, and delivery.
            </p>
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-purple-400 capitalize"
          >
            {statuses.map(item => (
              <option key={item || 'all'} value={item}>{item ? label(item) : 'All statuses'}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            ['Total', stats.total],
            ['Pending', stats.pending],
            ['Confirmed', stats.confirmed],
            ['Ready', stats.ready],
            ['Completed', stats.completed],
            ['Cancelled', stats.cancelled],
            ['Revenue', money(stats.revenue)],
          ].map(([title, value]) => (
            <div key={title} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-lg font-semibold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{title}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-14 text-center">
            <p className="text-sm font-medium text-gray-700">No platform orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Orders from all shops will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                        {label(order.status ?? order.order_status)}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                        {order.fulfillment_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Shop: {order.shop?.name ?? 'Unknown shop'} · Customer: {order.customer?.fullname ?? 'Customer'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Contact: {order.customer?.phone ?? order.customer?.email ?? 'No contact'}
                    </p>
                    {order.delivery_address && (
                      <p className="text-xs text-gray-500 mt-1">Delivery: {order.delivery_address}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                  </div>

                  <div className="lg:text-right">
                    <p className="text-sm font-semibold text-green-600">{money(order.total_amount)}</p>
                    <select
                      value={order.status ?? 'pending'}
                      onChange={e => updateStatus(order, e.target.value)}
                      disabled={savingId === order.id}
                      className="mt-2 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white outline-none disabled:opacity-60 capitalize"
                    >
                      {statuses.filter(Boolean).map(item => (
                        <option key={item} value={item}>{label(item)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3 space-y-1">
                  {(order.items ?? []).map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-500">
                      <span>{item.product_name ?? item.product?.name} x {item.quantity}</span>
                      <span>{money(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
