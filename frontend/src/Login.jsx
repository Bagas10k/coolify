import React, { useState } from 'react';
import Button from './components/Button';
import Input from './components/Input';
import { Lock, User, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        onLoginSuccess();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-mascot-wrap">
          <img src="/mascot.png" alt="Dashboard mascot" className="login-mascot" />
        </div>
        <h2 className="text-2xl font-bold font-fun text-slate-800 mb-1 flex items-center justify-center gap-2">
          Coolify <span className="text-blue-500"><Sparkles size={20} /></span>
        </h2>
        <p className="text-sm text-slate-400 mb-6 font-semibold">Your personal project workspace</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <Input
            label="Username"
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            icon={<User size={14} />}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock size={14} />}
          />

          {error && (
            <div className="p-3 text-sm text-red-500 font-semibold bg-red-50 border border-red-100 rounded-xl text-center">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
