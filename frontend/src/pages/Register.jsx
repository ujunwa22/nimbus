import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(
        form.name, form.email, form.password, form.role
      );
      navigate(user.role === 'TEACHER' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nimbus-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-in">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-nimbus-accent rounded-2xl mb-4">
            <Cloud size={28} className="text-nimbus-dark" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">
            Join Nimbus
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Create your account
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-900/20 border border-red-800/30 rounded-xl p-3.5 mb-5 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { value: 'STUDENT', label: 'Student', desc: 'Take quizzes' },
              { value: 'TEACHER', label: 'Teacher', desc: 'Create quizzes' },
            ].map(r => (
              <button key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all
                  ${form.role === r.value
                    ? 'border-nimbus-accent bg-sky-900/20 text-nimbus-accent'
                    : 'border-nimbus-border text-gray-500 hover:border-gray-600'}`}>
                <span className="font-semibold font-display text-sm">
                  {r.label}
                </span>
                <span className="text-xs opacity-70">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="text" className="input pl-10"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required minLength={6} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login"
              className="text-nimbus-accent hover:text-sky-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}