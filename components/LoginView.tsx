import React, { useState } from 'react';

interface Props {
  targetRole: 'admin' | 'chef';
  onLoginSuccess: (role: 'admin' | 'chef') => void;
  onCancel: () => void;
}

export const LoginView: React.FC<Props> = ({ targetRole, onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials for demonstration
    if (targetRole === 'admin') {
      if (username === 'admin' && password === 'admin') {
        onLoginSuccess('admin');
      } else {
        setError('Invalid Admin credentials. Try admin/admin');
      }
    } else if (targetRole === 'chef') {
      if (username === 'chef' && password === 'chef') {
        onLoginSuccess('chef');
      } else {
        setError('Invalid Chef credentials. Try chef/chef');
      }
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
        <div className={`p-6 text-center ${targetRole === 'admin' ? 'bg-coffee-800' : 'bg-green-700'}`}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl">{targetRole === 'admin' ? '🛡️' : '👨‍🍳'}</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-serif capitalize">{targetRole} Login</h2>
          <p className="text-white/80 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              required
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              required
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 text-white font-bold rounded-lg shadow-md transition-colors ${
                targetRole === 'admin' ? 'bg-coffee-800 hover:bg-coffee-900' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};