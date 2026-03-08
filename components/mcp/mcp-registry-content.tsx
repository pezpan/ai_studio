"use client";

import { useState, useEffect } from "react";
import { getMcpServers, testMcpServer } from "@/lib/api";
import { CreateModal } from "@/components/create-modal";

interface McpIssue {
  severity: 'WARNING' | 'ERROR' | 'INFO';
  field: string;
  message: string;
  suggestion: string;
}

interface Server {
  id: number | string;
  name: string;
  description: string;
  command: string;
  args: string[];
  category: string;
  validationStatus: 'OK' | 'WARNING' | 'ERROR';
  issues: McpIssue[];
  emoji?: string;
}

interface TestResult {
  valid: boolean;
  status: string;
  issues: McpIssue[];
  testedAt: string;
}

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  OK: { bg: "rgba(34,197,94,0.06)", text: "#4ade80", border: "#22c55e" },
  INFO: { bg: "rgba(99,102,241,0.06)", text: "#818cf8", border: "#6366f1" },
  WARNING: { bg: "rgba(245,158,11,0.06)", text: "#fbbf24", border: "#f59e0b" },
  ERROR: { bg: "rgba(239,68,68,0.06)", text: "#f87171", border: "#ef4444" },
};

function TestResultPanel({ result, onClose }: { result: TestResult; onClose: () => void }) {
  const isOk = result.status === "OK" || result.valid;
  return (
    <div
      className="mt-3 rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: isOk ? "rgba(34,197,94,0.05)" : "rgba(245,158,11,0.05)",
        border: `1px solid ${isOk ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
      }}
    >
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: isOk ? "#22c55e" : "#f59e0b",
              boxShadow: isOk ? "0 0 6px #22c55e" : "0 0 6px #f59e0b",
            }}
          />
          <span className="font-bold text-xs" style={{ color: isOk ? "#4ade80" : "#fbbf24" }}>
            {isOk ? "Test exitoso" : "Test con advertencias"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs" style={{ color: "#6b6b8a" }}>
            {new Date(result.testedAt).toLocaleTimeString()}
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

      {/* Issues */}
      <div className="flex flex-col gap-1.5">
        {result.issues.length > 0 ? result.issues.map((issue, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold" style={{ color: severityColors[issue.severity]?.text || "#c8c8e0" }}>
                  [{issue.field}] {issue.message}
               </span>
            </div>
            {issue.suggestion && (
              <p className="text-[10px] ml-4" style={{ color: "#6b6b8a" }}>
                Sugerencia: {issue.suggestion}
              </p>
            )}
          </div>
        )) : (
          <p className="text-xs" style={{ color: "#86efac" }}>Servidor validado correctamente.</p>
        )}
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
  const isWarning = server.validationStatus === "WARNING";
  const isError = server.validationStatus === "ERROR";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-150"
      style={{
        background: "#12121a",
        border: `1px solid ${isError ? "rgba(239,68,68,0.3)" : isWarning ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.2)"}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{server.emoji || "🔌"}</span>
            <p className="font-black text-white">{server.name}</p>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isError ? "#ef4444" : isWarning ? "#f59e0b" : "#22c55e",
                boxShadow: isError ? "0 0 6px #ef4444" : isWarning ? "0 0 6px #f59e0b" : "0 0 6px #22c55e",
              }}
            />
          </div>
          <p
            className="font-mono text-xs truncate"
            style={{ color: "#3d3d55", maxWidth: "280px" }}
          >
            {server.command} {server.args?.join(" ")}
          </p>
        </div>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: isError ? "rgba(239,68,68,0.1)" : isWarning ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)",
            color: isError ? "#f87171" : isWarning ? "#f59e0b" : "#22c55e",
            border: `1px solid ${isError ? "rgba(239,68,68,0.25)" : isWarning ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.25)"}`,
          }}
        >
          {server.validationStatus}
        </span>
      </div>

      {/* Issues */}
      <div className="flex flex-col gap-1.5">
        {server.issues.map((issue, idx) => {
          const colors = severityColors[issue.severity] || severityColors.INFO;
          return (
            <div
              key={idx}
              className="flex flex-col gap-1 rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                background: colors.bg,
                borderLeft: `2px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span style={{ color: colors.text }}>
                  {issue.severity === "ERROR" ? "!" : issue.severity === "WARNING" ? "⚠" : "i"}
                </span>
                <span style={{ color: colors.text }}>{issue.message}</span>
              </div>
              {issue.suggestion && (
                <p className="text-[10px] ml-4" style={{ color: "#6b6b8a" }}>{issue.suggestion}</p>
              )}
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
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingIds, setTestingIds] = useState<Set<string | number>>(new Set());
  const [testResults, setTestResults] = useState<Record<string | number, TestResult>>({});
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const data = await getMcpServers();
      setServers(data);
    } catch (error) {
      console.error("Failed to fetch MCP servers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    const allIds = new Set(servers.map((s) => s.id));
    setTestingIds(allIds);

    try {
      const results = await Promise.all(servers.map((s) => testMcpServer(s.id).then((r) => ({ id: s.id, r }))));
      const map: Record<string | number, TestResult> = {};
      results.forEach(({ id, r }) => { map[id] = r; });
      setTestResults((prev) => ({ ...prev, ...map }));
    } catch (error) {
      console.error("Failed to test all servers:", error);
    } finally {
      setTestingIds(new Set());
      setTestingAll(false);
    }
  };

  const handleTestOne = async (id: string | number) => {
    setTestingIds((prev) => new Set([...prev, id]));
    try {
      const result = await testMcpServer(id);
      setTestResults((prev) => ({ ...prev, [id]: result }));
    } catch (error) {
      console.error(`Failed to test server ${id}:`, error);
    } finally {
      setTestingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const dismissResult = (id: string | number) => {
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
            disabled={testingAll || loading}
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
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
      )}

      {showCreate && (
        <CreateModal
          type="mcp"
          onClose={() => setShowCreate(false)}
          onSave={() => {
            fetchServers();
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

