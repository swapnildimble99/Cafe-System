import { Booking, Order, MenuItem, BillRecord } from '../types';

const STORAGE_KEYS = {
  BOOKINGS: 'cafe_aura_bookings',
  ORDERS: 'cafe_aura_orders',
  BILLS: 'cafe_aura_bills_db'
};

// Indian Cafe Menu
export const INITIAL_MENU: MenuItem[] = [
  { 
    id: '1', 
    name: 'Cutting Chai', 
    description: 'Authentic Mumbai style strong tea with cardamom and ginger', 
    price: 20, 
    category: 'tea', 
    image: 'https://images.unsplash.com/photo-1571934811356-5cc55449d0f4?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '2', 
    name: 'Madras Filter Coffee', 
    description: 'Traditional South Indian coffee served in a davara tumbler', 
    price: 60, 
    category: 'coffee', 
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '3', 
    name: 'Bun Maska', 
    description: 'Soft fruit bun slathered with generous amounts of butter', 
    price: 45, 
    category: 'snacks', 
    image: 'https://images.unsplash.com/photo-1621235652554-061036329e46?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '4', 
    name: 'Vada Pav', 
    description: 'The Indian burger - spicy potato fritter in a soft bun with chutneys', 
    price: 50, 
    category: 'snacks', 
    image: 'https://images.unsplash.com/photo-1668236543090-d2f896911025?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '5', 
    name: 'Punjabi Samosa (2pcs)', 
    description: 'Crispy pastry filled with spiced potatoes and peas', 
    price: 40, 
    category: 'snacks', 
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '6', 
    name: 'Paneer Tikka Sandwich', 
    description: 'Grilled sandwich stuffed with spicy marinated paneer and veggies', 
    price: 180, 
    category: 'meals', 
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '7', 
    name: 'Cold Coffee with Ice Cream', 
    description: 'Classic Indian cafe style blended coffee with vanilla scoop', 
    price: 160, 
    category: 'coffee', 
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '8', 
    name: 'Gulab Jamun', 
    description: 'Soft milk dumplings soaked in rose flavored sugar syrup', 
    price: 80, 
    category: 'dessert', 
    image: 'https://images.unsplash.com/photo-1593701478586-89d2d8544d18?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '9', 
    name: 'Masala Dosa', 
    description: 'Crispy rice crepe filled with spiced potato masala', 
    price: 120, 
    category: 'meals', 
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '10', 
    name: 'Mango Lassi', 
    description: 'Thick and creamy yogurt drink with alphonso mango pulp', 
    price: 100, 
    category: 'coffee', 
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80' 
  },
];

export const StorageService = {
  // --- Bookings Collection ---
  getBookings: (): Booking[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getBookingById: (id: string): Booking | undefined => {
      const bookings = StorageService.getBookings();
      return bookings.find(b => b.id === id);
  },
  
  findActiveBooking: (mobile: string, tableNumber: number): Booking | undefined => {
      const bookings = StorageService.getBookings();
      // Find a booking that is either confirmed or active matching the credentials
      return bookings.find(b => 
          b.mobile === mobile && 
          Number(b.tableNumber) === tableNumber &&
          (b.status === 'confirmed' || b.status === 'active')
      );
  },

  saveBooking: (booking: Booking): void => {
    const bookings = StorageService.getBookings();
    // Check if updating or new
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) {
        bookings[idx] = booking;
    } else {
        bookings.push(booking);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  updateBookingStatus: (bookingId: string, status: Booking['status'], tableNumber?: number): void => {
      const bookings = StorageService.getBookings();
      const idx = bookings.findIndex(b => b.id === bookingId);
      if (idx >= 0) {
          bookings[idx].status = status;
          if (tableNumber !== undefined) {
              bookings[idx].tableNumber = tableNumber;
          }
          localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      }
  },

  // --- Orders Collection ---
  getOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getOrdersByBookingId: (bookingId: string): Order[] => {
    const orders = StorageService.getOrders();
    return orders.filter(o => o.bookingId === bookingId);
  },

  saveOrder: (order: Order): void => {
    const orders = StorageService.getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus: (orderId: string, status: any): void => {
    const orders = StorageService.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },
  
  // --- Bills / Transaction DB ---
  saveBillRecord: (bill: BillRecord): void => {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.BILLS);
        const bills: BillRecord[] = data ? JSON.parse(data) : [];
        bills.push(bill);
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
      } catch (e) {
          console.error("Failed to save bill record", e);
      }
  },

  getBillRecords: (): BillRecord[] => {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.BILLS);
        return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },

  clearData: () => {
      localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.BILLS);
  }
};