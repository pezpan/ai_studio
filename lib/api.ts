import {
  mockPrompts,
  mockSkills,
  mockMcpServers,
  mockWorkflows,
  mockContextPacks,
  mockStats,
} from "./mock-data";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").trim().replace(/\/$/, "");
const USE_MOCK = false; // Set to false to connect to real API

if (typeof window !== 'undefined') {
  console.log(`[API Service] Base URL: ${BASE_URL} (Mocks: ${USE_MOCK})`);
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options?.headers,
      },
      cache: 'no-store',
    });

    const text = await res.text();
    
    // Debug logging for specific paths
    if (path.includes("/improve") || path.includes("/prompts/")) {
      console.log(`[API Debug] Response from ${path}: ${text.slice(0, 300)}...`);
    }

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      // Use warn instead of error to avoid triggering devtools overlays
      console.warn(`[API] ${res.status} at ${url}. Body: ${errorBody.slice(0, 500)}`);
      throw new Error(`API error: ${res.status} at ${path}`);
    }

    try {
      return text ? JSON.parse(text) : {} as T;
    } catch (e) {
      return {} as T;
    }
  } catch (error) {
    throw error;
  }
}

// Stats
export async function getStats() {
  if (USE_MOCK) return mockStats;
  try {
    // Try /api/stats/global which exists in the backend
    const data = await fetchApi<any>("/api/stats/global");
    return {
      prompts: data?.totalPrompts ?? data?.prompts ?? 0,
      skills: data?.totalSkills ?? data?.skills ?? 0,
      mcpServers: data?.totalMcpServers ?? data?.totalMcpServersCount ?? 0,
      workflows: data?.totalWorkflows ?? 0,
    };
  } catch (error) {
    // Silent fallback to mock data
    return mockStats;
  }
}

export async function getTopSkills() {
  if (USE_MOCK) return mockSkills.slice(0, 5);
  try {
    // Try /api/stats/ai for popular skills
    const data = await fetchApi<any>("/api/stats/ai");
    const list = Array.isArray(data?.popularSkills) ? data.popularSkills : [];
    return list;
  } catch (error) {
    return [];
  }
}

export async function getRecentActivity() {
  if (USE_MOCK) return [];
  try {
    const data = await fetchApi<any>("/api/stats/recent-activity");
    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    return list;
  } catch (error) {
    return [];
  }
}

function parseSections(content: string) {
  if (!content) return null;

  const sections = {
    rol: "",
    tarea: "",
    audiencia: "",
    formato: "",
    contexto: "",
  };

  // 1. Try to find explicit tags like [ROL], [TAREA], etc.
  // We use a more permissive regex that allows for spaces inside brackets and case insensitivity
  const tags = ["ROL", "TAREA", "AUDIENCIA", "FORMATO", "CONTEXTO"];
  const tagIndices: { tag: string; index: number }[] = [];

  tags.forEach(tag => {
    // Search for [TAG] or [TAG/DETAILS] or similar
    const regex = new RegExp(`\\[\\s*${tag}[^\\]]*\\]`, "gi");
    let match;
    while ((match = regex.exec(content)) !== null) {
      tagIndices.push({ tag, index: match.index });
    }
  });

  // Sort indices to know where each section starts and ends
  tagIndices.sort((a, b) => a.index - b.index);

  if (tagIndices.length > 0) {
    tagIndices.forEach((match, i) => {
      const nextMatch = tagIndices[i + 1];
      const startTagMatch = content.slice(match.index).match(/\]/);
      if (!startTagMatch) return;

      const contentStart = match.index + (startTagMatch.index || 0) + 1;
      const contentEnd = nextMatch ? nextMatch.index : content.length;

      const sectionContent = content.slice(contentStart, contentEnd).trim();
      if (sectionContent) {
        // Map uppercase tag to lowercase key
        const tag = match.tag.toUpperCase().split('/')[0]; // Handle "CONTEXTO/DETALLES"
        if (tag === 'CONTEXTO') {
          sections.contexto = sectionContent;
        } else if (tag === 'ROL') {
          sections.rol = sectionContent;
        } else if (tag === 'TAREA') {
          sections.tarea = sectionContent;
        } else if (tag === 'AUDIENCIA') {
          sections.audiencia = sectionContent;
        } else if (tag === 'FORMATO') {
          sections.formato = sectionContent;
        }
      }
    });
    return sections;
  }

  // 2. Fallback: If no tags found but content looks like it might have headers without brackets
  // (Optional: implement if needed, but for now we trust the backend tags)
  
  return null;
}

