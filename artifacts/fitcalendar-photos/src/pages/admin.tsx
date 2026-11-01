import { Redirect } from 'wouter';
import { useAuth } from '@/context/auth';
import { isAdmin } from '@/lib/admin';
import NotFound from '@/pages/not-found';

export default function AdminPage() {
  const { user, loading } = useAuth();
  if (loading) return <main className="min-h-[100dvh] bg-white" data-testid="status-admin-loading" />;
  if (!isAdmin(user)) return <NotFound />;
  return <Redirect to="/event/369" />;
}
