import React, { useState } from 'react';
import { Booking } from '../types';
import { StorageService } from '../services/storage';

export const BookingView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    date: '',
    time: '',
    guests: 2
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: Booking = {
      id: Date.now().toString(),
      customerName: formData.name,
      mobile: formData.mobile,
      tableNumber: null, // Admin assigns this later
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      status: 'pending' // Initial status
    };

    StorageService.saveBooking(newBooking);
    setSubmitted(true);
  };

  if (submitted) {
      return (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl mt-10 border border-green-100 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ✓
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Request Sent!</h2>
              <p className="text-gray-600 mb-6">
                  Thank you, <b>{formData.name}</b>. Your request for a table of {formData.guests} has been sent to our team.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 mb-6">
                  <p>When you arrive at the cafe:</p>
                  <ol className="list-decimal text-left ml-6 mt-2 space-y-1">
                      <li>The Admin will confirm your table.</li>
                      <li>You will be assigned a Table Number.</li>
                      <li>Use the <b>"Table Login"</b> link and enter your Mobile No. & Table No. to order.</li>
                  </ol>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-coffee-600 hover:text-coffee-800 font-medium underline"
              >
                  Make another request
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl mt-10 border border-coffee-100">
      <h2 className="text-3xl font-serif font-bold text-coffee-800 mb-2 text-center">Request a Table</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Send a request. We will assign a table upon confirmation.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name and Mobile */}
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
                required
                type="text"
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 p-2 border"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
                required
                type="tel"
                placeholder="e.g. 9876543210"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 p-2 border"
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-1">This will be used to login at your table.</p>
            </div>
        </div>
        
        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              required
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 p-2 border"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              required
              type="time"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 p-2 border"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>
        </div>

        {/* Guests */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
            <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coffee-500 focus:ring-coffee-500 p-2 border"
                value={formData.guests}
                onChange={e => setFormData({...formData, guests: Number(e.target.value)})}
            >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} People</option>)}
            </select>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coffee-600 hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 transition-colors mt-6"
        >
          Send Booking Request
        </button>
      </form>
    </div>
  );
};