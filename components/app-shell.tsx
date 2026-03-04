import { Sidebar } from "@/components/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "#0a0a0f" }}>
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "224px", minHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
