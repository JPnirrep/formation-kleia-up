import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/ui/Loading';

interface Props {
  requiredRole?: 'admin' | 'trainer';
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <Loading text="Vérification des accès..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-3xl font-heading text-kleia-burgundy">Accès refusé</h1>
        <p className="text-kleia-gray">Vous n'avez pas les droits nécessaires.</p>
      </div>
    );
  }
  return <Outlet />;
}
