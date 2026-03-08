"use client";

import { useState, useEffect } from "react";
import { getSkills } from "@/lib/api";
import { AiBadge, categoryVariant } from "@/components/ui/ai-badge";
import { CreateModal } from "@/components/create-modal";

interface Skill {
  id: number | string;
  name: string;
  description: string;
  template: string;
  category: string;
  parameters: string[];
  usageCount: number;
  qualityScore: number;
}

/* ------------------------------------------------------------------ */
/*  UseSkillModal                                                       */
/* ------------------------------------------------------------------ */

function UseSkillModal({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const resolvedTemplate = skill.parameters.reduce((tpl, param) => {
    // Check if param already includes {{ }}
    const placeholder = param.startsWith("{{") ? param : `{{${param}}}`;
    const key = param.replace(/[{}]/g, "");
    return tpl.replaceAll(placeholder, values[key] ?? placeholder);
  }, skill.template);

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        className="relative rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: "560px",
          maxHeight: "88vh",
          background: "#0e0e18",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#6366f1" }}>
              Usar Skill
            </p>
            <h2 className="text-lg font-black text-white">{skill.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: "#6b6b8a" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Parameters */}
          {skill.parameters.length > 0 && (
            <div className="flex flex-col gap-3">
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest"
                style={{ color: "#6366f1" }}
              >
                Parametros
              </p>
              {skill.parameters.map((param) => {
                const key = param.replace(/[{}]/g, "");
                return (
                  <div key={param}>
                    <p className="text-xs font-bold mb-1.5" style={{ color: "#c8c8e0" }}>
                      {param}
                    </p>
                    <input
                      type="text"
                      value={values[key] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      placeholder={`Valor para ${param}`}
                      className="w-full rounded-xl text-sm outline-none px-3 py-2"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e8e8f0",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Resolved preview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest"
                style={{ color: "#6366f1" }}
              >
                Resultado
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                style={{
                  background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                  border: copied ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.12)",
                  color: copied ? "#4ade80" : "#c8c8e0",
                }}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="7" height="7" rx="1.5" />
                      <path d="M2 8V2h6" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <pre
                className="font-mono text-xs leading-relaxed whitespace-pre-wrap"
                style={{ color: "#a5b4fc" }}
              >
                {resolvedTemplate || <span style={{ color: "#3d3d55" }}>Sin template definido.</span>}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3 border-t flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#c8c8e0",
            }}
          >
            Cerrar
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 py-2 px-5 rounded-xl text-sm font-black transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}
          >
            Copiar prompt
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SkillCard                                                           */
/* ------------------------------------------------------------------ */

function SkillCard({ skill }: { skill: Skill }) {
  const [hovered, setHovered] = useState(false);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  return (
    <>
      <div
        className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-150"
        style={{
          background: "#12121a",
          border: "1px solid rgba(255,255,255,0.07)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-sm font-bold" style={{ color: "#e8e8f0" }}>
            {skill.name}
          </p>
          <AiBadge variant={categoryVariant(skill.category)}>{skill.category}</AiBadge>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed" style={{ color: "#6b6b8a" }}>
          {skill.description}
        </p>

        {/* Parameters */}
        <div className="flex flex-wrap gap-1.5">
          {skill.parameters.map((param) => (
            <span
              key={param}
              className="font-mono text-xs px-2 py-0.5 rounded-lg"
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="font-mono text-xs font-bold" style={{ color: "#6b6b8a" }}>
            {skill.usageCount?.toLocaleString() || 0} uses
          </span>
          <button
            onClick={() => setActiveSkill(skill)}
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl transition-all duration-150 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "white",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2 1.5l6 3.5-6 3.5V1.5z" />
            </svg>
            Usar
          </button>
        </div>
      </div>

      {activeSkill && (
        <UseSkillModal skill={activeSkill} onClose={() => setActiveSkill(null)} />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function SkillsContent() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Skills</h1>
          <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
            {skills.length} reusable skill template{skills.length !== 1 ? "s" : ""}
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
          Nuevo Skill
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          type="skill"
          onClose={() => setShowCreate(false)}
          onSave={() => {
            fetchSkills();
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

