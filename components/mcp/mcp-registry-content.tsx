"use client";

import { useState } from "react";
import { mockMcpServers } from "@/lib/mock-data";
import { CreateModal } from "@/components/create-modal";

type IssueType = "ok" | "warning" | "info";
type Server = (typeof mockMcpServers)[0];

interface TestResult {
  success: boolean;
  latencyMs: number;
  message: string;
  checks: { label: string; ok: boolean }[];
}

const issueColors: Record<IssueType, { bg: string; text: string; border: string }> = {
  ok: { bg: "rgba(34,197,94,0.06)", text: "#4ade80", border: "#22c55e" },
  warning: { bg: "rgba(245,158,11,0.06)", text: "#fbbf24", border: "#f59e0b" },
  info: { bg: "rgba(99,102,241,0.06)", text: "#818cf8", border: "#6366f1" },
};

async function runTest(server: Server): Promise<TestResult> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
  const success = server.status === "ok";
  const latencyMs = Math.floor(80 + Math.random() * 220);
  return {
    success,
    latencyMs,
    message: success
      ? "Conexion establecida correctamente."
      : "El servidor respondio con advertencias.",
    checks: [
      { label: "Proceso disponible", ok: true },
      { label: "Protocolo MCP valido", ok: success },
      { label: "Herramientas registradas", ok: success },
      { label: "Sin errores de configuracion", ok: success },
    ],
  };
}

function TestResultPanel({ result, onClose }: { result: TestResult; onClose: () => void }) {
  return (
    <div
      className="mt-3 rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: result.success ? "rgba(34,197,94,0.05)" : "rgba(245,158,11,0.05)",
        border: `1px solid ${result.success ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
      }}
    >
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: result.success ? "#22c55e" : "#f59e0b",
              boxShadow: result.success ? "0 0 6px #22c55e" : "0 0 6px #f59e0b",
            }}
          />
          <span className="font-bold text-xs" style={{ color: result.success ? "#4ade80" : "#fbbf24" }}>
            {result.success ? "Test exitoso" : "Test con advertencias"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs" style={{ color: "#6b6b8a" }}>
            {result.latencyMs}ms
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold transition-colors hover:text-white"
            style={{ color: "#6b6b8a" }}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs" style={{ color: "#c8c8e0" }}>{result.message}</p>

      {/* Checks */}
      <div className="flex flex-col gap-1.5">
        {result.checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              {check.ok ? (
                <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <line x1="2" y1="2" x2="10" y2="10" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="10" y1="2" x2="2" y2="10" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
            <span className="text-xs" style={{ color: check.ok ? "#86efac" : "#fca5a5" }}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function McpCard({
  server,
  testing,
  testResult,
  onTest,
  onDismissResult,
}: {
  server: Server;
  testing: boolean;
  testResult: TestResult | null;
  onTest: () => void;
  onDismissResult: () => void;
}) {
  const isWarning = server.status === "warning";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-150"
      style={{
        background: "#12121a",
        border: `1px solid ${isWarning ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.2)"}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{server.emoji}</span>
            <p className="font-black text-white">{server.name}</p>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isWarning ? "#f59e0b" : "#22c55e",
                boxShadow: isWarning ? "0 0 6px #f59e0b" : "0 0 6px #22c55e",
              }}
            />
          </div>
          <p
            className="font-mono text-xs truncate"
            style={{ color: "#3d3d55", maxWidth: "280px" }}
          >
            {server.command}
          </p>
        </div>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: isWarning ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
            color: isWarning ? "#f59e0b" : "#22c55e",
            border: isWarning ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(34,197,94,0.25)",
          }}
        >
          {server.status.toUpperCase()}
        </span>
      </div>

      {/* Issues */}
      <div className="flex flex-col gap-1.5">
        {server.issues.map((issue, idx) => {
          const colors = issueColors[issue.type as IssueType];
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                background: colors.bg,
                borderLeft: `2px solid ${colors.border}`,
              }}
            >
              <span style={{ color: colors.text }}>
                {issue.type === "ok" ? "+" : issue.type === "warning" ? "!" : "i"}
              </span>
              <span style={{ color: colors.text }}>{issue.message}</span>
            </div>
          );
        })}
      </div>

      {/* Test result */}
      {testResult && (
        <TestResultPanel result={testResult} onClose={onDismissResult} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onTest}
          disabled={testing}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 disabled:opacity-60 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            color: "white",
          }}
        >
          {testing ? (
            <>
              <span
                className="w-3 h-3 rounded-full border animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
              />
              Testeando...
            </>
          ) : (
            "Testar"
          )}
        </button>
        <button
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-150 hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#c8c8e0",
          }}
        >
          {"{ } Config"}
        </button>
      </div>
    </div>
  );
}

export function McpRegistryContent() {
  const [servers, setServers] = useState<Server[]>(mockMcpServers);
  const [testingAll, setTestingAll] = useState(false);
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [showCreate, setShowCreate] = useState(false);

  const handleTestAll = async () => {
    setTestingAll(true);
    const allIds = new Set(servers.map((s) => s.id));
    setTestingIds(allIds);

    const results = await Promise.all(servers.map((s) => runTest(s).then((r) => ({ id: s.id, r }))));
    const map: Record<string, TestResult> = {};
    results.forEach(({ id, r }) => { map[id] = r; });

    setTestResults((prev) => ({ ...prev, ...map }));
    setTestingIds(new Set());
    setTestingAll(false);
  };

  const handleTestOne = async (id: string) => {
    setTestingIds((prev) => new Set([...prev, id]));
    const server = servers.find((s) => s.id === id)!;
    const result = await runTest(server);
    setTestResults((prev) => ({ ...prev, [id]: result }));
    setTestingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const dismissResult = (id: string) => {
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">MCP Registry</h1>
          <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
            {servers.length} servidor{servers.length !== 1 ? "es" : ""} configurado{servers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-black transition-all hover:brightness-110"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#c8c8e0" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6.5" y1="1" x2="6.5" y2="12" />
              <line x1="1" y1="6.5" x2="12" y2="6.5" />
            </svg>
            Nuevo MCP
          </button>
          <button
            onClick={handleTestAll}
            disabled={testingAll}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-black transition-all duration-150 disabled:opacity-60 hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}
          >
            {testingAll ? (
              <>
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
                />
                Testeando todos...
              </>
            ) : (
              "Testar todos"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {servers.map((server) => (
          <McpCard
            key={server.id}
            server={server}
            testing={testingIds.has(server.id)}
            testResult={testResults[server.id] ?? null}
            onTest={() => handleTestOne(server.id)}
            onDismissResult={() => dismissResult(server.id)}
          />
        ))}
      </div>

      {showCreate && (
        <CreateModal
          type="mcp"
          onClose={() => setShowCreate(false)}
          onSave={(entity) => {
            setServers((prev) => [...prev, entity as Server]);
          }}
        />
      )}
    </div>
  );
}
