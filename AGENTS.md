# AGENTS.md — AI Studio Frontend

Este archivo proporciona contexto completo a cualquier herramienta de IA (V0, Copilot,
Gemini CLI, Claude, Cursor) que trabaje sobre este proyecto. Léelo antes de hacer
cualquier cambio.

---

## Qué es este proyecto

**AI Studio** es el frontend de **PromptVault**, una API REST de gestión de recursos de
inteligencia artificial. El backend está desarrollado en Java 17 con Spring Boot 3.2 y
corre en `http://localhost:8080`. El frontend usa Next.js 14 con App Router, TypeScript
y Tailwind CSS con shadcn/ui.

---

## Regla fundamental — NO uses mocks en código nuevo

`src/lib/api.ts` contiene todas las funciones de conexión al backend.
La variable `USE_MOCK` en ese archivo controla si se usan datos simulados o la API real.

**Cuando generes código nuevo o modifiques componentes existentes:**
- Importa siempre las funciones desde `src/lib/api.ts` — nunca escribas fetch() directo
- Nunca crees arrays de datos hardcodeados en los componentes
- Nunca importes desde `src/lib/mock-data.ts` en componentes nuevos
- Si necesitas llamar a un endpoint que no existe en `api.ts`, dímelo — no lo inventes

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 con App Router |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado servidor | TanStack Query (React Query) |
| Fuentes | Nunito (UI) + Space Mono (datos técnicos) |
| Tema | Dark — fondo #0a0a0f, cards #12121a, acento indigo #6366f1 |

---

## Estructura del proyecto

```
src/
├── app/                    # Páginas Next.js App Router
│   ├── dashboard/
│   ├── prompts/
│   ├── skills/
│   ├── workflows/
│   ├── mcp-registry/        # Registro de MCP servers
│   ├── context-packs/
│   └── skill-builder/
├── components/
│   ├── ui/                 # Componentes shadcn/ui base
│   ├── layout/             # Sidebar, Topbar
│   └── [feature]/          # Componentes por sección
├── lib/
│   ├── api.ts              # ← TODAS las llamadas al backend van aquí
│   └── mock-data.ts        # Solo para USE_MOCK=true, no importar en componentes
└── types/
    └── index.ts            # Tipos TypeScript del dominio
```

---

## API del backend — URL base: http://localhost:8080

Usa siempre `process.env.NEXT_PUBLIC_API_URL` como base, no hardcodees la URL.

### Estadísticas
```
GET  /api/stats/global            → { totalPrompts, totalSkills, totalMcpServers, totalWorkflows }
GET  /api/stats/ai                → { popularSkills: [{ name, usageCount, qualityScore }] }
GET  /api/stats/recent-activity   → [{ type, description, timestamp }]
```

### Prompts
```
GET    /api/prompts                → lista de prompts (query: ?category=)
GET    /api/prompts/{id}           → prompt completo con secciones ROL/TAREA/AUDIENCIA/FORMATO/CONTEXTO
POST   /api/prompts                → { title, content, category }
PUT    /api/prompts/{id}           → { name?, content?, category? }
DELETE /api/prompts/{id}
POST   /api/prompts/{id}/improve   → llama a Groq para mejorar el prompt con IA
GET    /api/prompts/{id}/export    → { content: string }
```

### Skills
```
GET    /api/skills                 → lista (query: ?category=)
GET    /api/skills/{id}            → skill completa
POST   /api/skills                 → crear skill
POST   /api/skills/build           → genera skill con IA (Skill Builder)
DELETE /api/skills/{id}
```

Body de `/api/skills/build`:
```json
{
  "objective": "string",
  "targetAudience": "string",
  "category": "string",
  "desiredOutputFormat": "string",
  "saveToDatabase": true
}
```

### Workflows
```
GET    /api/workflows              → lista (query: ?category=)
GET    /api/workflows/{id}         → workflow con pasos y resultados de última ejecución
POST   /api/workflows              → crear workflow
POST   /api/workflows/{id}/execute → { initialInput: string, additionalContext?: string }
DELETE /api/workflows/{id}
```

