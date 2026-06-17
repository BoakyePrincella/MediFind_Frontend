import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Spinner from '../components/ui/Spinner';
import {
  createAddress,
  createOrder,
  getAddresses,
  getCart,
  getDeliveryFee,
  unwrap,
} from '../api/orders';
import type { Cart, CustomerAddress, FulfillmentType } from '../types';

const money = (value?: number) => `GHS ${(Number(value) || 0).toFixed(2)}`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [addressId, setAddressId] = useState<number | ''>('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pay_on_pickup');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addressForm, setAddressForm] = useState({
    type: 'home' as const,
    recipient_name: '',
    phone: '',
    city: '',
    area: '',
    street_address: '',
    landmark: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    Promise.all([getCart(), getAddresses()])
      .then(([cartResponse, addressResponse]) => {
        const loadedCart = unwrap(cartResponse.data);
        setCart(loadedCart);
        setAddresses(unwrap(addressResponse.data));
        if ((loadedCart.items ?? []).length === 0) navigate('/cart', { replace: true });
      })
      .catch(() => setError('Could not load checkout details.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (fulfillmentType === 'pickup') {
      setDeliveryFee(0);
      if (paymentMethod === 'mobile_money') setPaymentMethod('pay_on_pickup');
      return;
    }

    if (!addressId) return;

    getDeliveryFee({ address_id: Number(addressId), fulfillment_type: fulfillmentType })
      .then(r => setDeliveryFee(Number(unwrap(r.data).delivery_fee) || 0))
      .catch(() => setDeliveryFee(0));
  }, [addressId, fulfillmentType, paymentMethod]);

  const subtotal = Number(cart?.subtotal ?? cart?.total ?? 0);
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setError('');
    try {
      const { data } = await createAddress({
        ...addressForm,
        latitude: addressForm.latitude ? Number(addressForm.latitude) : null,
        longitude: addressForm.longitude ? Number(addressForm.longitude) : null,
        is_default: addresses.length === 0,
      });
      const saved = unwrap(data);
      setAddresses(current => [...current, saved]);
      setAddressId(saved.id);
      setAddressForm({
        type: 'home',
        recipient_name: '',
        phone: '',
        city: '',
        area: '',
        street_address: '',
        landmark: '',
        latitude: '',
        longitude: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const placeOrder = async () => {
    if (fulfillmentType === 'delivery' && !addressId) {
      setError('Please select or add a delivery address.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await createOrder({
        fulfillment_type: fulfillmentType,
        payment_method: paymentMethod,
        payment_provider: paymentMethod,
        address_id: fulfillmentType === 'delivery' ? Number(addressId) : undefined,
        notes,
      });

      const result = unwrap(data);
      const order = 'order' in result ? result.order : result;
      const payment = 'payment' in result ? result.payment : undefined;
      const redirectUrl = payment?.authorization_url ?? payment?.checkout_url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><Spinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Checkout</h1>
        <p className="text-sm text-gray-400 mb-6">Pickup is optimized for customers who walk into the closest shop.</p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-5">
            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Fulfillment</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'pickup', label: 'Walk-in pickup', detail: 'Reserve and collect from the shop' },
                  { value: 'delivery', label: 'Delivery', detail: 'Send to a saved address' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFulfillmentType(option.value as FulfillmentType)}
                    className={`text-left border rounded-xl p-4 transition-colors ${
                      fulfillmentType === option.value
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                    <span className="block text-xs text-gray-500 mt-1">{option.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            {fulfillmentType === 'delivery' && (
              <section className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Delivery address</h2>

                {addresses.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {addresses.map(address => (
                      <label key={address.id} className="flex gap-3 border border-gray-100 rounded-xl p-3 cursor-pointer">
                        <input
                          type="radio"
                          name="address"
                          checked={addressId === address.id}
                          onChange={() => setAddressId(address.id)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-gray-800">
                            {address.recipient_name} · {address.phone}
                          </span>
                          <span className="block text-xs text-gray-400 truncate">
                            {address.street_address}, {address.area}, {address.city}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <form onSubmit={saveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input required placeholder="Recipient name" value={addressForm.recipient_name} onChange={e => setAddressForm(v => ({ ...v, recipient_name: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <input required placeholder="Phone" value={addressForm.phone} onChange={e => setAddressForm(v => ({ ...v, phone: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <input required placeholder="City" value={addressForm.city} onChange={e => setAddressForm(v => ({ ...v, city: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <input placeholder="Area" value={addressForm.area} onChange={e => setAddressForm(v => ({ ...v, area: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <input required placeholder="Street address" value={addressForm.street_address} onChange={e => setAddressForm(v => ({ ...v, street_address: e.target.value }))} className="md:col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <input placeholder="Latitude" value={addressForm.latitude} onChange={e => setAddressForm(v => ({ ...v, latitude: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <input placeholder="Longitude" value={addressForm.longitude} onChange={e => setAddressForm(v => ({ ...v, longitude: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400" />
                  <button disabled={savingAddress} className="md:col-span-2 bg-gray-900 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-60">
                    {savingAddress ? 'Saving address...' : 'Save address'}
                  </button>
                </form>
              </section>
            )}

            <section className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(fulfillmentType === 'pickup'
                  ? ['pay_on_pickup', 'mobile_money', 'paystack']
                  : ['mobile_money', 'paystack', 'flutterwave']
                ).map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`border rounded-xl px-3 py-3 text-sm text-left capitalize ${
                      paymentMethod === method
                        ? 'border-green-300 bg-green-50 text-green-800'
                        : 'border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {method.replaceAll('_', ' ')}
                  </button>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes for the shop"
                className="mt-4 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400 min-h-24"
              />
            </section>
          </div>

          <aside className="bg-white border border-gray-100 rounded-2xl p-5 h-fit">
            <h2 className="text-base font-semibold text-gray-900">Order summary</h2>
            <div className="space-y-3 mt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                <span className="font-medium">{money(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-900 font-semibold">Total</span>
                <span className="text-green-600 font-semibold">{money(total)}</span>
              </div>
            </div>
            <button
              onClick={placeOrder}
              disabled={submitting}
              className="w-full mt-5 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Placing order...' : 'Place order'}
            </button>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
