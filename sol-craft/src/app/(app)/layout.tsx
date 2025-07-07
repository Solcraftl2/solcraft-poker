
import { SiteHeader } from '@/components/layout/site-header';

export default function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
