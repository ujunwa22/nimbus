import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, LogOut, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-nimbus-dark/80 backdrop-blur-xl border-b border-nimbus-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-nimbus-accent rounded-lg flex items-center justify-center">
            <Cloud size={18} className="text-nimbus-dark" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Nimbus
          </span>
        </Link>

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-3">
            {user.role === 'TEACHER' && (
              <Link to="/quiz/create"
                className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={14} /> New Quiz
              </Link>
            )}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white">
                {user.name}
              </span>
              <span className={`text-xs font-mono
                ${user.role === 'TEACHER'
                  ? 'text-nimbus-gold'
                  : 'text-nimbus-accent'}`}>
                {user.role}
              </span>
            </div>
            <button onClick={handleLogout}
              className="btn-ghost text-gray-500 hover:text-red-400 p-2">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}