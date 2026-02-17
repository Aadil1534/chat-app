import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../components/Login';

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
  }),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock react-redux
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: () => false,
}));

describe('Login Component - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Component renders correctly
  it('should render login form with title', () => {
    render(<Login />);
    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByText('Sign in to continue')).toBeDefined();
  });

  // Test 2: Email input renders
  it('should render email input field', () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput).toBeDefined();
  });

  // Test 3: Password input renders
  it('should render password input field', () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toBeDefined();
  });

  // Test 4: Login button renders
  it('should render login button', () => {
    render(<Login />);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeDefined();
  });

  // Test 5: Email validation on empty input
  it('should show error for empty email on submit', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeDefined();
    });
  });

  // Test 6: Password validation on empty input
  it('should show error for empty password on submit', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeDefined();
    });
  });

  // Test 7: Invalid email format validation
  it('should show error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeDefined();
    });
  });

  // Test 8: Short password validation
  it('should show error for password less than 6 characters', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByRole('button', { name: /Login/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeDefined();
    });
  });

  // Test 9: Valid email input updates state
  it('should update email input value when user types', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput.value).toBe('test@example.com');
  });

  // Test 10: Forgot password link renders
  it('should render forgot password and sign up links', () => {
    render(<Login />);
    
    const forgotLink = screen.getByText('Forgot Password?');
    const signUpLink = screen.getByText('Sign Up');
    
    expect(forgotLink).toBeDefined();
    expect(signUpLink).toBeDefined();
    expect(forgotLink.getAttribute('href')).toBe('/forgot-password');
    expect(signUpLink.getAttribute('href')).toBe('/register');
  });
});
