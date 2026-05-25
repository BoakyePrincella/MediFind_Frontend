import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import { adminGetShops, adminGetProducts, adminGetCategories } from '../../api/admin';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ shops: 0, products: 0, categories: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminGetShops(),
      adminGetProducts(),
      adminGetCategories(),
      adminGetShops({ verified: false }),
    ]).then(([shopsRes, prodRes, catRes, unverRes]) => {
      setStats({
        shops:      shopsRes.data.total,
        products:   prodRes.data.total,
        categories: catRes.data.length,
        unverified: unverRes.data.total,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><Spinner /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-800">Admin Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            MediFind GH platform summary
          </p>
        </div>

        {/* Unverified alert */}
        {stats.unverified > 0 && (
          <Link
            to="/admin/shops"
            className="block bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-6 hover:border-amber-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {stats.unverified} shop{stats.unverified !== 1 ? 's' : ''} pending verification
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Click here to review and verify them
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total shops',    value: stats.shops,      color: 'text-green-600',  bg: 'bg-green-50',  link: '/admin/shops'      },
            { label: 'Products',       value: stats.products,   color: 'text-blue-600',   bg: 'bg-blue-50',   link: '/admin/products'   },
            { label: 'Categories',     value: stats.categories, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/categories' },
            { label: 'Unverified',     value: stats.unverified, color: 'text-amber-600',  bg: 'bg-amber-50',  link: '/admin/shops'      },
          ].map(stat => (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Add a new shop',       desc: 'Onboard a pharmacy or cosmetics shop', path: '/admin/shops',      icon: '🏪' },
            { label: 'Add a product',         desc: 'Add to the global product catalogue',  path: '/admin/products',   icon: '💊' },
            { label: 'Manage categories',     desc: 'Add or edit product categories',        path: '/admin/categories', icon: '📂' },
          ].map(action => (
            <Link
              key={action.path}
              to={action.path}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all flex items-center gap-4"
            >
              <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                {action.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}