import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PageTransition from '@/components/ui/PageTransition';

export default function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-8" role="main" aria-label="Contenu administration">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
