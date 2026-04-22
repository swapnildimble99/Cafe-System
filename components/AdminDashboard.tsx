import React, { useState, useEffect } from 'react';
import { Booking, Order, OrderStatus, BillRecord } from '../types';
import { StorageService } from '../services/storage';

export const AdminDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);
  
  // State for assigning table
  const [assigningTableId, setAssigningTableId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  
  // State for Admin Payment Method Selection
  const [adminPaymentSelectId, setAdminPaymentSelectId] = useState<string | null>(null);

  const loadData = () => {
    setBookings(StorageService.getBookings());
    setOrders(StorageService.getOrders().sort((a,b) => b.timestamp - a.timestamp));
    setBills(StorageService.getBillRecords().sort((a, b) => Number(b.id) - Number(a.id)));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmBooking = (bookingId: string) => {
    StorageService.updateBookingStatus(bookingId, 'confirmed', selectedTable);
    setAssigningTableId(null);
    loadData();
  };

  const handleRejectBooking = (bookingId: string) => {
      if(window.confirm('Are you sure you want to reject this request?')) {
        StorageService.updateBookingStatus(bookingId, 'cancelled');
        loadData();
      }
  };

  const handlePayBill = async (order: Order, method: 'Cash' | 'Online') => {
    setPaymentProcessing(order.id);
    const booking = bookings.find(b => b.id === order.bookingId);
    
    // 1. Update Status with Method
    StorageService.updateOrderStatus(order.id, OrderStatus.PAID);
    
    // 2. Save Bill Record
    const now = new Date();
    const billRecord: BillRecord = {
        id: Date.now().toString(),
        customerName: booking?.customerName || 'Unknown',
        tableNumber: booking?.tableNumber || 0,
        mobile: booking?.mobile || '',
        totalAmount: order.totalAmount,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        paymentMethod: method
    };
    StorageService.saveBillRecord(billRecord);

    setAdminPaymentSelectId(null);
    setTimeout(() => {
        setPaymentProcessing(null);
        loadData();
    }, 1500);
  };

  // Helper to get total paid for a table (Active Floor feature)
  const getTablePaidTotal = (tableNo: number | null) => {
      if (!tableNo) return 0;
      const activeBooking = bookings.find(b => b.tableNumber === tableNo && (b.status === 'active' || b.status === 'confirmed'));
      if (!activeBooking) return 0;
      
      const paidOrders = orders.filter(o => o.bookingId === activeBooking.id && o.status === OrderStatus.PAID);
      return paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'active');
  
  // Calculate Today's Collection
  const todayStr = new Date().toLocaleDateString();
  const todaysCollection = bills
    .filter(b => b.date === todayStr)
    .reduce((acc, b) => acc + b.totalAmount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen pt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-serif font-bold text-gray-800">Admin Dashboard</h2>
      </div>
      
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-yellow-400">
           <h3 className="text-gray-500 font-medium text-xs uppercase">Pending Requests</h3>
           <p className="text-3xl font-bold text-gray-800">{pendingBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-green-500">
           <h3 className="text-gray-500 font-medium text-xs uppercase">Active Tables</h3>
           <p className="text-3xl font-bold text-gray-800">{activeBookings.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-purple-600">
           <h3 className="text-gray-500 font-medium text-xs uppercase">Today's Collection</h3>
           <p className="text-3xl font-bold text-gray-800">₹{todaysCollection}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-l-4 border-l-coffee-600">
           <h3 className="text-gray-500 font-medium text-xs uppercase">Total Lifetime</h3>
           <p className="text-3xl font-bold text-gray-800">₹{bills.reduce((acc, b) => acc + b.totalAmount, 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PENDING REQUESTS SECTION */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-yellow-50">
                <h2 className="text-lg font-bold text-yellow-800 flex items-center gap-2">
                    🔔 Reservation Requests
                </h2>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[400px]">
                {pendingBookings.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No pending requests</p>
                ) : (
                    pendingBookings.map(b => (
                        <div key={b.id} className="border border-yellow-200 bg-yellow-50/50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-800">{b.customerName}</h3>
                                    <p className="text-xs text-gray-600">📞 {b.mobile}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-coffee-700">{b.guests} Guests</span>
                                    <span className="text-xs text-gray-500">{b.date} @ {b.time}</span>
                                </div>
                            </div>
                            
                            {assigningTableId === b.id ? (
                                <div className="mt-3 bg-white p-3 rounded border border-gray-200 animate-fade-in">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Assign Table Number:</label>
                                    <div className="flex gap-2">
                                        <select 
                                            className="flex-1 border rounded p-1"
                                            value={selectedTable}
                                            onChange={(e) => setSelectedTable(Number(e.target.value))}
                                        >
                                            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>Table {n}</option>)}
                                        </select>
                                        <button 
                                            onClick={() => handleConfirmBooking(b.id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                        >
                                            Confirm
                                        </button>
                                        <button 
                                            onClick={() => setAssigningTableId(null)}
                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 mt-3">
                                    <button 
                                        onClick={() => { setAssigningTableId(b.id); setSelectedTable(1); }}
                                        className="flex-1 bg-coffee-600 text-white py-1.5 rounded text-sm font-medium hover:bg-coffee-700 shadow-sm"
                                    >
                                        Approve & Assign Table
                                    </button>
                                    <button 
                                        onClick={() => handleRejectBooking(b.id)}
                                        className="px-3 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* ACTIVE TABLES SECTION */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-green-50 sticky top-0">
            <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
                🍽️ Active Floor
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 gap-4">
                {activeBookings.map(booking => {
                  const paidTotal = getTablePaidTotal(booking.tableNumber);
                  return (
                    <div key={booking.id} className="border border-green-100 bg-white rounded-lg p-3 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-bl font-bold">
                            Table {booking.tableNumber}
                        </div>
                        <div className="mt-2">
                            <div className="font-bold text-gray-800 truncate">{booking.customerName}</div>
                            <div className="text-xs text-gray-500 mb-2">{booking.guests} Guests</div>
                            
                            {paidTotal > 0 ? (
                                <div className="bg-green-50 border border-green-200 rounded p-1 text-center">
                                    <p className="text-[10px] text-green-600 font-medium uppercase">Paid Total</p>
                                    <p className="text-lg font-bold text-green-700">₹{paidTotal}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-gray-100 rounded p-1 text-center text-gray-400 text-xs">
                                    No Payment Yet
                                </div>
                            )}
                        </div>
                    </div>
                  );
                })}
                {activeBookings.length === 0 && <p className="col-span-2 text-center text-gray-400">No active tables.</p>}
              </div>
          </div>
        </div>

      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>🧾</span> Order Management
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {orders.map(order => (
              <div key={order.id} className={`border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4 ${
                  order.status === OrderStatus.PAID ? 'border-gray-200 bg-gray-50 opacity-75' : 'border-blue-200 bg-white shadow-sm'
              }`}>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                         <span className="bg-gray-800 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                            {order.tableNumber}
                        </span>
                        <h4 className="font-bold text-gray-800">
                            Order #{order.id.slice(-4)} 
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                            order.status === OrderStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 ml-11">
                        Total: <span className="font-bold">₹{order.totalAmount}</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    {order.status !== OrderStatus.PAID ? (
                        adminPaymentSelectId === order.id ? (
                             <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 border rounded shadow-sm animate-fade-in">
                                <span className="text-xs font-bold text-gray-500 self-center">Mark Paid via:</span>
                                <button 
                                    onClick={() => handlePayBill(order, 'Cash')}
                                    disabled={!!paymentProcessing}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                >
                                    Cash
                                </button>
                                <button 
                                    onClick={() => handlePayBill(order, 'Online')}
                                    disabled={!!paymentProcessing}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                >
                                    Online
                                </button>
                                <button 
                                    onClick={() => setAdminPaymentSelectId(null)}
                                    className="px-2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                             </div>
                        ) : (
                            <button
                                onClick={() => setAdminPaymentSelectId(order.id)}
                                disabled={!!paymentProcessing}
                                className="px-6 py-2 bg-coffee-600 text-white rounded hover:bg-coffee-700 text-sm font-medium transition-colors"
                            >
                                Mark Paid
                            </button>
                        )
                    ) : (
                        <span className="text-green-600 font-bold text-sm px-4 flex flex-col items-end">
                            <span>Saved ✓</span>
                            {/* Note: We rely on BillRecord for persistent payment method storage in this simple app, 
                                but showing it here if available in local state would be good. 
                                Since storage update reloads orders, we don't persist paymentMethod on Order object in storage.ts
                                to keep things simple, but in a real app we would. */}
                        </span>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Database View */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">🗄️ Transaction History (DB)</h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 border-b sticky top-0">
                <tr>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Customer</th>
                  <th className="p-3 font-semibold">Mobile</th>
                  <th className="p-3 font-semibold">Table</th>
                  <th className="p-3 font-semibold">Method</th>
                  <th className="p-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{bill.date} <span className="text-gray-400 text-xs">{bill.time}</span></td>
                        <td className="p-3 font-medium">{bill.customerName}</td>
                        <td className="p-3 font-mono text-xs">{bill.mobile}</td>
                        <td className="p-3 text-center">{bill.tableNumber}</td>
                        <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                bill.paymentMethod === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                            }`}>
                                {bill.paymentMethod || '-'}
                            </span>
                        </td>
                        <td className="p-3 text-right font-bold text-coffee-700">₹{bill.totalAmount}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};