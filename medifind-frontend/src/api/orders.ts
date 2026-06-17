import apiClient from './client';
import type {
  Cart,
  CustomerAddress,
  FulfillmentType,
  Order,
  PaginatedResponse,
} from '../types';

type ApiData<T> = T | { data: T };

export const unwrap = <T>(payload: ApiData<T>): T =>
  payload && typeof payload === 'object' && 'data' in payload
    ? (payload as { data: T }).data
    : payload as T;

export const getCart = () =>
  apiClient.get<ApiData<Cart>>('/cart');

export const addToCart = (data: {
  shop_product_id?: number;
  product_id: number;
  shop_id: number;
  quantity: number;
}) => apiClient.post<ApiData<Cart>>('/cart/add', data);

export const updateCartItem = (id: number, data: { quantity: number }) =>
  apiClient.patch<ApiData<Cart>>(`/cart/items/${id}`, data);

export const removeCartItem = (id: number) =>
  apiClient.delete<ApiData<Cart>>(`/cart/items/${id}`);

export const clearCart = () =>
  apiClient.delete('/cart');

export const getAddresses = () =>
  apiClient.get<ApiData<CustomerAddress[]>>('/addresses');

export const createAddress = (data: Omit<CustomerAddress, 'id' | 'is_default'> & {
  is_default?: boolean;
}) => apiClient.post<ApiData<CustomerAddress>>('/addresses', data);

export const getDeliveryFee = (params: {
  address_id: number;
  shop_id?: number;
  fulfillment_type?: FulfillmentType;
}) => apiClient.get<ApiData<{ delivery_fee: number; distance_km?: number }>>('/delivery-fees', { params });

export const createOrder = (data: {
  fulfillment_type: FulfillmentType;
  payment_method: string;
  payment_provider?: string;
  address_id?: number;
  notes?: string;
}) => apiClient.post<ApiData<{
  order: Order;
  payment?: {
    reference?: string;
    authorization_url?: string;
    checkout_url?: string;
  };
} | Order>>('/orders', data);

export const getOrders = (page = 1) =>
  apiClient.get<ApiData<PaginatedResponse<Order> | Order[]>>('/orders', { params: { page } });

export const getOrder = (id: number | string) =>
  apiClient.get<ApiData<Order>>(`/orders/${id}`);

export const cancelOrder = (id: number | string, reason: string) =>
  apiClient.post<ApiData<Order>>(`/orders/${id}/cancel`, { reason });

export const trackOrder = (id: number | string) =>
  apiClient.get<ApiData<Order>>(`/orders/${id}/track`);
