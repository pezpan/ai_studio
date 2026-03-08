"use client";

import { useState, useEffect } from "react";
import { getContextPacks } from "@/lib/api";
import { CreateModal } from "@/components/create-modal";

interface ContextPack {
  id: number | string;
  name: string;
  description: string;
  emoji?: string;
  resources: {
    prompts: number;
    skills: number;
    mcps: number;
  };
  generatedMcpConfig?: string;
  mcpConfig?: any;
}

function ResourceChip({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-full"
      style={{
        background: `${color}12`,
        color,
        border: `1px solid ${color}28`,
      }}
    >
      <span className="font-black">{count}</span> {label}
    </span>
  );
}

function PackModal({ pack, onClose }: { pack: ContextPack; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const json = pack.generatedMcpConfig || JSON.stringify(pack.mcpConfig || {}, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{
          background: "#12121a",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-start justify-between gap-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{pack.emoji || "📦"}</span>
              <h2 className="text-xl font-black text-white">{pack.name}</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#6b6b8a" }}>
              {pack.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:bg-white/10"
            style={{ color: "#6b6b8a" }}
          >
            ✕
          </button>
        </div>

        {/* JSON Config */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p
              className="font-mono text-xs font-bold uppercase tracking-widest"
              style={{ color: "#6366f1" }}
            >
              MCP Config JSON
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-150"
              style={{
                background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                border: copied
                  ? "1px solid rgba(34,197,94,0.3)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: copied ? "#4ade80" : "#c8c8e0",
              }}
            >
              {copied ? "✓ Copied!" : "Copiar config JSON"}
            </button>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <pre
              className="font-mono text-xs leading-relaxed p-4 overflow-x-auto"
              style={{ color: "#a8a8c0" }}
            >
              {json}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackCard({ pack, onClick }: { pack: ContextPack; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl p-6 flex flex-col gap-4 transition-all duration-150 w-full"
      style={{
        background: "#12121a",
        border: "1px solid rgba(255,255,255,0.07)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Emoji */}
      <span className="text-3xl">{pack.emoji || "📦"}</span>

      {/* Name & Description */}
      <div>
        <p className="font-black text-white text-lg mb-1.5">{pack.name}</p>
        <p className="text-sm leading-relaxed" style={{ color: "#6b6b8a" }}>
          {pack.description}
        </p>
      </div>

      {/* Resource chips */}
      <div className="flex flex-wrap gap-2 mt-auto">
        <ResourceChip label="prompts" count={pack.resources?.prompts ?? 0} color="#6366f1" />
        <ResourceChip label="skills" count={pack.resources?.skills ?? 0} color="#22c55e" />
        <ResourceChip label="MCPs" count={pack.resources?.mcps ?? 0} color="#06b6d4" />
      </div>
    </button>
  );
}

export function ContextPacksContent() {
  const [packs, setPacks] = useState<ContextPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<ContextPack | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const data = await getContextPacks();
      setPacks(data);
    } catch (error) {
      console.error("Failed to fetch context packs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Context Packs</h1>
          <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
            Pre-configured MCP bundles for common workflows
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-black transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="6.5" y1="1" x2="6.5" y2="12" />
            <line x1="1" y1="6.5" x2="12" y2="6.5" />
          </svg>
          Nuevo Pack
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} onClick={() => setSelectedPack(pack)} />
          ))}
        </div>
      )}

      {selectedPack && (
        <PackModal pack={selectedPack} onClose={() => setSelectedPack(null)} />
      )}

      {showCreate && (
        <CreateModal
          type="context-pack"
          onClose={() => setShowCreate(false)}
          onSave={() => {
            fetchPacks();
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

