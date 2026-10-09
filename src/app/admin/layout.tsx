import { getAdminSession } from '@/lib/admin/access';
import AdminAccessGate from '@/components/admin/AdminAccessGate';
import AdminWorkspace from '@/components/admin/AdminWorkspace';
import AdminSessionBoundary from '@/components/admin/AdminSessionBoundary';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <AdminAccessGate/>;
  return <AdminSessionBoundary expiresAt={session.expiresAt.toISOString()}><AdminWorkspace>{children}</AdminWorkspace></AdminSessionBoundary>;
}
