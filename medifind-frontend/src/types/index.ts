// All shared TypeScript types for MediFind GH

export interface User {
  id:         number;
  fullname:       string;
  email:      string;
  phone:      string | null;
  avatar:     string | null;
  role:       'admin' | 'shop_owner' | 'customer';
  shop?:      Shop | null;
  created_at: string;
}

export interface Category {
  id:        number;
  name:      string;
  slug:      string;
  icon:      string | null;
  parent_id: number | null;
  is_active: boolean;
  children?: Category[];
  products_count?: number;
}

export interface Product {
  id:           number;
  name:         string;
  slug:         string;
  description:  string | null;
  brand:        string | null;
  image:        string | null;
  category_id:  number;
  is_active:    boolean;
  category?:    Category;
  shops_count?: number;
  created_at:   string;
}

export interface Shop {
  id:                 number;
  name:               string;
  slug:               string;
  description:        string | null;
  phone:              string | null;
  address:            string;
  city:               string;
  latitude:           number | null;
  longitude:          number | null;
  logo:               string | null;
  is_verified:        boolean;
  is_active:          boolean;
  offers_delivery:    boolean;
  delivery_radius_km: number | null;
  shop_products_count?: number;
  distance?:          number;
  owner?:             User;
}

export interface ShopProduct {
  id:         number;
  shop_id:    number;
  product_id: number;
  price:      number;
  in_stock:   boolean;
  notes:      string | null;
  shop?:      Shop;
  product?:   Product;
}

export interface PaginatedResponse<T> {
  data:          T[];
  current_page:  number;
  last_page:     number;
  per_page:      number;
  total:         number;
}

export interface AuthResponse {
  user:  User;
  token: string;
}

