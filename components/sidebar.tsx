"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mockStats } from "@/lib/mock-data";

const navSections = [
  {
    label: "General",
    items: [
      { href: "/", label: "Dashboard", icon: "⊞", count: null },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/prompts", label: "Prompts", icon: "✦", count: mockStats.prompts },
      { href: "/skills", label: "Skills", icon: "◈", count: mockStats.skills },
      { href: "/context-packs", label: "Context Packs", icon: "◻", count: 4 },
    ],
  },
  {
    label: "Automation",
    items: [
      { href: "/workflows", label: "Workflows", icon: "⟳", count: mockStats.workflows },
      { href: "/mcp-registry", label: "MCP Registry", icon: "◉", count: mockStats.mcpServers },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/skill-builder", label: "Skill Builder", icon: "✦", count: null },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-40"
      style={{
        width: "224px",
        background: "#0e0e18",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            A
          </div>
          <span className="text-white font-black text-lg tracking-tight">
            AI Studio
          </span>
        </div>
        <p className="font-mono text-xs ml-9" style={{ color: "#6b6b8a" }}>
          powered by PromptVault
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 flex flex-col gap-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className="font-mono text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
              style={{ color: "#3d3d55" }}
            >
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                      isActive
                        ? "text-white"
                        : "text-[#6b6b8a] hover:text-white/80 hover:bg-white/5"
                    )}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))",
                            color: "#a5b4fc",
                          }
                        : {}
                    }
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base w-4 text-center font-mono">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    {item.count !== null && (
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded-md"
                        style={{
                          background: isActive
                            ? "rgba(99,102,241,0.25)"
                            : "rgba(255,255,255,0.06)",
                          color: isActive ? "#a5b4fc" : "#6b6b8a",
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* API Status Footer */}
      <div
        className="mx-3 mb-4 rounded-xl px-3 py-3 flex items-center gap-2.5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
            style={{ boxShadow: "0 0 8px #22c55e" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs font-bold" style={{ color: "#22c55e" }}>
            API Online
          </p>
          <p className="font-mono text-xs truncate" style={{ color: "#3d3d55" }}>
            localhost:8080
          </p>
        </div>
      </div>
    </aside>
  );
}
