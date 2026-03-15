# AI Studio (Frontend)

AI Studio es el frontend de **PromptVault**, una plataforma para gestionar prompts, skills, workflows, MCP servers y context packs. Está construido con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** y **shadcn/ui**.

> Este repositorio contiene **solo el frontend**. El backend corre en Java 17 (Spring Boot) y está diseñado para ejecutarse en `http://localhost:8080`.

---

## 🧩 Tecnologías principales

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript (estricto)
- **Estilos**: Tailwind CSS + shadcn/ui
- **Estado servidor**: TanStack Query (React Query)
- **API**: Se consumen endpoints REST en `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:8080`)

---

## 🚀 Levantar el proyecto

1. Instala dependencias:

```bash
pnpm install
```

2. Crea un archivo `.env.local` en la raíz (no se versiona) con la URL del backend:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Inicia el servidor de desarrollo:

```bash
pnpm dev
```

4. Abre el navegador en:

```
http://localhost:3000
```

---

## 📌 Estructura del proyecto

- `app/` → páginas del frontend (App Router)
- `components/` → componentes UI reutilizables (incluye `components/ui` con shadcn/ui)
- `lib/api.ts` → todas las llamadas al backend están centralizadas aquí (NO usar `fetch()` directamente en componentes)
- `lib/mock-data.ts` → datos ficticios usados solo con `USE_MOCK = true`

---

## 🧠 Cómo extender o integrar nuevos endpoints

- **Siempre** llama al backend a través de `src/lib/api.ts`.
- Si necesitas un endpoint nuevo, agrégalo a `lib/api.ts` y úsalo desde el componente.
- Nunca agregues datos hardcodeados en los componentes.

---

## 🧪 Modo de desarrollo con datos ficticios

En `src/lib/api.ts` hay una variable:

```ts
const USE_MOCK = false;
```

Cambia a `true` solo para desarrollo local si no tienes el backend disponible.

---

## 📄 Documentación interna

- `AGENTS.md` → contexto y reglas para agentes IA (Copilot, Gemini, etc.)
- `SKILL_BUILDER_DOCUMENTATION.md` → documentación específica de la herramienta Skill Builder
- `TEST_INSTRUCTIONS.md` → instrucciones de pruebas

---

## 🧩 Páginas principales (App Router)

- `/` → Dashboard
- `/prompts` → Catálogo de prompts
- `/skills` → Catálogo de skills
- `/workflows` → Workflows encadenados
- `/mcp-registry` → Registro de MCP servers
- `/context-packs` → Paquetes de contexto
- `/skill-builder` → Generador IA de skills

---

## 👨‍💻 Convenciones (importante)

- Componentes: `PascalCase` (ej. `PromptDetailPanel.tsx`)
- Variables / funciones: `camelCase`
- Tipado explícito en TypeScript (evita `any` siempre que sea posible)
- Maneja errores en todas las llamadas a la API con `try/catch` o `.catch()`

---

## 📝 Licencia

Este proyecto no incluye licencia en el repositorio. Añade un `LICENSE` si es necesario.
