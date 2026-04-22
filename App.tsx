import React, { useState } from 'react';
import { BookingView } from './components/BookingView';
import { MenuView } from './components/MenuView';
import { KitchenView } from './components/KitchenView';
import { AdminDashboard } from './components/AdminDashboard';
import { TableLoginView } from './components/TableLoginView';
import { LoginView } from './components/LoginView';
import { Booking, ViewState } from './types';

// New Type for managing Auth
type UserRole = 'admin' | 'chef' | null;

function App() {
  const [currentView, setCurrentView] = useState<ViewState | 'login'>('home');
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  
  // Auth State
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [pendingRole, setPendingRole] = useState<'admin' | 'chef' | null>(null);

  const handleTableLoginSuccess = (booking: Booking) => {
      setCurrentBooking(booking);
      setCurrentView('menu');
  };

  const handleOrderPlaced = () => {
    // Logic handled in MenuView
  };

  // Login Navigation Logic
  const handleNavClick = (view: ViewState) => {
    if (view === 'admin') {
      if (userRole === 'admin') {
        setCurrentView('admin');
      } else {
        setPendingRole('admin');
        setCurrentView('login');
      }
    } else if (view === 'kitchen') {
      if (userRole === 'chef') {
        setCurrentView('kitchen');
      } else {
        setPendingRole('chef');
        setCurrentView('login');
      }
    } else {
      setCurrentView(view);
    }
  };

  const handleLoginSuccess = (role: 'admin' | 'chef') => {
    setUserRole(role);
    if (role === 'admin') setCurrentView('admin');
    if (role === 'chef') setCurrentView('kitchen');
    setPendingRole(null);
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentView('home');
  };

  const NavButton: React.FC<{ view: ViewState; label: string; icon?: string }> = ({ view, label, icon }) => (
    <button
      onClick={() => handleNavClick(view)}
      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all text-sm sm:text-base flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
        currentView === view 
          ? 'bg-coffee-600 text-white shadow-md' 
          : 'text-coffee-800 hover:bg-coffee-100'
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-coffee-50 flex flex-col font-sans">
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span onClick={() => setCurrentView('home')} className="text-xl sm:text-2xl font-serif font-bold text-coffee-900 cursor-pointer flex items-center gap-2">
                📖 <span className="hidden sm:inline">Cafe Book</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide w-full sm:w-auto justify-end">
              <NavButton view="home" label="Home" />
              <NavButton view="booking" label="Book" icon="📅" />
              <NavButton view="table_access" label="Table Login" icon="📱" />
              <NavButton view="kitchen" label="Kitchen" icon="👨‍🍳" />
              <NavButton view="admin" label="Admin" icon="⚙️" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {currentView === 'home' && (
          <div className="text-center py-10 sm:py-20 animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-coffee-900 mb-6">
              Cafe Book
            </h1>
            <p className="text-lg sm:text-xl text-coffee-700 max-w-2xl mx-auto mb-10 leading-relaxed">
              Your premium destination for authentic Indian Cafe vibes, books, and brews.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
                <button 
                    onClick={() => setCurrentView('booking')}
                    className="px-8 py-4 bg-coffee-600 text-white text-lg rounded-full font-semibold shadow-lg hover:bg-coffee-700 hover:scale-105 transition-all"
                >
                    Request Reservation
                </button>
                <button 
                    onClick={() => setCurrentView('table_access')}
                    className="px-8 py-4 bg-white text-coffee-800 border-2 border-coffee-600 text-lg rounded-full font-semibold hover:bg-coffee-50 transition-all flex items-center gap-2"
                >
                    📱 I'm at the Cafe
                </button>
            </div>
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-coffee-100 transform hover:-translate-y-1 transition-transform">
                    <div className="text-4xl mb-4">🍵</div>
                    <h3 className="font-serif font-bold text-xl mb-2">Desi Chai</h3>
                    <p className="text-gray-600">Cutting chai and Filter coffee brewed to perfection.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-coffee-100 transform hover:-translate-y-1 transition-transform">
                    <div className="text-4xl mb-4">🍔</div>
                    <h3 className="font-serif font-bold text-xl mb-2">Mumbai Snacks</h3>
                    <p className="text-gray-600">Vada Pav, Samosa, and Bun Maska for the soul.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-coffee-100 transform hover:-translate-y-1 transition-transform">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="font-serif font-bold text-xl mb-2">Easy Ordering</h3>
                    <p className="text-gray-600">Scan table QR, order digitally, and pay online.</p>
                </div>
            </div>
          </div>
        )}

        {currentView === 'login' && pendingRole && (
          <div className="animate-fade-in">
            <LoginView 
              targetRole={pendingRole} 
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setCurrentView('home')}
            />
          </div>
        )}

        {currentView === 'booking' && (
           <div className="animate-fade-in">
             <BookingView />
           </div>
        )}

        {currentView === 'table_access' && (
            <div className="animate-fade-in">
                <TableLoginView onLoginSuccess={handleTableLoginSuccess} />
            </div>
        )}

        {currentView === 'menu' && (
          currentBooking ? (
            <MenuView booking={currentBooking} onOrderPlaced={handleOrderPlaced} />
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm max-w-md mx-auto mt-10">
              <p className="text-xl text-gray-500 mb-6">Please login to your table to view menu.</p>
              <button 
                onClick={() => setCurrentView('table_access')}
                className="px-6 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
              >
                Go to Table Login
              </button>
            </div>
          )
        )}

        {currentView === 'kitchen' && (
          <div className="relative">
             <div className="absolute top-0 right-0 p-4 sm:p-6 z-10">
               <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 underline font-medium">Logout Chef</button>
             </div>
             <KitchenView />
          </div>
        )}
        
        {currentView === 'admin' && (
          <div className="relative">
             <div className="absolute top-0 right-0 p-4 sm:p-6 z-10">
               <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 underline font-medium">Logout Admin</button>
             </div>
             <AdminDashboard />
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-gray-100 py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2024 Cafe Book. Authentic Indian Cafe Experience.</p>
      </footer>
    </div>
  );
}

export default App;