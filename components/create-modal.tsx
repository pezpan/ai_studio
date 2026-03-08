"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  createPrompt, 
  createSkill, 
  createWorkflow, 
  createMcpServer, 
  createContextPack 
} from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type EntityType =
  | "prompt"
  | "skill"
  | "workflow"
  | "mcp"
  | "context-pack";

const entityLabels: Record<EntityType, string> = {
  prompt: "Prompt",
  skill: "Skill",
  workflow: "Workflow",
  mcp: "MCP Server",
  "context-pack": "Context Pack",
};

const DEFAULT_CATEGORIES = ["development", "marketing", "writing", "analysis", "other"];
const STEP_TYPES = ["SKILL", "FREE_PROMPT", "TRANSFORM"];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                       */
/* ------------------------------------------------------------------ */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-xs font-bold uppercase tracking-widest mb-1.5"
      style={{ color: "#6366f1" }}
    >
      {children}
    </p>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("w-full rounded-xl text-sm outline-none transition-colors px-3 py-2", className)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e8e8f0",
      }}
    />
  );
}

function FieldTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl text-sm font-mono leading-relaxed resize-none outline-none px-3 py-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e8e8f0",
      }}
    />
  );
}

function FieldSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl text-sm outline-none px-3 py-2 appearance-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e8e8f0",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#12121a" }}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/*  Category selector with custom-category support                      */
/* ------------------------------------------------------------------ */

function CategoryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const confirmCustom = () => {
    const trimmed = customInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
    onChange(trimmed);
    setCustomMode(false);
    setCustomInput("");
  };

  if (customMode) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmCustom();
            if (e.key === "Escape") setCustomMode(false);
          }}
          placeholder="Ej: finanzas, legal..."
          className="flex-1 rounded-xl text-sm outline-none px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(99,102,241,0.4)",
            color: "#e8e8f0",
          }}
        />
        <button
          type="button"
          onClick={confirmCustom}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
          style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc" }}
        >
          Añadir
        </button>
        <button
          type="button"
          onClick={() => setCustomMode(false)}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#6b6b8a" }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <FieldSelect value={value} onChange={onChange} options={categories} />
      <button
        type="button"
        onClick={() => setCustomMode(true)}
        className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110 whitespace-nowrap"
        style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
      >
        + Nueva
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Per-entity form sections                                            */
/* ------------------------------------------------------------------ */

function PromptForm({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Nombre *</Label>
        <FieldInput
          value={data.name ?? ""}
          onChange={(v) => onChange("name", v)}
          placeholder="Ej: Senior Copywriter"
        />
      </div>
      <div>
        <Label>Categoría</Label>
        <CategoryField
          value={data.category ?? "development"}
          onChange={(v) => onChange("category", v)}
        />
      </div>
      <div>
        <Label>Contenido del prompt</Label>
        <textarea
          rows={14}
          value={data.content ?? ""}
          onChange={(e) => onChange("content", e.target.value)}
          placeholder={"Escribe aqui el contenido de tu prompt en texto plano...\n\nEj:\nActua como un experto en marketing digital. Tu objetivo es escribir un copy persuasivo para una landing page de SaaS dirigido a startups. Responde en formato Markdown con headline, subheadline y tres beneficios clave."}
          className="w-full rounded-xl text-sm leading-relaxed resize-none outline-none px-3 py-3 font-sans"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e8e8f0",
          }}
        />
        <p className="font-mono text-xs mt-1.5" style={{ color: "#3d3d55" }}>
          Una vez guardado puedes mejorarlo con IA para estructurarlo en secciones.
        </p>
      </div>
    </div>
  );
}

function SkillForm({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Nombre (snake_case) *</Label>
        <FieldInput value={data.name ?? ""} onChange={(v) => onChange("name", v)} placeholder="Ej: translate_text" />
      </div>
      <div>
        <Label>Categoría</Label>
        <CategoryField value={data.category ?? "development"} onChange={(v) => onChange("category", v)} />
      </div>
      <div>
        <Label>Descripcion</Label>
        <FieldTextarea value={data.description ?? ""} onChange={(v) => onChange("description", v)} placeholder="Lo que hace este skill..." rows={2} />
      </div>
      <div>
        <Label>Parametros (separados por comas)</Label>
        <FieldInput
          value={data.parameters ?? ""}
          onChange={(v) => onChange("parameters", v)}
          placeholder="{'{{INPUT}}, {{LANGUAGE}}, {{STYLE}}'}"
        />
      </div>
      <div>
        <Label>Template</Label>
        <FieldTextarea
          value={data.template ?? ""}
          onChange={(v) => onChange("template", v)}
          placeholder={"Use {{PARAM}} for placeholders..."}
          rows={4}
        />
      </div>
    </div>
  );
}

