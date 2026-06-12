import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/ui/PasswordInput';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate        = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // If already logged in — redirect away
  if (user) {
    if (user.role === 'admin')      navigate('/admin',     { replace: true });
    if (user.role === 'shop_owner') navigate('/dashboard', { replace: true });
    if (user.role === 'customer')   navigate('/',          { replace: true });
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // AuthContext updates user — read role from localStorage
      // since state update is async we read directly
      const saved = localStorage.getItem('medifind_user');
      const u     = saved ? JSON.parse(saved) : null;

      if (u?.role === 'admin')      navigate('/admin',     { replace: true });
      else if (u?.role === 'shop_owner') navigate('/dashboard', { replace: true });
      else                               navigate('/',          { replace: true });

    } catch (err: any) {
      // Laravel returns validation errors under errors.email
      const msg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4">

      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/" className="text-2xl font-semibold">
          <span className="text-green-600">Medi</span>
          <span className="text-gray-800">Find</span>
          <span className="text-green-600 text-sm font-normal ml-1">GH</span>
        </Link>
        <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

        <h1 className="text-lg font-semibold text-gray-800 mb-6">Welcome back</h1>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-green-600 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>

      </div>

      {/* Back to homepage */}
      <p className="text-center mt-6">
        <Link
          to="/"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to MediFind GH
        </Link>
      </p>

    </div>
  );
}