// Prompts
export async function getPrompts(category?: string) {
  if (USE_MOCK) {
    return mockPrompts.map(p => ({
      ...p,
      sections: p.sections ? {
        ROL: p.sections.rol,
        TAREA: p.sections.tarea,
        AUDIENCIA: p.sections.audiencia,
        FORMATO: p.sections.formato,
        CONTEXTO: p.sections.contexto,
      } : null
    }));
  }
  try {
    const query = category ? `?category=${category}` : "";
    const data = await fetchApi<any>(`/api/prompts${query}`);
    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    
    return list.map((p: any) => {
      const parsedSections = parseSections(p.content || "");
      const hasSections = !!parsedSections;
      const hasLastImprovedAt = p.lastImprovedAt !== null && p.lastImprovedAt !== undefined;
      const isImproved = hasLastImprovedAt || hasSections;
      
      // Debug logging
      console.log(`[Prompts API] Prompt: ${p.title}, lastImprovedAt: ${p.lastImprovedAt}, hasSections: ${hasSections}, status: ${isImproved ? "improved" : "pending"}, qualityScore: ${p.qualityScore}`);
      if (parsedSections) {
        console.log(`[Prompts API] Sections parsed:`, parsedSections);
      }
      
      const mapped = {
        ...p,
        name: p.title || p.name,
        preview: p.description || p.preview || (p.content ? p.content.slice(0, 160) : ""),
        quality: p.qualityScore ?? 50,  // Usar qualityScore del backend, default 50
        status: isImproved ? "improved" : "pending",
        sections: parsedSections || { rol: "", tarea: "", audiencia: "", formato: "", contexto: "" }
      };
      return mapped;
    });
  } catch (error) {
    return [];
  }
}

export async function getPromptById(id: string | number) {
  if (USE_MOCK) {
    const p = mockPrompts.find((p) => p.id === String(id)) ?? null;
    if (!p) return null;
    return {
      ...p,
      status: p.status || "pending",
      quality: p.quality ?? 70,
      sections: p.sections || { rol: "", tarea: "", audiencia: "", formato: "", contexto: "" }
    };
  }
  try {
    const p = await fetchApi<any>(`/api/prompts/${id}`);
    if (!p) return null;
    const parsedSections = parseSections(p.content || "");
    const hasSections = !!parsedSections;
    const hasLastImprovedAt = p.lastImprovedAt !== null && p.lastImprovedAt !== undefined;
    const isImproved = hasLastImprovedAt || hasSections;
    return {
      ...p,
      name: p.title || p.name,
      quality: p.qualityScore ?? 50,  // Usar qualityScore del backend, default 50
      status: isImproved ? "improved" : "pending",
      sections: parsedSections || { rol: "", tarea: "", audiencia: "", formato: "", contexto: "" }
    };
  } catch (error) {
    return null;
  }
}

export async function improvePrompt(id: string | number) {
  return fetchApi<{ success: boolean; message: string }>(
    `/api/prompts/${id}/improve`,
    { method: "POST" }
  );
}

export interface CreatePromptInput {
  name: string;
  content: string;
  category: string;
}

export async function createPrompt(input: CreatePromptInput) {
  return fetchApi<any>("/api/prompts", {
    method: "POST",
    body: JSON.stringify({
      title: input.name,
      content: input.content,
      category: input.category
    }),
  });
}

