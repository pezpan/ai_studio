"use client";

import { useState } from "react";
import { buildSkill, createSkill } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SkillResult {
  id?: number | string;
  name: string;
  parameters?: string[];
  template: string;
  quality: number;
  description?: string;
  category?: string;
  isSaved?: boolean;
}

export function SkillBuilderContent() {
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [category, setCategory] = useState("development");
  const [outputFormat, setOutputFormat] = useState("");
  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillResult | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!objective.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await buildSkill({ objective, audience, category, outputFormat, save });
      
      const newResult = {
        ...res,
        description: `Skill generated for: ${objective}`,
        category: category,
        // Almacenamos si ya se guardó en la base de datos
        isSaved: save || !!res.savedSkillId,
        id: res.savedSkillId
      };
      
      setResult(newResult);
      
      if (save || res.savedSkillId) {
        toast({
          title: "Skill guardada",
          description: "La skill se ha generado y guardado en el catálogo.",
        });
      }
    } catch (error) {
      console.error("Error generating skill:", error);
      toast({
        title: "Error al generar",
        description: "No se pudo generar la skill. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCatalog = async (skillData?: SkillResult) => {
    const dataToSave = skillData || result;
    console.log("=== handleSaveToCatalog called with:", dataToSave);
    if (!dataToSave) {
      console.error("=== No data to save!");
      return;
    }

    if (dataToSave.isSaved) {
      toast({
        title: "Ya guardada",
        description: "Esta skill ya ha sido guardada en el catálogo.",
      });
      return;
    }

    if (!dataToSave.name || !dataToSave.template) {
      console.error("=== Missing required fields:", { name: dataToSave.name, template: dataToSave.template });
      toast({
        title: "Error al guardar",
        description: "La skill generada no tiene los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log("=== Calling createSkill with:", {
        name: dataToSave.name,
        description: dataToSave.description || `Skill: ${dataToSave.name}`,
        template: dataToSave.template,
        category: dataToSave.category || category,
        parameters: dataToSave.parameters || [],
      });
      await createSkill({
        name: dataToSave.name,
        description: dataToSave.description || `Skill: ${dataToSave.name}`,
        template: dataToSave.template,
        category: dataToSave.category || category,
        parameters: dataToSave.parameters || [],
      });
      
      console.log("=== Skill saved successfully!");
      if (result && !skillData) {
        setResult({ ...result, isSaved: true });
      }
      toast({
        title: "Skill guardada",
        description: "La skill se ha guardado en el catálogo.",
      });
    } catch (error) {
      console.error("=== Error saving skill:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la skill. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
    marginBottom: "6px",
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  } as React.CSSProperties;

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "#e8e8f0" }}>
            Skill Builder <span style={{ color: "#6366f1" }}>AI</span>
          </h1>
          <p className="text-sm font-medium" style={{ color: "#6b6b8a" }}>
            Genera habilidades complejas para tu IA usando lenguaje natural.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Config Panel */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label style={labelStyle}>¿Qué quieres que haga la skill?</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "none" }}
                  placeholder="Ej: Revisión de seguridad de código, redactor de hilos de twitter..."
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Audiencia Objetivo</label>
                  <input
                    style={inputStyle}
                    placeholder="Ej: Programadores Senior"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select
                    style={inputStyle}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="development">Development</option>
                    <option value="marketing">Marketing</option>
                    <option value="security">Security</option>
                    <option value="business">Business</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Formato de Salida Deseado</label>
                <input
                  style={inputStyle}
                  placeholder="Ej: Reporte técnico en Markdown"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="save-to-db"
                  checked={save}
                  onChange={(e) => setSave(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label htmlFor="save-to-db" className="text-sm font-medium cursor-pointer" style={{ color: "#a8a8c0" }}>
                  Guardar automáticamente en el catálogo
                </label>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !objective.trim()}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/10"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                color: "white",
              }}
            >
              {loading ? (
                <>
                  <span
                    className="rounded-full animate-spin"
                    style={{
                      width: "20px",
                      height: "20px",
                      borderWidth: "2px",
                      borderStyle: "solid",
                      borderColor: "rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                    }}
                  />
                  Procesando con IA...
                </>
              ) : (
                <>
                  ✨ Generar Skill con IA
                </>
              )}
            </button>
          </div>

          {/* Result Panel */}
          {result ? (
            <div
              className="rounded-3xl p-8 flex flex-col space-y-6 border animate-in fade-in slide-in-from-right-4 duration-500"
              style={{
                background: "rgba(18,18,26,0.5)",
                borderColor: "rgba(255,255,255,0.05)",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
              }}
            >
              {/* Skill Name */}
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
                  {result.parameters && result.parameters.length > 0 ? (
                    result.parameters.map((param) => (
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
                    ))
                  ) : (
                    <span className="font-mono text-xs" style={{ color: "#6b6b8a" }}>
                      No parameters detected
                    </span>
                  )}
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
                  onClick={() => handleSaveToCatalog()}
                  disabled={saving || result.isSaved}
                  className="py-2 px-4 rounded-xl text-sm font-bold transition-all duration-150 hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                  style={{
                    background: result.isSaved 
                      ? "rgba(34,197,94,0.1)" 
                      : "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: result.isSaved ? "#22c55e" : "white",
                    border: result.isSaved ? "1px solid rgba(34,197,94,0.2)" : "none",
                  }}
                >
                  {saving ? (
                    <>
                      <span
                        className="rounded-full animate-spin"
                        style={{
                          width: "16px",
                          height: "16px",
                          borderWidth: "2px",
                          borderStyle: "solid",
                          borderColor: "rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                        }}
                      />
                      Guardando...
                    </>
                  ) : result.isSaved ? (
                    "Guardada"
                  ) : (
                    "Guardar en el catálogo"
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
