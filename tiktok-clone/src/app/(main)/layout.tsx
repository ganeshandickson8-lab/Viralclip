import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-dark">
      <Sidebar />
      <main className="md:ml-60 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
