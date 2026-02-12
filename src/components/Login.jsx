import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { selectDarkMode, toggleTheme } from '../store/slices/themeSlice';

export default function Login() {
  const { signIn } = useAuth();
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isDark = darkMode;
  const cardCls = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white';
  const titleCls = isDark ? 'text-white' : 'text-gray-800';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-500';
  const labelCls = isDark ? 'text-slate-300' : 'text-gray-700';
  const inputCls =
    'w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#6C3EF4] focus:border-transparent outline-none ' +
    (isDark
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'border border-gray-300');

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors relative ${
        isDark ? 'bg-slate-900' : 'bg-[#f4f5f7]'
      }`}
    >
      {/* Dark mode toggle - top right */}
      <button
        type="button"
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-6 right-6 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <span className="text-lg">☀️</span>
        ) : (
          <span className="text-lg">🌙</span>
        )}
      </button>

      <div className={`w-full max-w-md p-8 rounded-2xl shadow-lg ${cardCls}`}>
        <h1 className={`text-2xl font-semibold text-center mb-2 ${titleCls}`}>
          Welcome Back
        </h1>
        <p className={`text-center mb-8 ${subCls}`}>Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-[#6C3EF4] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#6C3EF4] text-white font-medium rounded-lg hover:bg-[#5b2ed9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${subCls}`}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[#6C3EF4] font-medium hover:underline">
            Sign Up
          </Link>
        </p>
        <p className={`mt-3 text-center text-sm ${subCls}`}>
          <Link to="/admin/login" className="text-[#6C3EF4] font-medium hover:underline">
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
