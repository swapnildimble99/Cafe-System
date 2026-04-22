import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { StorageService } from '../services/storage';

export const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => {
    const allOrders = StorageService.getOrders();
    // Only show active kitchen orders
    const activeOrders = allOrders.filter(
        o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PREPARING
    ).sort((a, b) => a.timestamp - b.timestamp);
    setOrders(activeOrders);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Polling for new orders
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (orderId: string, status: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, status);
    fetchOrders();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pt-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-800">Kitchen Display System</h2>
        <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium animate-pulse">
            Live Feed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">
                <p className="text-xl">No active orders.</p>
                <p>Time to clean the stations!</p>
            </div>
        ) : (
            orders.map(order => (
            <div 
                key={order.id} 
                className={`rounded-xl shadow-lg border-l-4 overflow-hidden bg-white ${
                    order.status === OrderStatus.PENDING ? 'border-red-500' : 'border-yellow-500'
                }`}
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-lg">Table {order.tableNumber}</h3>
                    <p className="text-xs text-gray-500">#{order.id.slice(-4)} • {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    order.status === OrderStatus.PENDING ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {order.status}
                </span>
                </div>

                <div className="p-4 space-y-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{item.quantity}x {item.name}</span>
                    </div>
                ))}
                
                {order.aiRecommendation && (
                     <div className="text-xs text-indigo-600 mt-2 pt-2 border-t border-dashed border-gray-200">
                        <span className="font-semibold">AI Note:</span> Customer likely interested in: {order.aiRecommendation}
                     </div>
                )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                {order.status === OrderStatus.PENDING && (
                    <button
                    onClick={() => updateStatus(order.id, OrderStatus.PREPARING)}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium transition-colors"
                    >
                    Start Cooking
                    </button>
                )}
                {order.status === OrderStatus.PREPARING && (
                    <button
                    onClick={() => updateStatus(order.id, OrderStatus.SERVED)}
                    className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors"
                    >
                    Mark Served
                    </button>
                )}
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};