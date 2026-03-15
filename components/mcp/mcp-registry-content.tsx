"use client";

import { useState, useEffect } from "react";
import { getMcpServers, testMcpServer, getMcpServerById } from "@/lib/api";
import { CreateModal } from "@/components/create-modal";
import { useToast } from "@/hooks/use-toast";

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
  configJson?: string;
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

function ConfigModal({ serverId, onClose }: { serverId: string | number; onClose: () => void }) {
  const [config, setConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getMcpServerById(serverId).then((data) => {
      if (data && data.configJson) {
        setConfig(data.configJson);
      } else if (data) {
        // Fallback if configJson is not directly there
        const fallbackConfig = {
          mcpServers: {
            [data.name.toLowerCase().replace(/\s+/g, "-")]: {
              command: data.command,
              args: data.args,
              env: data.env || {}
            }
          }
        };
        setConfig(JSON.stringify(fallbackConfig, null, 2));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración del servidor.",
        variant: "destructive"
      });
    });
  }, [serverId, toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Configuración copiada al portapapeles."
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="relative rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{
          background: "#0e0e18",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="font-bold text-lg text-white">Configuración MCP</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-400 mb-4">
            Copia esta configuración en tu archivo <code className="bg-slate-800 px-1 rounded text-indigo-300">mcp_config.json</code> de Claude Desktop o Cursor.
          </p>
          
          <div className="relative group">
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleCopy}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            
            <div 
              className="rounded-xl p-4 font-mono text-xs overflow-auto max-h-[400px]"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", color: "#a5b4fc" }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <pre>{config}</pre>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

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
  onConfig,
  onDismissResult,
}: {
  server: Server;
  testing: boolean;
  testResult: TestResult | null;
  onTest: () => void;
  onConfig: () => void;
  onDismissResult: () => void;
}) {
  const isWarning = server.validationStatus === "WARNING";
  const isError = server.validationStatus === "ERROR";

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-150 h-full"
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
            className="font-mono text-[10px] truncate"
            style={{ color: "#3d3d55", maxWidth: "250px" }}
          >
            {server.command} {server.args?.join(" ")}
          </p>
        </div>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
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
              className="flex flex-col gap-1 rounded-lg px-3 py-2 text-[11px] font-medium"
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
                <p className="text-[9px] ml-4 opacity-70" style={{ color: colors.text }}>{issue.suggestion}</p>
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
      <div className="flex items-center gap-2 mt-auto pt-2">
        <button
          onClick={onTest}
          disabled={testing}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all duration-150 disabled:opacity-60 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            color: "white",
          }}
        >
          {testing ? (
            <>
              <span
                className="rounded-full animate-spin"
                style={{ width: "12px", height: "12px", borderWidth: "2px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
              />
              Testeando...
            </>
          ) : (
            "Testar"
          )}
        </button>
        <button
          onClick={onConfig}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all duration-150 hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#c8c8e0",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Config
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
  const [activeConfigId, setActiveConfigId] = useState<string | number | null>(null);
  const { toast } = useToast();

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
                  className="rounded-full animate-spin"
                  style={{ width: "14px", height: "14px", borderWidth: "2px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
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
              onConfig={() => setActiveConfigId(server.id)}
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

      {activeConfigId && (
        <ConfigModal
          serverId={activeConfigId}
          onClose={() => setActiveConfigId(null)}
        />
      )}
    </div>
  );
}
