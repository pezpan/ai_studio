import {
  mockPrompts,
  mockSkills,
  mockMcpServers,
  mockWorkflows,
  mockContextPacks,
  mockStats,
} from "./mock-data";

const BASE_URL = "http://localhost:8080";
const USE_MOCK = true; // Set to false to connect to real API

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Stats
export async function getStats() {
  if (USE_MOCK) return mockStats;
  return fetchApi<typeof mockStats>("/api/stats");
}

// Prompts
export async function getPrompts() {
  if (USE_MOCK) return mockPrompts;
  return fetchApi<typeof mockPrompts>("/api/prompts");
}

export async function getPromptById(id: string) {
  if (USE_MOCK) return mockPrompts.find((p) => p.id === id) ?? null;
  return fetchApi<(typeof mockPrompts)[0]>(`/api/prompts/${id}`);
}

export async function improvePrompt(id: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true, message: "Prompt improved successfully" };
  }
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
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    return {
      id: Date.now().toString(),
      ...input,
      status: "pending",
      quality: 70,
      preview: input.content.slice(0, 160) || input.name,
      sections: { rol: "", tarea: "", audiencia: "", formato: "", contexto: "" },
    };
  }
  return fetchApi<{
    id: string;
    name: string;
    content: string;
    category: string;
    status: string;
    quality: number;
    preview: string;
    sections: Record<string, string>;
  }>("/api/prompts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deletePrompt(id: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  }
  return fetchApi<{ success: boolean }>(`/api/prompts/${id}`, {
    method: "DELETE",
  });
}

// Skills
export async function getSkills() {
  if (USE_MOCK) return mockSkills;
  return fetchApi<typeof mockSkills>("/api/skills");
}

export interface BuildSkillInput {
  objective: string;
  audience: string;
  category: string;
  outputFormat: string;
  save: boolean;
}

export async function buildSkill(input: BuildSkillInput) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2400));
    const name = input.objective
      .toLowerCase()
      .replace(/\s+/g, "_")
      .slice(0, 20);
    return {
      name,
      parameters: ["{{INPUT}}", "{{CONTEXT}}", "{{AUDIENCE}}"],
      template: `You are an expert assistant specializing in ${input.category}.\n\nTask: ${input.objective}\n\nAudience: {{AUDIENCE}}\n\nContext: {{CONTEXT}}\n\nInput: {{INPUT}}\n\nOutput format: ${input.outputFormat}\n\nProvide a thorough, accurate response tailored to the specified audience. Be concise yet comprehensive. Use structured formatting when appropriate.`,
      quality: Math.floor(Math.random() * 15) + 80,
    };
  }
  return fetchApi<{
    name: string;
    parameters: string[];
    template: string;
    quality: number;
  }>("/api/skills/build", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Workflows
export async function getWorkflows() {
  if (USE_MOCK) return mockWorkflows;
  return fetchApi<typeof mockWorkflows>("/api/workflows");
}

export async function executeWorkflow(id: string, input: string) {
  if (USE_MOCK) {
    const workflow = mockWorkflows.find((w) => w.id === id);
    if (!workflow) throw new Error("Workflow not found");
    const results: string[] = [];
    for (let i = 0; i < workflow.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      results.push(
        `Step ${i + 1} (${workflow.steps[i].name}) completed successfully.\n\nProcessed input through ${workflow.steps[i].type} operation. Output contains structured analysis with ${Math.floor(Math.random() * 200 + 100)} tokens generated.`
      );
    }
    return {
      results,
      totalTime: (workflow.steps.length * 1.5 + Math.random()).toFixed(1),
      totalTokens: Math.floor(Math.random() * 1000 + 500),
    };
  }
  return fetchApi<{
    results: string[];
    totalTime: string;
    totalTokens: number;
  }>(`/api/workflows/${id}/execute`, {
    method: "POST",
    body: JSON.stringify({ input }),
  });
}

// MCP Servers
export async function getMcpServers() {
  if (USE_MOCK) return mockMcpServers;
  return fetchApi<typeof mockMcpServers>("/api/mcp");
}

export async function testMcpServer(id: string) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, latency: Math.floor(Math.random() * 50 + 10) };
  }
  return fetchApi<{ success: boolean; latency: number }>(
    `/api/mcp/${id}/test`,
    { method: "POST" }
  );
}

// Context Packs
export async function getContextPacks() {
  if (USE_MOCK) return mockContextPacks;
  return fetchApi<typeof mockContextPacks>("/api/context-packs");
}
