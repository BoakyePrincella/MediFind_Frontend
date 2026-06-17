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

export type FulfillmentType = 'pickup' | 'delivery';

export interface CartItem {
  id:              number;
  shop_product_id?: number;
  product_id:      number;
  shop_id:         number;
  quantity:        number;
  unit_price:      number;
  total_price:     number;
  product?:        Product;
  shop?:           Shop;
}

export interface Cart {
  id?:       number;
  items:    CartItem[];
  subtotal: number;
  total?:   number;
}

export interface CustomerAddress {
  id:                    number;
  type:                  'home' | 'work' | 'other';
  label?:                string | null;
  recipient_name:        string;
  phone:                 string;
  city:                  string;
  area?:                 string | null;
  street_address:        string;
  landmark?:             string | null;
  latitude?:             number | null;
  longitude?:            number | null;
  is_default:            boolean;
  delivery_instructions?: string | null;
}

export interface OrderItem {
  id:          number;
  product_id:  number;
  shop_id?:    number;
  vendor_id?:  number;
  product_name?: string;
  quantity:    number;
  unit_price:  number;
  total_price: number;
  product?:    Product;
  shop?:       Shop;
}

export interface OrderTrackingEvent {
  id:          number;
  status:      string;
  title?:      string;
  description?: string | null;
  created_at:  string;
}

export interface Order {
  id:                number;
  order_number:      string;
  subtotal:          number;
  delivery_fee:      number;
  discount:          number;
  total_amount:      number;
  payment_status:    string;
  order_status:      string;
  delivery_status?:  string;
  fulfillment_type?: FulfillmentType;
  pickup_code?:      string | null;
  notes?:            string | null;
  status?:           string;
  type?:             string;
  delivery_address?: string | null;
  created_at:        string;
  updated_at?:       string;
  customer?:         User;
  shop?:             Shop;
  items?:            OrderItem[];
  tracking?:         OrderTrackingEvent[];
  tracking_histories?: OrderTrackingEvent[];
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

