import React, { useState, useEffect } from 'react';
import { saveTransaction } from '../services/transactionApi';

import { Booking, MenuItem, CartItem, Order, OrderStatus, BillRecord } from '../types';
import { INITIAL_MENU, StorageService } from '../services/storage';
import { getChefRecommendation } from '../services/gemini';

interface Props {
  booking: Booking;
  onOrderPlaced: () => void;
}

export const MenuView: React.FC<Props> = ({ booking, onOrderPlaced }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [aiTip, setAiTip] = useState<string>('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [viewMode, setViewMode] = useState<'menu' | 'bill'>('menu');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<Order | null>(null);

  // Fetch orders for this booking to show bill
  useEffect(() => {
    if (viewMode === 'bill') {
      const orders = StorageService.getOrdersByBookingId(booking.id);
      setMyOrders(orders);
    }
  }, [viewMode, booking.id]);

  // Gemini AI Recommendation Trigger
  useEffect(() => {
    const fetchRecommendation = async () => {
      if (cart.length > 0) {
        const uniqueItems = Array.from(new Set(cart.map(c => c.id)))
          .map(id => cart.find(c => c.id === id))
          .filter((i): i is CartItem => !!i);
        
        const tip = await getChefRecommendation(uniqueItems);
        setAiTip(tip);
      } else {
        setAiTip('');
      }
    };

    const timer = setTimeout(fetchRecommendation, 1500);
    return () => clearTimeout(timer);
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
      setCart(prev => {
          return prev.map(item => {
              if (item.id === itemId) {
                  return { ...item, quantity: item.quantity + delta };
              }
              return item;
          }).filter(item => item.quantity > 0);
      });
      // Close mobile cart if empty
      if (cart.length === 1 && cart[0].quantity === 1 && delta === -1) {
          setShowMobileCart(false);
      }
  };

  const getItemQuantity = (itemId: string) => {
      return cart.find(i => i.id === itemId)?.quantity || 0;
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculateTotalItems = () => cart.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    const order: Order = {
      id: Date.now().toString(),
      bookingId: booking.id,
      tableNumber: booking.tableNumber!, // Assumed active table
      items: cart,
      totalAmount: calculateTotal(),
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      aiRecommendation: aiTip
    };

    StorageService.saveOrder(order);
    setTimeout(() => {
        setIsOrdering(false);
        setCart([]);
        setShowMobileCart(false);
        onOrderPlaced();
        setViewMode('bill'); // Switch to bill view after ordering
    }, 1000);
  };

  const handleProcessPayment = async (method: 'Cash' | 'Online') => {
  if (!showPaymentModal) return;

  const order = showPaymentModal;

  try {
    await saveTransaction({
      customer: booking.customerName,
      mobile: booking.mobile,
      tableNo: booking.tableNumber!,
      method: method,
      amount: order.totalAmount
    });

    StorageService.updateOrderStatus(order.id, OrderStatus.PAID);

    const updatedOrder = {
      ...order,
      status: OrderStatus.PAID,
      paymentMethod: method
    };

    setMyOrders(prev =>
      prev.map(o => (o.id === order.id ? updatedOrder : o))
    );

    setShowPaymentModal(null);
    alert(`Payment Successful via ${method}!`);
  } catch (error: any) {
    console.error("Payment failed:", error);
    alert("Payment failed. Please try again.");
  }
};






  const filteredMenu = activeCategory === 'all' 
    ? INITIAL_MENU 
    : INITIAL_MENU.filter(i => i.category === activeCategory);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      {/* Top Bar for Customer */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-coffee-100 flex justify-between items-center sticky top-0 z-20">
        <div>
            <h2 className="font-serif font-bold text-coffee-900 text-lg">Table {booking.tableNumber}</h2>
            <div className="flex gap-2 text-xs text-gray-500">
                <span className="truncate max-w-[100px]">👤 {booking.customerName}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setViewMode('menu')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === 'menu' ? 'bg-coffee-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                Menu
            </button>
            <button 
                onClick={() => setViewMode('bill')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${viewMode === 'bill' ? 'bg-coffee-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                Bill
            </button>
        </div>
      </div>

      {viewMode === 'menu' ? (
        <div className="flex flex-1 overflow-hidden relative">
            {/* Menu Area */}
            <div className={`flex-1 overflow-y-auto p-4 ${cart.length > 0 ? 'pb-24 md:pb-4' : ''}`}> 
                {/* pb-24 adds padding bottom on mobile so items aren't hidden behind the sticky cart button */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sticky top-0 bg-coffee-50 z-10 py-2 scrollbar-hide">
                {['all', 'coffee', 'tea', 'snacks', 'meals', 'dessert'].map(cat => (
                    <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full capitalize text-sm font-medium transition-colors whitespace-nowrap ${
                        activeCategory === cat 
                        ? 'bg-coffee-600 text-white shadow-md' 
                        : 'bg-white text-gray-600 hover:bg-coffee-100'
                    }`}
                    >
                    {cat}
                    </button>
                ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenu.map(item => {
                    const qty = getItemQuantity(item.id);
                    return (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 group flex md:block">
                            {/* Mobile: Horizontal Card, Desktop: Vertical Card */}
                            <div className="w-24 md:w-full h-24 md:h-48 flex-shrink-0 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-500" />
                                {/* Add Button on Image for Quick Access */}
                                {qty === 0 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                        className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-coffee-700 shadow-md hover:bg-white md:hidden"
                                        title="Add Item"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-serif font-bold text-gray-800 text-base md:text-lg leading-tight">{item.name}</h3>
                                        <span className="font-bold text-coffee-700 text-sm md:text-base ml-2">₹{item.price}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs md:text-sm mb-2 line-clamp-2">{item.description}</p>
                                </div>
                                
                                {/* Quantity Controls with ADD / DROP logic */}
                                {qty > 0 ? (
                                    <div className="flex items-center justify-between bg-coffee-50 rounded-lg p-1 border border-coffee-200">
                                        <button 
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-10 h-8 flex items-center justify-center bg-white rounded shadow-sm text-red-600 font-bold hover:bg-red-50 text-xs uppercase"
                                        >
                                            Drop
                                        </button>
                                        <span className="font-bold text-coffee-900 w-8 text-center">{qty}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-10 h-8 flex items-center justify-center bg-white rounded shadow-sm text-green-700 font-bold hover:bg-green-50 text-xs uppercase"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="w-full py-1.5 md:py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 font-medium text-xs md:text-sm transition-colors shadow-sm flex items-center justify-center gap-1"
                                    >
                                        <span>Add</span>
                                        <span className="text-lg leading-none mb-0.5">+</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>

            {/* Desktop Cart Sidebar (Visible on md+) */}
            <div className="hidden md:flex w-96 bg-white border-l border-gray-200 flex-col h-full shadow-xl z-20">
               <CartContents 
                 cart={cart} 
                 aiTip={aiTip} 
                 isOrdering={isOrdering} 
                 calculateTotal={calculateTotal}
                 updateQuantity={updateQuantity}
                 handlePlaceOrder={handlePlaceOrder}
               />
            </div>

            {/* Mobile Cart Floating Bar & Overlay */}
            {cart.length > 0 && (
                <>
                    {/* Mobile Cart Button */}
                    <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                         <button 
                            onClick={() => setShowMobileCart(true)}
                            className="w-full bg-coffee-800 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center animate-slide-up"
                         >
                             <div className="flex items-center gap-3">
                                 <span className="bg-white text-coffee-800 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                     {calculateTotalItems()}
                                 </span>
                                 <span className="font-medium">View Cart</span>
                             </div>
                             <span className="font-bold text-lg">₹{calculateTotal()}</span>
                         </button>
                    </div>

                    {/* Mobile Cart Modal Overlay */}
                    {showMobileCart && (
                        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
                            <div className="bg-white w-full rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-serif font-bold text-xl text-gray-800">Your Cart</h3>
                                    <button 
                                        onClick={() => setShowMobileCart(false)}
                                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                     <CartContents 
                                        cart={cart} 
                                        aiTip={aiTip} 
                                        isOrdering={isOrdering} 
                                        calculateTotal={calculateTotal}
                                        updateQuantity={updateQuantity}
                                        handlePlaceOrder={handlePlaceOrder}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      ) : (
          // BILL VIEW
        <div className="max-w-2xl mx-auto w-full p-4 md:p-8 overflow-y-auto">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Your Orders & Bill</h2>
            
            <div className="space-y-6">
                {myOrders.length === 0 ? (
                     <div className="bg-white p-8 rounded-xl text-center shadow-sm">
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                        <button onClick={() => setViewMode('menu')} className="mt-4 text-coffee-600 underline">Go to Menu</button>
                     </div>
                ) : (
                    myOrders.map((order, index) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
                                <div>
                                    <span className="font-bold text-gray-700">Order #{index + 1}</span>
                                    <span className="text-xs text-gray-500 ml-2">{new Date(order.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {order.paymentMethod && (
                                        <span className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-600 uppercase">
                                            {order.paymentMethod}
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        order.status === OrderStatus.PAID 
                                        ? 'bg-green-100 text-green-700' 
                                        : order.status === OrderStatus.SERVED 
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-gray-600">{item.quantity} x {item.name}</span>
                                        <span className="font-medium">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-4">
                                    <span className="text-lg font-bold text-gray-800">Total: ₹{order.totalAmount}</span>
                                    {order.status !== OrderStatus.PAID && (
                                        <button 
                                            onClick={() => setShowPaymentModal(order)}
                                            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                    {order.status === OrderStatus.PAID && (
                                        <span className="text-green-600 font-bold flex items-center gap-1">
                                            ✓ Paid {order.paymentMethod ? `(${order.paymentMethod})` : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {myOrders.length > 0 && (
                     <div className="bg-coffee-600 text-white p-6 rounded-xl shadow-lg mt-8 flex justify-between items-center">
                        <span className="text-xl font-serif">Grand Total</span>
                        <span className="text-3xl font-bold">₹{myOrders.reduce((acc, o) => acc + o.totalAmount, 0)}</span>
                     </div>
                )}
            </div>

            {/* Payment Method Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="bg-green-600 p-4 text-center">
                            <h3 className="text-white font-serif font-bold text-xl">Select Payment Method</h3>
                            <p className="text-green-100 text-sm">Total to Pay: ₹{showPaymentModal.totalAmount}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <button 
                                onClick={() => handleProcessPayment('Cash')}
                                className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                            >
                                <span className="font-bold text-gray-700 group-hover:text-green-800">💵 Cash</span>
                                <span className="text-gray-400 group-hover:text-green-600">Pay at Counter →</span>
                            </button>
                            <button 
                                onClick={() => handleProcessPayment('Online')}
                                className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <span className="font-bold text-gray-700 group-hover:text-blue-800">📱 Online / UPI</span>
                                <span className="text-gray-400 group-hover:text-blue-600">Scan & Pay →</span>
                            </button>
                        </div>
                        <div className="bg-gray-50 p-4 text-center">
                            <button 
                                onClick={() => setShowPaymentModal(null)}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium underline"
                            >
                                Cancel Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

// Extracted Cart Component for reusability between Desktop Sidebar and Mobile Modal
const CartContents: React.FC<{
    cart: CartItem[], 
    aiTip: string, 
    isOrdering: boolean,
    calculateTotal: () => number,
    updateQuantity: (id: string, delta: number) => void,
    handlePlaceOrder: () => void
}> = ({ cart, aiTip, isOrdering, calculateTotal, updateQuantity, handlePlaceOrder }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-coffee-50 hidden md:block">
                <h3 className="font-bold text-gray-800">Current Selection</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Select items from the menu</p>
                    </div>
                ) : (
                    cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded border border-gray-200">
                             <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 font-bold rounded"
                                title="Drop"
                             >
                                -
                             </button>
                             <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                             <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-green-700 hover:bg-green-50 font-bold rounded"
                                title="Add"
                             >
                                +
                             </button>
                        </div>
                    </div>
                    ))
                )}
                
                {aiTip && cart.length > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">👩‍🍳</span>
                            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Chef Suggests</span>
                        </div>
                        <p className="text-sm text-indigo-900 italic">"{aiTip}"</p>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>₹{calculateTotal()}</span>
                </div>
                <button
                    disabled={cart.length === 0 || isOrdering}
                    onClick={handlePlaceOrder}
                    className={`w-full py-3 rounded-lg font-medium shadow-md transition-all ${
                        cart.length === 0 
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                        : 'bg-coffee-600 hover:bg-coffee-700 text-white'
                    }`}
                >
                    {isOrdering ? 'Sending Order...' : 'Place Order'}
                </button>
            </div>
        </div>
    );
};