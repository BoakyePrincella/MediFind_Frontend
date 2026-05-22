import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasRole } from '../utils/roles';

interface Props {
  children:     React.ReactNode;
  requiredRole?: 'admin' | 'shop_owner' | 'customer';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isLoading } = useAuth();

  // Still checking localStorage — show nothing
  if (isLoading) return null;

  // Not logged in — go to login page
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role — explain why the protected page is blocked
  if (requiredRole && !hasRole(user.role, requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-800">Dashboard access blocked</h1>
          <p className="text-sm text-gray-500 mt-2">
            This page is for shop owner accounts. Your current account role is{' '}
            <span className="font-medium text-gray-700">{user.role}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
