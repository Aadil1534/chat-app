import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { selectDarkMode, toggleTheme } from '../store/slices/themeSlice';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }
    setErrors(newErrors);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateField('email', e.target.value);
  };

  const handleBlur = () => {
    validateField('email', email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to send reset email' });
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
      <button
        type="button"
        onClick={() => dispatch(toggleTheme())}
        className="absolute top-6 right-6 p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDark ? <span className="text-lg">☀️</span> : <span className="text-lg">🌙</span>}
      </button>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-lg ${cardCls}`}>
        <h1 className={`text-2xl font-semibold text-center mb-2 ${titleCls}`}>
          Reset Password
        </h1>
        <p className={`text-center mb-8 ${subCls}`}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {success ? (
          <div className="space-y-4">
            <p className="text-green-500 text-center">
              Check your email for a password reset link.
            </p>
            <Link
              to="/login"
              className="block w-full py-2.5 bg-[#6C3EF4] text-white font-medium rounded-lg text-center hover:bg-[#5b2ed9] transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                className={`${inputCls} ${errors.email ? 'border-red-500' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm text-center">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#6C3EF4] text-white font-medium rounded-lg hover:bg-[#5b2ed9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className={`mt-6 text-center text-sm ${subCls}`}>
          Remember your password?{' '}
          <Link to="/login" className="text-[#6C3EF4] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
