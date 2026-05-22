import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isShopOwner, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="text-base font-semibold shrink-0">
          <span className="text-green-600">Medi</span>
          <span className="text-gray-800">Find</span>
          <span className="text-green-600 text-xs font-normal ml-1">GH</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex max-w-md">
          <div className="flex w-full border border-gray-200 rounded-lg overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search medicines, cosmetics..."
              className="flex-1 px-4 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="px-4 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
          <Link to="/search" className="hover:text-gray-800 transition-colors">Browse</Link>
          <Link to="/search?category=pharmacy" className="hover:text-gray-800 transition-colors">Pharmacy</Link>
          <Link to="/search?category=cosmetics" className="hover:text-gray-800 transition-colors">Cosmetics</Link>
        </div>

        {/* Auth area */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium flex items-center justify-center text-xs">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{user.fullname.split(' ')[0]}</span>
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop to close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-medium text-gray-800 truncate">{user.fullname}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {isShopOwner() && (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Dashboard
                      </Link>
                    )}
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}