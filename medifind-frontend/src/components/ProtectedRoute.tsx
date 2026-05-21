import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  // Wrong role — go to homepage
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}