export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  SERVED = 'SERVED',
  PAID = 'PAID'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'snacks' | 'dessert' | 'meals';
  image: string;
}

export interface Booking {
  id: string;
  customerName: string;
  mobile: string;
  tableNumber: number | null; // Null until admin assigns it
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  bookingId: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  notes?: string;
  aiRecommendation?: string;
  paymentMethod?: 'Cash' | 'Online';
}

// Database Record for final billing
export interface BillRecord {
  id: string;
  customerName: string;
  tableNumber: number;
  mobile: string;
  totalAmount: number;
  date: string;
  time: string;
  paymentMethod?: 'Cash' | 'Online';
}

// App View State
export type ViewState = 'home' | 'booking' | 'table_access' | 'menu' | 'kitchen' | 'admin';