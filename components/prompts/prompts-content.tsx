"use client";

import { useState } from "react";
import { mockPrompts } from "@/lib/mock-data";
import { AiBadge, categoryVariant } from "@/components/ui/ai-badge";
import { cn } from "@/lib/utils";
import { CreateModal } from "@/components/create-modal";

type Prompt = (typeof mockPrompts)[0] & { content?: string };

const sectionLabels = [
  { key: "rol", label: "ROL" },
  { key: "tarea", label: "TAREA" },
  { key: "audiencia", label: "AUDIENCIA" },
  { key: "formato", label: "FORMATO" },
  { key: "contexto", label: "CONTEXTO" },
] as const;

function PromptRow({
  prompt,
  isSelected,
  onClick,
}: {
  prompt: Prompt;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-4 transition-all duration-150 cursor-pointer",
        isSelected ? "" : "hover:border-white/10"
      )}
      style={{
        background: isSelected ? "rgba(99,102,241,0.08)" : "#12121a",
        border: `1px solid ${isSelected ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.07)"}`,
        borderLeft: isSelected ? "3px solid #6366f1" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-white leading-snug" style={{ fontWeight: 800 }}>
          {prompt.name}
        </p>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <AiBadge variant={categoryVariant(prompt.category)}>
            {prompt.category}
          </AiBadge>
          <AiBadge variant={prompt.status === "improved" ? "green" : "amber"}>
            {prompt.status}
          </AiBadge>
        </div>
      </div>
      <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "#6b6b8a" }}>
        {prompt.preview}
      </p>
      {/* Quality bar */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${prompt.quality}%`,
              background: "linear-gradient(90deg, #6366f1, #22c55e)",
            }}
          />
        </div>
        <span className="font-mono text-xs font-bold" style={{ color: "#22c55e" }}>
          {prompt.quality}%
        </span>
      </div>
    </button>
  );
}

function EmptyDetail() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <p className="font-semibold mb-1" style={{ color: "#6b6b8a" }}>
        No prompt selected
      </p>
      <p className="text-sm" style={{ color: "#3d3d55" }}>
        Select a prompt to view its complete content
      </p>
    </div>
  );
}

function PromptDetail({
  prompt,
  onImprove,
  onExport,
  onDelete,
}: {
  prompt: Prompt;
  onImprove: () => Promise<void>;
  onExport: () => void;
  onDelete: () => void;
}) {
  const [improving, setImproving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleImprove = async () => {
    setImproving(true);
    await onImprove();
    setImproving(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <h2 className="text-lg font-black text-white mb-2">{prompt.name}</h2>
        <div className="flex flex-wrap gap-1.5">
          <AiBadge variant={categoryVariant(prompt.category)}>{prompt.category}</AiBadge>
          <AiBadge variant={prompt.status === "improved" ? "green" : "amber"}>
            {prompt.status}
          </AiBadge>
          <AiBadge variant="default">quality: {prompt.quality}%</AiBadge>
        </div>
      </div>

      {/* Content — plain text if not improved, structured sections if improved */}
      <div className="flex-1 px-5 py-4 flex flex-col gap-4">
        {prompt.status === "improved" ? (
          sectionLabels.map(({ key, label }) => (
            <div key={key}>
              <p
                className="font-mono text-xs font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "#6366f1" }}
              >
                {label}
              </p>
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="font-mono text-xs leading-relaxed" style={{ color: "#a8a8c0" }}>
                  {prompt.sections[key]}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div>
            <p
              className="font-mono text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "#6b6b8a" }}
            >
              Contenido
            </p>
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "#a8a8c0" }}
              >
                {(prompt as Prompt).content || prompt.preview}
              </p>
            </div>
            <p className="font-mono text-xs mt-2" style={{ color: "#3d3d55" }}>
              Usa "Mejorar con IA" para estructurar este prompt en secciones.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="px-5 py-4 flex items-center gap-2 border-t"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={handleImprove}
          disabled={improving}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            color: "white",
          }}
        >
          {improving ? (
            <>
              <span
                className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                }}
              />
              Improving...
            </>
          ) : (
            "Mejorar con IA"
          )}
        </button>
        <button
          onClick={onExport}
          className="py-2 px-3 rounded-xl text-sm font-bold transition-all duration-150 hover:bg-white/10 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#c8c8e0",
          }}
        >
          Exportar
        </button>
        <button
          onClick={handleDelete}
          title={confirmDelete ? "Click again to confirm" : "Delete prompt"}
          className="py-2 px-3 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95"
          style={{
            background: confirmDelete ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${confirmDelete ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
            color: "#f87171",
          }}
        >
          {confirmDelete ? (
            "Confirmar"
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function PromptsContent() {
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleImprove = async () => {
    await new Promise((r) => setTimeout(r, 2000));
    if (!selected) return;

    // If the prompt was created as plain text, simulate structuring it into sections
    const wasPlainText = !selected.sections.rol && !selected.sections.tarea;
    const content = (selected as Prompt).content ?? selected.preview;
    const improvedSections = wasPlainText
      ? {
          rol: content,
          tarea: "(Estructurado por IA a partir del contenido original)",
          audiencia: "",
          formato: "",
          contexto: "",
        }
      : selected.sections;

    const updated = {
      ...selected,
      status: "improved",
      quality: Math.min(100, selected.quality + 5),
      sections: improvedSections,
    };

    setPrompts((prev) => prev.map((p) => (p.id === selected.id ? updated : p)));
    setSelected(updated);
  };

  const handleExport = () => {
    if (!selected) return;

    let fileContent: string;
    if (selected.status === "improved") {
      const sections = sectionLabels
        .map(({ key, label }) => `## ${label}\n${selected.sections[key]}`)
        .join("\n\n");
      fileContent = `# ${selected.name}\n\n${sections}`;
    } else {
      fileContent = `# ${selected.name}\n\n${(selected as Prompt).content || selected.preview}`;
    }

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(selected.name);
    setTimeout(() => setExported(null), 2500);
  };

  const handleDelete = () => {
    if (!selected) return;
    setPrompts((prev) => prev.filter((p) => p.id !== selected.id));
    setSelected(null);
  };

  return (
    <div className="p-8 max-w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Prompts</h1>
          <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} in your library
          </p>
        </div>
        <div className="flex items-center gap-3">
          {exported && (
            <div
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
            >
              Exportado: {exported}
            </div>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-black transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6.5" y1="1" x2="6.5" y2="12" />
              <line x1="1" y1="6.5" x2="12" y2="6.5" />
            </svg>
            Nuevo Prompt
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* List */}
        <div className="flex-1 flex flex-col gap-3">
          {prompts.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p className="font-semibold" style={{ color: "#6b6b8a" }}>
                No hay prompts en la biblioteca
              </p>
            </div>
          ) : (
            prompts.map((prompt) => (
              <PromptRow
                key={prompt.id}
                prompt={prompt}
                isSelected={selected?.id === prompt.id}
                onClick={() => setSelected(selected?.id === prompt.id ? null : prompt)}
              />
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div
          className="rounded-2xl sticky top-8 overflow-hidden"
          style={{
            width: "370px",
            minWidth: "370px",
            height: "calc(100vh - 64px)",
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {selected ? (
            <PromptDetail
              prompt={selected}
              onImprove={handleImprove}
              onExport={handleExport}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyDetail />
          )}
        </div>
      </div>

      {showCreate && (
        <CreateModal
          type="prompt"
          onClose={() => setShowCreate(false)}
          onSave={(entity) => {
            const p = entity as Prompt;
            setPrompts((prev) => [p, ...prev]);
          }}
        />
      )}
    </div>
  );
}
