import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { selectDarkMode, toggleTheme } from '../store/slices/themeSlice';

export default function Registration() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const darkMode = useSelector(selectDarkMode);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        } else {
          delete newErrors.lastName;
        }
        break;
      case 'mobileNumber':
        if (!value.trim()) {
          newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(value)) {
          newErrors.mobileNumber = 'Mobile number must be 10 digits';
        } else {
          delete newErrors.mobileNumber;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== form.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobileNumber)) newErrors.mobileNumber = 'Mobile number must be 10 digits';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await signUp({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed' });
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
          Create Account
        </h1>
        <p className={`text-center mb-8 ${subCls}`}>Sign up to start chatting</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputCls} ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="First name"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputCls} ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${labelCls}`}>Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 text-gray-500 text-sm">
                +91
              </span>
              <input
                type="tel"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputCls} rounded-l-none ${errors.mobileNumber ? 'border-red-500' : ''}`}
                placeholder="Enter your Phone Number"
                maxLength="10"
              />
            </div>
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
              Email Address
            </label>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputCls} ${errors.email ? 'border-red-500' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputCls} ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${labelCls}`}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputCls} ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {errors.submit && <p className="text-red-500 text-sm text-center">{errors.submit}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#6C3EF4] text-white font-medium rounded-lg hover:bg-[#5b2ed9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${subCls}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-[#6C3EF4] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
