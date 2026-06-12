import apiClient from './client';
import type { Category, Product, Shop, ShopProduct, PaginatedResponse } from '../types';

// ── Categories ────────────────────────────────────
export const getCategories = () =>
  apiClient.get<Category[]>('/categories');

// ── Products ──────────────────────────────────────
export const searchProducts = (params: {
  q?: string; category_id?: number; city?: string; page?: number;
}) => apiClient.get<PaginatedResponse<Product>>('/products', { params });

export const getProduct = (slug: string) =>
  apiClient.get<{ product: Product; shops: ShopProduct[] }>(`/products/${slug}`);

// ── Shops ─────────────────────────────────────────
export const getShops = (params: {
  q?: string; city?: string; delivery?: boolean; verified?: boolean;
  lat?: number; lng?: number; radius_km?: number; page?: number;
}) => apiClient.get<PaginatedResponse<Shop>>('/shops', { params });

export const getShop = (slug: string) =>
  apiClient.get<{ shop: Shop; products: ShopProduct[] }>(`/shops/${slug}`);
