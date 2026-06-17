import apiClient from './client';
import type { Order, Shop, ShopProduct, PaginatedResponse } from '../types';

export const getMyShop = () =>
  apiClient.get<Shop>('/shop/profile');

export const updateMyShop = (data: FormData) =>
  apiClient.post<Shop>('/shop/profile?_method=PUT', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getInventory = (page = 1) =>
  apiClient.get<PaginatedResponse<ShopProduct>>('/shop/inventory', { params: { page } });

export const addToInventory = (data: {
  product_id: number; price: number; in_stock: boolean; notes?: string;
}) => apiClient.post<ShopProduct>('/shop/inventory', data);

export const createInventoryProduct = (data: FormData) =>
  apiClient.post<ShopProduct>('/shop/inventory/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateInventoryItem = (id: number, data: {
  price?: number; in_stock?: boolean; notes?: string;
}) => apiClient.put<ShopProduct>(`/shop/inventory/${id}`, data);

export const removeFromInventory = (id: number) =>
  apiClient.delete(`/shop/inventory/${id}`);

export const getShopOrders = (params?: { status?: string; page?: number }) =>
  apiClient.get<{ data: PaginatedResponse<Order> }>('/shop/orders', { params });

export const getShopOrder = (id: number | string) =>
  apiClient.get<{ data: Order }>(`/shop/orders/${id}`);

export const updateShopOrderStatus = (id: number | string, status: string) =>
  apiClient.patch<{ data: Order }>(`/shop/orders/${id}/status`, { status });