La respuesta de `/execute` devuelve:
```json
{
  "workflowId": 1,
  "success": true,
  "finalOutput": "string",
  "stepResults": [
    {
      "stepOrder": 1,
      "stepName": "string",
      "stepType": "SKILL | FREE_PROMPT | TRANSFORM",
      "input": "string",
      "output": "string",
      "executionTimeMs": 1200,
      "success": true,
      "errorMessage": null
    }
  ],
  "totalSteps": 3,
  "completedSteps": 3,
  "totalExecutionTimeMs": 4200,
  "totalTokensUsed": 2100,
  "executedAt": "2024-01-01T00:00:00Z"
}
```

### MCP Servers
```
GET    /api/mcp-servers            → lista (query: ?category=)
GET    /api/mcp-servers/{id}       → servidor con configJson completo
POST   /api/mcp-servers            → crear servidor
POST   /api/mcp-servers/{id}/test  → ?level=STATIC | CONNECTIVITY
POST   /api/mcp-servers/test-all   → ?level=STATIC | CONNECTIVITY
POST   /api/mcp-servers/test-config → { configJson: string, level: string }
DELETE /api/mcp-servers/{id}
```

Nota: la ruta es `/api/mcp-servers`, NO `/api/mcp`.

La respuesta de `/test` devuelve:
```json
{
  "valid": true,
  "status": "OK | WARNING | ERROR",
  "issues": [{ "severity": "WARNING", "field": "env.TOKEN", "message": "string", "suggestion": "string" }],
  "testedAt": "2024-01-01T00:00:00Z"
}
```

### Context Packs
```
GET    /api/context-packs          → lista (query: ?category=)
GET    /api/context-packs/{id}     → pack con generatedMcpConfig (JSON string para copiar)
GET    /api/context-packs/popular  → top 5 más usados
DELETE /api/context-packs/{id}
```

---

## Cómo llamar a la API desde un componente

Siempre usa las funciones de `src/lib/api.ts`. Ejemplo correcto:

```tsx
// ✅ CORRECTO
import { getPrompts } from '@/lib/api';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    getPrompts().then(setPrompts).catch(console.error);
  }, []);
}
```

```tsx
// ❌ INCORRECTO — nunca hagas esto en componentes nuevos
const prompts = [
  { id: 1, name: "Mock Prompt", ... },  // datos hardcodeados
];

// ❌ INCORRECTO — nunca importes mock-data directamente
import { mockPrompts } from '@/lib/mock-data';
```

---

## Tipos principales del dominio

```typescript
// Prompt con sus 5 secciones estructuradas
interface Prompt {
  id: number;
  name: string;
  content: string;
  category: string;
  improved: boolean;
  qualityScore: number;
  sections?: {
    ROL: string;
    TAREA: string;
    AUDIENCIA: string;
    FORMATO: string;
    CONTEXTO: string;
  };
}

// Skill parametrizable
interface Skill {
  id: number;
  name: string;
  description: string;
  template: string;           // contiene marcadores {{PARAM}}
  category: string;
  parameters: string[];       // lista de nombres de parámetros sin {{ }}
  usageCount: number;
  qualityScore: number;
}

// Workflow con pasos encadenados
interface Workflow {
  id: number;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  executionCount: number;
}

interface WorkflowStep {
  id: number;
  stepOrder: number;
  name: string;
  type: 'SKILL' | 'FREE_PROMPT' | 'TRANSFORM';
  skillId?: number;
  skillName?: string;
  transformType?: string;
  promptTemplate?: string;
}

// Servidor MCP
interface McpServer {
  id: number;
  name: string;
  description: string;
  command: string;
  args: string[];
  category: string;
  validationStatus: 'OK' | 'WARNING' | 'ERROR';
  issues: McpIssue[];
}

interface McpIssue {
  severity: 'WARNING' | 'ERROR' | 'INFO';
  field: string;
  message: string;
  suggestion: string;
}
```

---

## Variables de entorno

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Definidas en `.env.local` en la raíz del proyecto. Este archivo no está en git.

---

## Convenciones de código

- Componentes en PascalCase: `PromptDetailPanel.tsx`
- Funciones y variables en camelCase: `getPromptById`
- Rutas de API en kebab-case: `/api/mcp-servers`
- Clases Tailwind en orden: layout → spacing → colors → typography → effects
- Siempre tipado explícito en TypeScript — no uses `any`
- Manejo de errores en todos los llamadas a la API con try/catch o `.catch()`
