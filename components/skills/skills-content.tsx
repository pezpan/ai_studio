"use client";

import { useState, useEffect, useCallback } from "react";
import { getSkills, deleteSkill } from "@/lib/api";
import { AiBadge, categoryVariant } from "@/components/ui/ai-badge";
import { CreateModal } from "@/components/create-modal";
import { useToast } from "@/hooks/use-toast";

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

  // Reemplazar parámetros en tiempo real.
  const resolvedTemplate = (skill.parameters || []).reduce((tpl, param) => {
    if (!tpl) return "";
    const key = param.replace(/[{}]/g, "");
    const value = values[key];
    
    // Reemplazamos todas las ocurrencias de {{KEY}}
    // Usamos split/join para evitar problemas con caracteres especiales en regex
    const placeholder = `{{${key}}}`;
    let newTpl = tpl.split(placeholder).join(value !== undefined && value !== "" ? value : placeholder);
    
    // Si el template no usa {{}} pero el parámetro coincide con una palabra exacta
    if (newTpl === tpl && !param.includes("{")) {
      newTpl = tpl.split(param).join(value !== undefined && value !== "" ? value : param);
    }
    
    return newTpl;
  }, skill.template || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />
      <div
        className="relative rounded-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          maxWidth: "700px",
          maxHeight: "90vh",
          background: "#0a0a0f",
          border: "1px solid rgba(99,102,241,0.3)",
          boxShadow: "0 0 40px rgba(99,102,241,0.15), 0 24px 64px rgba(0,0,0,0.8)",
          zIndex: 101,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: "#6366f1" }}>
              Ejecutar Skill
            </p>
            <h2 className="text-xl font-black text-white tracking-tight">{skill.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8 custom-scrollbar">
          {/* Parameters Section */}
          {(skill.parameters || []).length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Variables de Entrada
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-indigo-500/50 to-transparent"></div>
              </div>
              
              <div className="grid gap-5">
                {skill.parameters.map((param) => {
                  const key = param.replace(/[{}]/g, "");
                  return (
                    <div key={param} className="group">
                      <label className="block text-[11px] font-bold mb-2 uppercase tracking-wider text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                        {key}
                      </label>
                      <textarea
                        value={values[key] ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder={`Introduce el valor para ${key}...`}
                        rows={2}
                        className="w-full rounded-xl text-sm outline-none px-4 py-3 transition-all resize-none"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#e8e8f0",
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Result Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Vista Previa del Prompt
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent"></div>
              </div>
            </div>
            
            <div
              className="relative rounded-2xl overflow-hidden group/preview"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
              }}
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                 <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                  title="Copiar prompt"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <pre
                  className="font-mono text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ color: "#a5b4fc" }}
                >
                  {resolvedTemplate || <span className="italic text-slate-600">No hay contenido definido.</span>}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-5 flex items-center justify-end gap-3 border-t flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        >
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl text-sm font-bold transition-all hover:bg-white/10 text-slate-400 hover:text-white"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCopy}
            disabled={!resolvedTemplate}
            className="flex items-center gap-2 py-2.5 px-8 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            style={{ 
              background: copied 
                ? "#10b981" 
                : "linear-gradient(135deg, #6366f1, #a855f7)", 
              color: "white",
              boxShadow: copied ? "0 0 20px rgba(16,185,129,0.3)" : "0 10px 20px -5px rgba(99,102,241,0.4)"
            }}
          >
            {copied ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                ¡Copiado!
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copiar Prompt Final
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SkillCard                                                           */
/* ------------------------------------------------------------------ */

function SkillCard({ skill, onDelete }: { skill: Skill; onDelete?: (id: number | string) => void }) {
  const [hovered, setHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-150 h-full"
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
          <p className="font-mono text-sm font-bold truncate pr-2" style={{ color: "#e8e8f0" }} title={skill.name}>
            {skill.name}
          </p>
          <AiBadge variant={categoryVariant(skill.category)}>{skill.category}</AiBadge>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#6b6b8a" }}>
          {skill.description}
        </p>

        {/* Parameters */}
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-[60px]">
          {skill.parameters && skill.parameters.length > 0 ? (
            skill.parameters.map((param) => (
              <span
                key={param}
                className="font-mono text-[10px] px-2 py-0.5 rounded-lg"
                style={{
                  background: "rgba(6,182,212,0.08)",
                  color: "#22d3ee",
                  border: "1px solid rgba(6,182,212,0.15)",
                }}
              >
                {param}
              </span>
            ))
          ) : (
            <span className="font-mono text-[10px]" style={{ color: "#ef4444" }}>
              Sin parámetros
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="font-mono text-[10px] font-bold" style={{ color: "#3d3d55" }}>
            {skill.usageCount?.toLocaleString() || 0} usos
          </span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(skill.id);
                }}
                className="text-xs font-bold p-1.5 rounded-lg transition-all hover:bg-red-500/20 group"
                style={{
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
                title="Eliminar skill"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-150 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "white",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Usar
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <UseSkillModal skill={skill} onClose={() => setIsModalOpen(false)} />
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Fetch skills from backend
  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkills(data);
      setLastUpdated(new Date());
      console.log(`[Skills] Updated: ${data.length} skills loaded`);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      toast({
        title: "Error al cargar skills",
        description: "No se pudieron cargar las skills. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Listen for skills created in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'skill-created') {
        console.log("[Skills] Skill created event detected, refreshing...");
        fetchSkills();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchSkills]);

  const handleDelete = async (skillId: number | string) => {
    if (!confirm(`¿Eliminar skill? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await deleteSkill(skillId);
      await fetchSkills();
      toast({
        title: "Skill eliminada",
        description: "La skill se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la skill.",
        variant: "destructive",
      });
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
          {lastUpdated && (
            <p className="text-xs font-mono mt-1" style={{ color: "#3d3d55" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            fetchSkills();
            toast({
              title: "Skills actualizadas",
              description: `Refreshed at ${new Date().toLocaleTimeString()}`,
            });
          }}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all hover:brightness-110 mr-3"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#c8c8e0",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 8a6 6 0 1 1-1.7-4.2M14 2v6h-6" />
          </svg>
          Refresh
        </button>
        <button
          onClick={() => {
            if (confirm("¿Reiniciar backend? Esto eliminará todas las skills creadas manualmente y recargará las skills por defecto.")) {
              window.location.href = "http://localhost:8080/h2-console";
            }
          }}
          className="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all hover:brightness-110 mr-3"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
          }}
          title="Abre H2 Console para eliminar skills"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2h12v12H2z" />
            <path d="M8 4v8M4 8h8" />
          </svg>
          DB Console
        </button>
        <button
          onClick={() => {
            setShowCreate(true);
            // Trigger refresh after modal closes
            setTimeout(() => fetchSkills(), 100);
          }}
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

      {loading && skills.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : skills.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p className="font-semibold" style={{ color: "#6b6b8a" }}>
            No hay skills en la biblioteca
          </p>
          <p className="text-sm mt-2" style={{ color: "#3d3d55" }}>
            Crea tu primera skill para comenzar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal
          type="skill"
          onClose={() => setShowCreate(false)}
          onSave={() => {
            // Notify other tabs
            localStorage.setItem('skill-created', Date.now().toString());
            localStorage.removeItem('skill-created');
            
            // Refresh immediately
            fetchSkills();
            setShowCreate(false);
            
            toast({
              title: "Skill creada",
              description: "La skill se ha creado correctamente.",
            });
          }}
        />
      )}
    </div>
  );
}
