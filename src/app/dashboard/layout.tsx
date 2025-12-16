export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { getAuthenticatedUser } from "@/lib/auth";
import SidebarDashboard from "./_components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getAuthenticatedUser();

  return (
    <SidebarDashboard currentUser={currentUser}>
      {children}
    </SidebarDashboard>
  );
}