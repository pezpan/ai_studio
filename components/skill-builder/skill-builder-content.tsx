"use client";

import { useState } from "react";
import { buildSkill } from "@/lib/api";

interface SkillResult {
  name: string;
  parameters: string[];
  template: string;
  quality: number;
}

export function SkillBuilderContent() {
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [category, setCategory] = useState("development");
  const [outputFormat, setOutputFormat] = useState("");
  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillResult | null>(null);

  const handleGenerate = async () => {
    if (!objective.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await buildSkill({ objective, audience, category, outputFormat, save });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#e8e8f0",
    padding: "10px 14px",
    fontSize: "14px",
    fontFamily: "var(--font-nunito)",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: "12px",
    fontFamily: "var(--font-space-mono)",
    fontWeight: "bold",
    color: "#6b6b8a",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1">Skill Builder</h1>
        <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
          Generate reusable AI skill templates with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Form */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div>
            <label style={labelStyle}>Objetivo</label>
            <textarea
              rows={4}
              placeholder="Describe what this skill should do, e.g., 'Review code for security vulnerabilities and suggest fixes'"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Audiencia</label>
              <input
                type="text"
                placeholder="e.g., Senior engineers"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                }}
              >
                <option value="development">development</option>
                <option value="writing">writing</option>
                <option value="marketing">marketing</option>
                <option value="analysis">analysis</option>
                <option value="devops">devops</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Formato de output</label>
            <input
              type="text"
              placeholder="e.g., Markdown report with sections for findings and recommendations"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              role="checkbox"
              aria-checked={save}
              onClick={() => setSave(!save)}
              className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150"
              style={{
                background: save ? "#6366f1" : "rgba(255,255,255,0.06)",
                border: save ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {save && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <label
              className="text-sm font-medium cursor-pointer"
              style={{ color: "#c8c8e0" }}
              onClick={() => setSave(!save)}
            >
              Guardar en BD
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !objective.trim()}
            className="w-full py-3 rounded-xl text-sm font-black transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "white",
            }}
          >
            {loading ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                  }}
                />
                Generando...
              </>
            ) : (
              "✨ Generar Skill con IA"
            )}
          </button>
        </div>

        {/* Right: Result */}
        <div
          className="rounded-2xl p-6 flex flex-col"
          style={{
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.07)",
            minHeight: "400px",
          }}
        >
          {!result && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div
                className="text-6xl mb-4 font-mono select-none"
                style={{ color: "rgba(99,102,241,0.15)" }}
              >
                ✨
              </div>
              <p className="font-semibold mb-1" style={{ color: "#6b6b8a" }}>
                Your skill will appear here
              </p>
              <p className="text-sm" style={{ color: "#3d3d55" }}>
                Describe your skill and press Generar
              </p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span
                className="w-10 h-10 rounded-full border-2 animate-spin mb-4"
                style={{
                  borderColor: "rgba(99,102,241,0.2)",
                  borderTopColor: "#6366f1",
                }}
              />
              <p className="font-semibold" style={{ color: "#6b6b8a" }}>
                Generating skill...
              </p>
              <p className="font-mono text-xs mt-1" style={{ color: "#3d3d55" }}>
                Analyzing objective and building template
              </p>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-4 flex-1">
              {/* Name */}
              <div>
                <p
                  className="font-mono text-xs font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "#6366f1" }}
                >
                  Skill Name
                </p>
                <p className="font-mono text-lg font-bold" style={{ color: "#e8e8f0" }}>
                  {result.name}
                </p>
              </div>

              {/* Parameters */}
              <div>
                <p
                  className="font-mono text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#6366f1" }}
                >
                  Parameters Detected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.parameters.map((param) => (
                    <span
                      key={param}
                      className="font-mono text-xs px-2.5 py-1 rounded-lg"
                      style={{
                        background: "rgba(6,182,212,0.08)",
                        color: "#22d3ee",
                        border: "1px solid rgba(6,182,212,0.15)",
                      }}
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div className="flex-1 flex flex-col">
                <p
                  className="font-mono text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#6366f1" }}
                >
                  Template
                </p>
                <div
                  className="flex-1 rounded-xl p-4 overflow-y-auto"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    maxHeight: "220px",
                  }}
                >
                  <pre
                    className="font-mono text-xs leading-relaxed whitespace-pre-wrap"
                    style={{ color: "#a8a8c0" }}
                  >
                    {result.template}
                  </pre>
                </div>
              </div>

              {/* Quality + Save */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: "#6b6b8a" }}>
                    Calidad estimada:
                  </span>
                  <span
                    className="font-mono text-sm font-black px-2 py-0.5 rounded-lg"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#22c55e",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    {result.quality}%
                  </span>
                </div>
                <button
                  className="py-2 px-4 rounded-xl text-sm font-bold transition-all duration-150 hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: "white",
                  }}
                >
                  Guardar en el catálogo
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