type WorkflowStep = { name: string; type: string; skill: string; description: string };

function WorkflowForm({
  data,
  onChange,
  steps,
  onStepsChange,
}: {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
}) {
  const addStep = () =>
    onStepsChange([...steps, { name: "", type: "SKILL", skill: "", description: "" }]);

  const updateStep = (idx: number, key: keyof WorkflowStep, value: string) => {
    const next = steps.map((s, i) => (i === idx ? { ...s, [key]: value } : s));
    onStepsChange(next);
  };

  const removeStep = (idx: number) => onStepsChange(steps.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Nombre *</Label>
        <FieldInput value={data.name ?? ""} onChange={(v) => onChange("name", v)} placeholder="Ej: Content Pipeline" />
      </div>
      <div>
        <Label>Emoji</Label>
        <FieldInput value={data.emoji ?? ""} onChange={(v) => onChange("emoji", v)} placeholder="?" />
      </div>
      <div>
        <Label>Descripcion</Label>
        <FieldTextarea value={data.description ?? ""} onChange={(v) => onChange("description", v)} placeholder="Este workflow..." rows={2} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Pasos</Label>
          <button
            type="button"
            onClick={addStep}
            className="font-mono text-xs px-2 py-1 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "#6366f1", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            + Agregar paso
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2 justify-between">
                <span className="font-mono text-xs font-bold" style={{ color: "#6b6b8a" }}>
                  Paso {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="font-mono text-xs hover:text-red-400 transition-colors"
                  style={{ color: "#6b6b8a" }}
                >
                  x
                </button>
              </div>
              <FieldInput value={step.name} onChange={(v) => updateStep(idx, "name", v)} placeholder="Nombre del paso" />
              <FieldSelect value={step.type} onChange={(v) => updateStep(idx, "type", v)} options={STEP_TYPES} />
              <FieldInput value={step.skill} onChange={(v) => updateStep(idx, "skill", v)} placeholder="Skill (opcional)" />
              <FieldInput value={step.description} onChange={(v) => updateStep(idx, "description", v)} placeholder="Descripcion breve" />
            </div>
          ))}
          {steps.length === 0 && (
            <p className="text-xs text-center py-3" style={{ color: "#3d3d55" }}>
              Sin pasos todavia. Puedes guardar sin ellos o agregar al menos uno.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function McpForm({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const STATUSES = ["ok", "warning"];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Nombre *</Label>
        <FieldInput value={data.name ?? ""} onChange={(v) => onChange("name", v)} placeholder="Ej: my-server" />
      </div>
      <div>
        <Label>Emoji</Label>
        <FieldInput value={data.emoji ?? ""} onChange={(v) => onChange("emoji", v)} placeholder="?" />
      </div>
      <div>
        <Label>Comando</Label>
        <FieldInput value={data.command ?? ""} onChange={(v) => onChange("command", v)} placeholder="npx @modelcontextprotocol/server-..." />
      </div>
      <div>
        <Label>Estado inicial</Label>
        <FieldSelect value={data.status ?? "ok"} onChange={(v) => onChange("status", v)} options={STATUSES} />
      </div>
    </div>
  );
}

function ContextPackForm({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Nombre *</Label>
        <FieldInput value={data.name ?? ""} onChange={(v) => onChange("name", v)} placeholder="Ej: ML Engineering" />
      </div>
      <div>
        <Label>Emoji</Label>
        <FieldInput value={data.emoji ?? ""} onChange={(v) => onChange("emoji", v)} placeholder="?" />
      </div>
      <div>
        <Label>Descripcion</Label>
        <FieldTextarea value={data.description ?? ""} onChange={(v) => onChange("description", v)} placeholder="Descripcion del context pack..." rows={2} />
      </div>
      <div>
        <Label>Prompts incluidos (numero)</Label>
        <FieldInput value={data.prompts ?? "0"} onChange={(v) => onChange("prompts", v)} placeholder="0" />
      </div>
      <div>
        <Label>Skills incluidos (numero)</Label>
        <FieldInput value={data.skills ?? "0"} onChange={(v) => onChange("skills", v)} placeholder="0" />
      </div>
      <div>
        <Label>MCPs incluidos (numero)</Label>
        <FieldInput value={data.mcps ?? "0"} onChange={(v) => onChange("mcps", v)} placeholder="0" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Modal                                                          */
/* ------------------------------------------------------------------ */

export interface CreateModalProps {
  type: EntityType;
  onClose: () => void;
  onSave: (entity: Record<string, unknown>) => void;
}

export function CreateModal({ type, onClose, onSave }: CreateModalProps) {
  const [data, setData] = useState<Record<string, string>>({
    category: "development",
    status: "ok",
    emoji: "",
    prompts: "0",
    skills: "0",
    mcps: "0",
  });
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setField = (key: string, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  // Only name is required to save
  const isValid = () => Boolean(data.name?.trim());

  const handleSave = async () => {
    if (!isValid()) return;
    setSaving(true);
    setSaveError(null);

    try {
      if (type === "prompt") {
        const content = data.content?.trim() ?? "";
        await createPrompt({
          name: data.name.trim(),
          content,
          category: data.category ?? "development",
        });
      } else if (type === "skill") {
        const params = (data.parameters ?? "")
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        await createSkill({
          name: data.name,
          category: data.category,
          description: data.description ?? "",
          parameters: params,
          template: data.template ?? "",
        });
      } else if (type === "workflow") {
        await createWorkflow({
          name: data.name,
          emoji: data.emoji || "⚙️",
          description: data.description ?? "",
          steps: workflowSteps.map((s, i) => ({
            stepOrder: i + 1,
            name: s.name || `Paso ${i + 1}`,
            type: s.type,
            skillName: s.skill || null,
            description: s.description,
          })),
        });
      } else if (type === "mcp") {
        await createMcpServer({
          name: data.name,
          emoji: data.emoji || "🔌",
          command: data.command ?? "",
          category: data.category ?? "other",
        });
      } else if (type === "context-pack") {
        await createContextPack({
          name: data.name,
          emoji: data.emoji || "📦",
          description: data.description ?? "",
          resources: {
            prompts: parseInt(data.prompts ?? "0") || 0,
            skills: parseInt(data.skills ?? "0") || 0,
            mcps: parseInt(data.mcps ?? "0") || 0,
          },
        });
      }

      onSave({}); // Signal success, caller will re-fetch
      setSaving(false);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar. Inténtalo de nuevo.");
      setSaving(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: "520px",
          maxHeight: "88vh",
          background: "#0e0e18",
          border: "1px solid rgba(99,102,241,0.25)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div>
            <h2 className="text-lg font-black text-white">
              Nuevo {entityLabels[type]}
            </h2>
            <p className="text-xs mt-0.5 font-mono" style={{ color: "#6b6b8a" }}>
              Solo el nombre es obligatorio para guardar
            </p>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {type === "prompt" && <PromptForm data={data} onChange={setField} />}
          {type === "skill" && <SkillForm data={data} onChange={setField} />}
          {type === "workflow" && (
            <WorkflowForm
              data={data}
              onChange={setField}
              steps={workflowSteps}
              onStepsChange={setWorkflowSteps}
            />
          )}
          {type === "mcp" && <McpForm data={data} onChange={setField} />}
          {type === "context-pack" && <ContextPackForm data={data} onChange={setField} />}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex-shrink-0 flex flex-col gap-2"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {saveError && (
            <p
              className="text-xs font-mono text-center rounded-xl px-3 py-2"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
            >
              {saveError}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs" style={{ color: isValid() ? "#22c55e" : "#6b6b8a" }}>
              {isValid() ? "Listo para guardar" : "El nombre es requerido"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#6b6b8a",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid() || saving}
                className="flex items-center gap-2 py-2 px-5 rounded-xl text-sm font-black transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}
              >
                {saving ? (
                  <>
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}
                    />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
