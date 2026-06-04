import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'TEACHER' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nimbus-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-in">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-nimbus-accent rounded-2xl mb-4">
            <Cloud size={28} className="text-nimbus-dark" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Sign in to Nimbus
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-900/20 border border-red-800/30 rounded-xl p-3.5 mb-5 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="email" className="input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="password" className="input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            No account?{' '}
            <Link to="/register"
              className="text-nimbus-accent hover:text-sky-300 font-medium">
              Register
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-nimbus-border">
            <p className="text-xs text-gray-600 text-center font-mono">
              Demo: teacher@nimbus.com / student@nimbus.com · password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}