export async function updatePrompt(id: string | number, input: Partial<CreatePromptInput>) {
  return fetchApi<any>(`/api/prompts/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: input.name,
      content: input.content,
      category: input.category
    }),
  });
}

export async function deletePrompt(id: string | number) {
  return fetchApi<{ success: boolean }>(`/api/prompts/${id}`, {
    method: "DELETE",
  });
}

export async function exportPrompt(id: string | number) {
  if (USE_MOCK) return { content: "Mock export content" };
  try {
    // El backend devuelve un string plano, no JSON
    const response = await fetch(`${BASE_URL}/api/prompts/${id}/export`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    const content = await response.text();
    return { content };
  } catch (error) {
    console.error("Failed to export prompt:", error);
    return { content: "" };
  }
}

// Skills
export async function getSkills(category?: string) {
  if (USE_MOCK) return mockSkills;
  try {
    const query = category ? `?category=${category}` : "";
    const data = await fetchApi<any>(`/api/skills${query}`);
    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    
    return list.map((s: any) => ({
      ...s,
      template: s.promptTemplate || s.template,
      usageCount: s.usageCount ?? 0,
      qualityScore: s.qualityScore ?? 85,
      parameters: Array.isArray(s.parameters) ? s.parameters.map((p: any) => p.name || p) : []
    }));
  } catch (error) {
    return [];
  }
}

export async function getSkillById(id: string | number) {
  try {
    const s = await fetchApi<any>(`/api/skills/${id}`);
    if (!s) return null;
    return {
      ...s,
      template: s.promptTemplate || s.template,
      usageCount: s.usageCount ?? 0,
      qualityScore: s.qualityScore ?? 85,
      parameters: Array.isArray(s.parameters) ? s.parameters.map((p: any) => p.name || p) : []
    };
  } catch (error) {
    return null;
  }
}

export async function createSkill(input: any) {
  return fetchApi<any>("/api/skills", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface BuildSkillInput {
  objective: string;
  audience: string;
  category: string;
  outputFormat: string;
  save: boolean;
}

export async function buildSkill(input: BuildSkillInput) {
  const data = await fetchApi<{
    name: string;
    parameters: string[];
    template: string;
    qualityScore: number;
  }>("/api/skills/build", {
    method: "POST",
    body: JSON.stringify({
      objective: input.objective,
      targetAudience: input.audience,
      category: input.category,
      desiredOutputFormat: input.outputFormat,
      saveToDatabase: input.save,
    }),
  });
  
  return {
    ...data,
    quality: data.qualityScore
  };
}

export async function deleteSkill(id: string | number) {
  return fetchApi<{ success: boolean }>(`/api/skills/${id}`, {
    method: "DELETE",
  });
}

// Workflows
export async function getWorkflows(category?: string) {
  if (USE_MOCK) return mockWorkflows;
  try {
    const query = category ? `?category=${category}` : "";
    const data = await fetchApi<any>(`/api/workflows${query}`);
    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    
    return list.map((w: any) => ({
      ...w,
      steps: w.steps || (w.stepNames ? w.stepNames.map((name: string, i: number) => ({
        id: `s${i}`,
        name,
        stepOrder: i + 1,
        type: 'SKILL'
      })) : []),
      executionCount: w.usageCount ?? w.executionCount ?? 0
    }));
  } catch (error) {
    return [];
  }
}

export async function getWorkflowById(id: string | number) {
  try {
    const w = await fetchApi<any>(`/api/workflows/${id}`);
    if (!w) return null;
    return {
      ...w,
      steps: w.steps || (w.stepNames ? w.stepNames.map((name: string, i: number) => ({
        id: `s${i}`,
        name,
        stepOrder: i + 1,
        type: 'SKILL'
      })) : []),
      executionCount: w.usageCount ?? w.executionCount ?? 0
    };
  } catch (error) {
    return null;
  }
}

export async function createWorkflow(input: any) {
  return fetchApi<any>("/api/workflows", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function executeWorkflow(id: string | number, initialInput: string, additionalContext?: string) {
  return fetchApi<any>(`/api/workflows/${id}/execute`, {
    method: "POST",
    body: JSON.stringify({ initialInput, additionalContext }),
  });
}

// MCP Servers
export async function getMcpServers(category?: string) {
  if (USE_MOCK) return mockMcpServers;
  try {
    const query = category ? `?category=${category}` : "";
    const data = await fetchApi<any>(`/api/mcp-servers${query}`);
    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    
    return list.map((s: any) => ({
      ...s,
      validationStatus: s.validationStatus || (s.verified ? 'OK' : 'WARNING'),
      issues: s.issues || []
    }));
  } catch (error) {
    return [];
  }
}

export async function createMcpServer(input: any) {
  return fetchApi<any>("/api/mcp-servers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function testMcpServer(id: string | number) {
  return fetchApi<any>(
    `/api/mcp-servers/${id}/test?level=CONNECTIVITY`,
    { method: "POST" }
  );
}

// Context Packs
export async function getContextPacks(category?: string) {
  if (USE_MOCK) return mockContextPacks;
  try {
    const query = category ? `?category=${category}` : "";
    const data = await fetchApi<any>(`/api/context-packs${query}`);
    const list = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
    
    return list.map((pack: any) => ({
      ...pack,
      resources: pack.resources || {
        prompts: pack.promptCount ?? 0,
        skills: pack.skillCount ?? 0,
        mcps: pack.mcpServerCount ?? 0
      }
    }));
  } catch (error) {
    return [];
  }
}

export async function createContextPack(input: any) {
  return fetchApi<any>("/api/context-packs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
