import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../api/auth';
import PasswordInput from '../components/ui/PasswordInput';

export default function RegisterPage() {
  const { login, user } = useAuth();
  const navigate        = useNavigate();

  const [fullname, setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);

  // Already logged in — redirect
  if (user) navigate('/', { replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side password match check
    if (password !== confirm) {
      setErrors({ confirm: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      // Register the account
      await register({
        fullname,
        email,
        password,
        password_confirmation: confirm,
        phone: phone || undefined,
      });

      // Immediately log them in — no separate step needed
      await login(email, password);

      navigate('/', { replace: true });

    } catch (err: any) {
      // Laravel returns field-level errors
      // e.g. { errors: { email: ['already taken'], password: [...] } }
      const laravelErrors = err.response?.data?.errors ?? {};
      const mapped: Record<string, string> = {};

      Object.keys(laravelErrors).forEach(field => {
        mapped[field] = laravelErrors[field][0];
      });

      if (Object.keys(mapped).length === 0) {
        mapped.general = err.response?.data?.message || 'Something went wrong.';
      }

      setErrors(mapped);
    } finally {
      setLoading(false);
    }
  };

  // Helper — renders a field error if it exists
  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-10">

      {/* Logo */}
      <div className="text-center mb-8">
        <Link to="/" className="text-2xl font-semibold">
          <span className="text-green-600">Medi</span>
          <span className="text-gray-800">Find</span>
          <span className="text-green-600 text-sm font-normal ml-1">GH</span>
        </Link>
        <p className="text-sm text-gray-400 mt-1">Create your account</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm mx-auto bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

        <h1 className="text-lg font-semibold text-gray-800 mb-6">Get started</h1>

        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullname}
              onChange={e => setName(e.target.value)}
              placeholder="Kwame Mensah"
              required
              autoFocus
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {fieldError('name')}
          </div>

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
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {fieldError('email')}
          </div>

          {/* Phone — optional */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Phone number
              <span className="text-gray-300 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0244 000 000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
            />
            {fieldError('phone')}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors ${
                errors.password ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {fieldError('password')}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Confirm password
            </label>
            <PasswordInput
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors ${
                errors.confirm ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {fieldError('confirm')}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

        </form>

        {/* Terms note */}
        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          By registering you agree to use MediFind GH responsibly.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-green-600 font-medium hover:underline"
          >
            Sign in
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
