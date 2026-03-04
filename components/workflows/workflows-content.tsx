"use client";

import { useState, useRef } from "react";
import { mockWorkflows } from "@/lib/mock-data";
import { AiBadge } from "@/components/ui/ai-badge";
import { cn } from "@/lib/utils";
import { CreateModal } from "@/components/create-modal";

type Workflow = (typeof mockWorkflows)[0];
type StepStatus = "pending" | "running" | "done";

const stepTypeVariant: Record<string, "indigo" | "cyan" | "violet"> = {
  SKILL: "indigo",
  FREE_PROMPT: "cyan",
  TRANSFORM: "violet",
};

interface StepResult {
  text: string;
}

function WorkflowRunner({ workflow }: { workflow: Workflow }) {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    workflow.steps.map(() => "pending")
  );
  const [stepResults, setStepResults] = useState<(StepResult | null)[]>(
    workflow.steps.map(() => null)
  );
  const [metrics, setMetrics] = useState<{
    completed: number;
    time: string;
    tokens: number;
  } | null>(null);

  const abortRef = useRef(false);

  const handleExecute = async () => {
    if (!input.trim() || running) return;
    abortRef.current = false;
    setRunning(true);
    setMetrics(null);
    setStepResults(workflow.steps.map(() => null));
    setStepStatuses(workflow.steps.map(() => "pending"));

    const startTime = Date.now();
    let totalTokens = 0;

    for (let i = 0; i < workflow.steps.length; i++) {
      if (abortRef.current) break;

      setStepStatuses((prev) => {
        const next = [...prev];
        next[i] = "running";
        return next;
      });

      const delay = 1200 + Math.random() * 800;
      await new Promise((r) => setTimeout(r, delay));

      const tokens = Math.floor(Math.random() * 200 + 100);
      totalTokens += tokens;

      const resultText = `Step ${i + 1} completed — ${workflow.steps[i].name}\n\nProcessed via ${workflow.steps[i].type} operation${workflow.steps[i].skill ? ` using skill "${workflow.steps[i].skill}"` : ""}. Generated ${tokens} tokens. Output is structured and ready for next step.`;

      setStepStatuses((prev) => {
        const next = [...prev];
        next[i] = "done";
        return next;
      });
      setStepResults((prev) => {
        const next = [...prev];
        next[i] = { text: resultText };
        return next;
      });
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    setMetrics({ completed: workflow.steps.length, time: elapsed, tokens: totalTokens });
    setRunning(false);
  };

  return (
    <div
      className="rounded-2xl flex flex-col h-full"
      style={{
        background: "#12121a",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div>
          <p className="font-black text-white text-base">
            {workflow.emoji} {workflow.name}
          </p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "#6b6b8a" }}>
            {workflow.steps.length} steps
          </p>
        </div>
        <button
          onClick={handleExecute}
          disabled={running || !input.trim()}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-black transition-all duration-150 disabled:opacity-50 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            color: "white",
          }}
        >
          {running ? (
            <>
              <span
                className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
              />
              Running
            </>
          ) : (
            "▶ Ejecutar"
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        {/* Input */}
        <div>
          <label
            className="block font-mono text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "#6b6b8a" }}
          >
            Initial Input
          </label>
          <textarea
            rows={3}
            placeholder="Enter the input for this workflow..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-xl text-sm leading-relaxed font-mono resize-none outline-none transition-colors duration-150"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e8e8f0",
              padding: "10px 14px",
            }}
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col">
          {workflow.steps.map((step, idx) => {
            const status = stepStatuses[idx];
            const result = stepResults[idx];

            return (
              <div key={step.id} className="flex gap-3">
                {/* Step connector column */}
                <div className="flex flex-col items-center" style={{ width: "28px" }}>
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-300",
                      status === "running" ? "animate-spin" : ""
                    )}
                    style={{
                      background:
                        status === "done"
                          ? "#22c55e"
                          : status === "running"
                          ? "transparent"
                          : "rgba(255,255,255,0.05)",
                      border:
                        status === "running"
                          ? "2px solid rgba(99,102,241,0.3)"
                          : status === "done"
                          ? "2px solid #22c55e"
                          : "2px solid rgba(255,255,255,0.1)",
                      borderTopColor: status === "running" ? "#6366f1" : undefined,
                    }}
                  >
                    {status === "done" ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : status !== "running" ? (
                      <span className="font-mono text-xs font-bold" style={{ color: "#6b6b8a" }}>
                        {idx + 1}
                      </span>
                    ) : null}
                  </div>

                  {/* Vertical connector */}
                  {idx < workflow.steps.length - 1 && (
                    <div
                      className="w-0.5 flex-1 my-1 transition-colors duration-500"
                      style={{
                        minHeight: "24px",
                        background:
                          status === "done"
                            ? "#6366f1"
                            : "rgba(255,255,255,0.08)",
                      }}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-sm" style={{ color: "#e8e8f0" }}>
                      {step.name}
                    </p>
                    <AiBadge variant={stepTypeVariant[step.type] ?? "default"}>
                      {step.type}
                    </AiBadge>
                    {step.skill && (
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded-md"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "#6b6b8a",
                        }}
                      >
                        {step.skill}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: "#6b6b8a" }}>
                    {step.description}
                  </p>

                  {/* Output */}
                  {result && (
                    <div
                      className="rounded-xl p-3 mt-1"
                      style={{
                        background: "rgba(34,197,94,0.05)",
                        border: "1px solid rgba(34,197,94,0.15)",
                      }}
                    >
                      <pre
                        className="font-mono text-xs leading-relaxed whitespace-pre-wrap"
                        style={{ color: "#86efac" }}
                      >
                        {result.text}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Metrics + download */}
        {metrics && (
          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl p-4 grid grid-cols-3 gap-4"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              {[
                { label: "Pasos completados", value: `${metrics.completed}/${workflow.steps.length}` },
                { label: "Tiempo total", value: `${metrics.time}s` },
                { label: "Tokens est.", value: metrics.tokens.toLocaleString() },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className="font-mono text-xl font-black" style={{ color: "#a5b4fc" }}>
                    {m.value}
                  </p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: "#6b6b8a" }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Download full result */}
            <button
              onClick={() => {
                const lines: string[] = [
                  `WORKFLOW: ${workflow.name}`,
                  `DATE: ${new Date().toLocaleString()}`,
                  `INPUT: ${input}`,
                  "",
                  "--- RESULTS ---",
                  "",
                ];
                stepResults.forEach((r, i) => {
                  lines.push(`[Step ${i + 1}] ${workflow.steps[i]?.name ?? ""}`);
                  lines.push(r?.text ?? "(no output)");
                  lines.push("");
                });
                lines.push("--- METRICS ---");
                lines.push(`Steps: ${metrics.completed}/${workflow.steps.length}`);
                lines.push(`Time: ${metrics.time}s`);
                lines.push(`Tokens: ${metrics.tokens}`);

                const blob = new Blob([lines.join("\n")], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${workflow.name.replace(/\s+/g, "_")}_result.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all hover:brightness-110 w-full"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#4ade80",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1v8M4 6l3 3 3-3" />
                <path d="M2 11h10" />
              </svg>
              Descargar resultado completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkflowsContent() {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [selected, setSelected] = useState<Workflow>(mockWorkflows[0]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Workflows</h1>
          <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
            Automated multi-step AI pipelines
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
          Nuevo Workflow
        </button>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* List */}
        <div className="flex flex-col gap-3" style={{ width: "280px", flexShrink: 0 }}>
          {workflows.map((wf) => (
            <button
              key={wf.id}
              onClick={() => setSelected(wf)}
              className="text-left rounded-2xl p-4 transition-all duration-150"
              style={{
                background: selected.id === wf.id ? "rgba(99,102,241,0.08)" : "#12121a",
                border: `1px solid ${selected.id === wf.id ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
                borderLeft: selected.id === wf.id ? "3px solid #6366f1" : undefined,
              }}
            >
              <p className="font-black text-sm text-white mb-1">
                {wf.emoji} {wf.name}
              </p>
              <p
                className="font-mono text-xs mb-2"
                style={{ color: "#6366f1" }}
              >
                {wf.steps.map((s) => s.type).join(" → ")}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#6b6b8a" }}>
                {wf.description}
              </p>
            </button>
          ))}
        </div>

        {/* Runner */}
        <div className="flex-1 min-h-0">
          <WorkflowRunner workflow={selected} />
        </div>
      </div>

      {showCreate && (
        <CreateModal
          type="workflow"
          onClose={() => setShowCreate(false)}
          onSave={(entity) => {
            const wf = entity as Workflow;
            setWorkflows((prev) => [...prev, wf]);
            setSelected(wf);
          }}
        />
      )}
    </div>
  );
}
