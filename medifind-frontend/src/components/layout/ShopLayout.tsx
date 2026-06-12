import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Overview',  path: '/dashboard',           icon: '📊' },
  { label: 'Inventory', path: '/dashboard/inventory',  icon: '📦' },
  { label: 'Settings',  path: '/dashboard/settings',   icon: '⚙️' },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <Link to="/" className="text-sm font-semibold">
            <span className="text-green-600">Medi</span>
            <span className="text-gray-800">Find</span>
            <span className="text-green-600 text-xs font-normal ml-1">GH</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Shop Dashboard</p>
        </div>

        {/* Shop owner info */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-medium flex items-center justify-center text-sm mb-2">
            {user?.fullname.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs font-medium text-gray-800 truncate">{user?.fullname}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-0.5">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span>🌐</span> View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Sign out
          </button>
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  );
}