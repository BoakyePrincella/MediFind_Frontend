import apiClient from './client';
import type {
  Shop, Product, Category,
  PaginatedResponse
} from '../types';

// ── Categories ─────────────────────────────────────
export const adminGetCategories = () =>
  apiClient.get<Category[]>('/admin/categories');

export const adminCreateCategory = (data: {
  name: string; icon?: string; parent_id?: number; is_active: boolean;
}) => apiClient.post<Category>('/admin/categories', data);

export const adminUpdateCategory = (id: number, data: Partial<{
  name: string; icon: string; is_active: boolean;
}>) => apiClient.put<Category>(`/admin/categories/${id}`, data);

export const adminDeleteCategory = (id: number) =>
  apiClient.delete(`/admin/categories/${id}`);

// ── Products ───────────────────────────────────────
export const adminGetProducts = (params?: {
  q?: string; category_id?: number; page?: number;
}) =>
  apiClient
    .get<PaginatedResponse<Product>>('/admin/products', { params })
    .catch((error) => {
      const status = error.response?.status;

      if (status === 404 || status >= 500) {
        return apiClient.get<PaginatedResponse<Product>>('/products', { params });
      }

      return Promise.reject(error);
    });

export const adminCreateProduct = (data: FormData) =>
  apiClient.post<Product>('/admin/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const adminUpdateProduct = (id: number, data: FormData) =>
  apiClient.post<Product>(`/admin/products/${id}?_method=PUT`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const adminDeleteProduct = (id: number) =>
  apiClient.delete(`/admin/products/${id}`);

// ── Shops ──────────────────────────────────────────
export const adminGetShops = (params?: {
  city?: string; verified?: boolean; page?: number;
}) => apiClient.get<PaginatedResponse<Shop>>('/admin/shops', { params });

export const adminCreateShop = (data: object) =>
  apiClient.post<Shop>('/admin/shops', data);

export const adminVerifyShop = (id: number) =>
  apiClient.patch(`/admin/shops/${id}/verify`);

export const adminDeleteShop = (id: number) =>
  apiClient.delete(`/admin/shops/${id}`);

export const adminAddProductToShop = (
  shopId: number,
  data: { product_id: number; price: number; in_stock: boolean }
) => apiClient.post(`/admin/shops/${shopId}/products`, data);
