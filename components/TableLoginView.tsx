import React, { useState } from 'react';
import { Booking } from '../types';
import { StorageService } from '../services/storage';

interface Props {
    onLoginSuccess: (booking: Booking) => void;
}

export const TableLoginView: React.FC<Props> = ({ onLoginSuccess }) => {
    const [mobile, setMobile] = useState('');
    const [table, setTable] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const booking = StorageService.findActiveBooking(mobile, Number(table));
        
        if (booking) {
            // Update booking to active status if it was just confirmed
            if (booking.status === 'confirmed') {
                StorageService.updateBookingStatus(booking.id, 'active');
            }
            onLoginSuccess(booking);
        } else {
            setError('Booking not found or not yet confirmed by Admin. Please check your details or wait for confirmation.');
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-coffee-600 p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <span className="text-3xl">📱</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white font-serif">Table Login</h2>
                    <p className="text-coffee-100 text-sm mt-1">Scan QR or enter details to access Menu</p>
                </div>
                
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number Used for Booking</label>
                        <input
                            required
                            type="tel"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all"
                            placeholder="e.g. 9876543210"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Table Number</label>
                        <select
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none transition-all bg-white"
                            value={table}
                            onChange={e => setTable(e.target.value)}
                        >
                            <option value="">Select Table No.</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                <option key={n} value={n}>Table {n}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-coffee-600 text-white font-bold py-3 rounded-lg hover:bg-coffee-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Access Menu
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-4">
                        *Note: Admin must confirm your reservation first.
                    </p>
                </form>
            </div>
        </div>
    );
};