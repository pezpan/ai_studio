# 📚 Skill Builder - Documentación Completa

## Overview

El **Skill Builder** es una herramienta que utiliza IA (Groq API) para generar automáticamente **skills** (plantillas de prompts parametrizables) a partir de una descripción en lenguaje natural.

---

## 🎯 Flujo de Funcionamiento

### 1. **Interfaz de Usuario** (`skill-builder-content.tsx`)

**Ubicación:** `C:\datos\proyectos\ai_studio\components\skill-builder\skill-builder-content.tsx`

#### Componentes principales:

**Formulario de entrada (izquierda):**
- **Objetivo**: Descripción de lo que debe hacer la skill
- **Audiencia**: Para quién es el resultado (opcional)
- **Categoría**: Campo editable con sugerencias (development, writing, testing, etc.)
- **Formato de output**: Cómo debe presentar la respuesta la skill
- **Checkbox "Guardar en BD"**: Si está marcado, guarda automáticamente después de generar

**Panel de resultado (derecha):**
- Muestra la skill generada con:
  - Nombre de la skill
  - Parámetros detectados (como badges: `{{CODE}}`, `{{LANGUAGE}}`)
  - Template completo
  - Calidad estimada (0-100%)
  - Botón "Guardar en el catálogo"

#### Estados internos:
```typescript
const [objective, setObjective] = useState("");      // Objetivo del usuario
const [audience, setAudience] = useState("");        // Audiencia objetivo
const [category, setCategory] = useState("development"); // Categoría
const [outputFormat, setOutputFormat] = useState(""); // Formato deseado
const [save, setSave] = useState(false);             // Auto-guardar
const [loading, setLoading] = useState(false);       // Loading de generación
const [result, setResult] = useState<SkillResult | null>(null); // Skill generada
const [saving, setSaving] = useState(false);         // Loading de guardado
```

#### Funciones clave:

**1. `handleGenerate()`** - Genera skill con IA:
```typescript
const handleGenerate = async () => {
  if (!objective.trim()) return;
  setLoading(true);
  
  try {
    const res = await buildSkill({ 
      objective, 
      audience, 
      category, 
      outputFormat, 
      save 
    });
    setResult(res);
    
    // Si el checkbox está marcado, guarda automáticamente
    if (save) {
      await handleSaveToCatalog(res);
    }
  } catch (error) {
    toast({ title: "Error al generar", ... });
  } finally {
    setLoading(false);
  }
};
```

**2. `handleSaveToCatalog()`** - Guarda skill en BD:
```typescript
const handleSaveToCatalog = async (skillData?: SkillResult) => {
  const dataToSave = skillData || result;
  if (!dataToSave) return;
  
  setSaving(true);
  try {
    await createSkill({
      name: dataToSave.name,
      content: dataToSave.template,
      category: dataToSave.category || category,
      description: dataToSave.description || `Skill: ${dataToSave.name}`,
    });
    
    toast({ title: "Skill guardada", ... });
  } catch (error) {
    toast({ title: "Error al guardar", ... });
  } finally {
    setSaving(false);
  }
};
```

---

### 2. **API Service** (`lib/api.ts`)

**Ubicación:** `C:\datos\proyectos\ai_studio\lib\api.ts`

#### Función `buildSkill()`:
```typescript
export async function buildSkill(input: BuildSkillInput) {
  const data = await fetchApi<{
    skill?: {
      name: string;
      parameters: string[];
      template: string;
      estimatedQualityScore?: number;
    };
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

  // Extrae los campos del objeto skill
  return {
    name: data?.skill?.name || "",
    parameters: data?.skill?.parameters || [],
    template: data?.skill?.template || "",
    quality: data?.skill?.estimatedQualityScore || 70,
  };
}
```

#### Función `createSkill()`:
```typescript
export async function createSkill(input: any) {
  return fetchApi<any>("/api/skills", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      content: input.content,      // El template
      category: input.category,
    }),
  });
}
```

---

### 3. **Backend - SkillBuilderService**

**Ubicación:** `C:\Datos\proyectos\promptvault\backend\src\main\java\com\promptvault\service\SkillBuilderService.java`

#### Método `buildSkill()`:

**Proceso:**
1. Construye un meta-prompt para la IA
2. Llama a Groq API
3. Parsea la respuesta JSON
4. Opcionalmente guarda en BD

```java
public SkillBuildResult buildSkill(SkillBuildRequest request) {
    String prompt = buildMetaPrompt(request);
    String rawResponse = groqClient.generateContent(prompt);
    
    GeneratedSkill generated = parseSkillFromResponse(rawResponse);
    
    Long savedId = null;
    if (request.isSaveToDatabase() && generated != null) {
        savedId = saveSkillToDatabase(generated);
    }
    
    return SkillBuildResult.builder()
        .skill(generated)
        .generationTimeMs(elapsed)
        .savedSkillId(savedId)
        .build();
}
```

#### Meta-Prompt (`buildMetaPrompt()`):

El prompt que se envía a la IA incluye:
- Objetivo del usuario
- Audiencia (opcional)
- Formato deseado (opcional)
- Instrucciones de formato
- Ejemplo de JSON esperado

**Ejemplo:**
```
Eres un experto en Prompt Engineering especializado en crear templates de prompts reutilizables.

Tu tarea es generar una SKILL COMPLETA en formato JSON a partir de la descripción del usuario.

OBJIVO DEL USUARIO: Revisar código Python buscando vulnerabilidades OWASP Top 10
AUDIENCIA OBJETIVO: Desarrolladores Python
FORMATO DE OUTPUT: Lista de vulnerabilidades con severidad y código corregido

Responde ÚNICAMENTE con este JSON:
{
  "name": "Python Security Reviewer",
  "description": "Skill para revisar seguridad en código Python",
  "template": "[ROL] Actúa como experto en seguridad...\n[TAREA] {{CODE}}...",
  "parameters": ["CODE", "SECURITY_FOCUS"],
  "category": "security",
  "estimatedQualityScore": 85
}
```

#### Parseo de respuesta (`parseSkillFromResponse()`):

1. Limpia markdown blocks (```)
2. Extrae el JSON
3. Parsea con Jackson ObjectMapper
4. Extrae campos: name, description, template, parameters, category, qualityScore

---

### 4. **Backend - SkillController**

**Ubicación:** `C:\Datos\proyectos\promptvault\backend\src\main\java\com\promptvault\controller\SkillController.java`

#### Endpoints:

**1. `POST /api/skills/build`** - Generar skill con IA:
```java
@PostMapping("/build")
public ResponseEntity<SkillBuildResult> buildSkill(@RequestBody SkillBuildRequest request) {
    return ResponseEntity.ok(skillBuilderService.buildSkill(request));
}
```

**2. `POST /api/skills`** - Crear skill manualmente:
```java
@PostMapping
public ResponseEntity<SkillDTO> createSkill(@RequestBody SkillCreateRequest request) {
    SkillDTO created = skillService.createSkillFromBuilder(request);
    return ResponseEntity.ok(created);
}
```

---

### 5. **Backend - SkillService**

**Ubicación:** `C:\Datos\proyectos\promptvault\backend\src\main\java\com\promptvault\service\SkillService.java`

#### Método `createSkillFromBuilder()`:

```java
@Transactional
public SkillDTO createSkillFromBuilder(SkillCreateRequest request) {
    Skill skill = Skill.builder()
        .name(request.getName())
        .description(request.getDescription())
        .category(request.getCategory())
        .promptTemplate(request.getContent())  // El template con {{PARAMS}}
        .parameters("[]")  // Se pueden extraer después
        .usageCount(0)
        .difficultyLevel("intermediate")
        .build();
    
    Skill saved = skillRepository.save(skill);
    return toDTO(saved);
}
```

---

## 📊 DTOs Utilizados

### SkillBuildRequest (Frontend → Backend)
```java
{
  "objective": "string",
  "targetAudience": "string",
  "category": "string",
  "desiredOutputFormat": "string",
  "saveToDatabase": boolean
}
```

### SkillBuildResult (Backend → Frontend)
```java
{
  "skill": {
    "name": "string",
    "description": "string",
    "template": "string",
    "parameters": ["PARAM1", "PARAM2"],
    "category": "string",
    "estimatedQualityScore": 85
  },
  "savedSkillId": 123  // Si se guardó
}
```

### SkillCreateRequest (Frontend → Backend)
```java
{
  "name": "string",
  "description": "string",
  "content": "string",    // Template
  "category": "string"
}
```

---

## 🔄 Flujo Completo Paso a Paso

### Opción A: Generar y guardar después
1. Usuario escribe objetivo y hace click en "Generar Skill con IA"
2. Frontend llama a `buildSkill()` → `POST /api/skills/build`
3. Backend llama a Groq API y genera la skill
4. Frontend muestra el resultado
5. Usuario hace click en "Guardar en el catálogo"
6. Frontend llama a `createSkill()` → `POST /api/skills`
7. Backend guarda en la tabla `skills`

### Opción B: Generar y guardar automáticamente
1. Usuario marca checkbox "Guardar en BD"
2. Usuario escribe objetivo y hace click en "Generar Skill con IA"
3. Frontend llama a `buildSkill()` con `save: true`
4. Backend genera Y guarda en un solo paso
5. Frontend muestra el resultado con toast de confirmación

---

## 🎨 Características de la UI

### Campo Categoría Inteligente
- **Input con datalist**: Permite escribir categoría nueva O seleccionar existente
- **Sugerencias**: development, writing, testing, documentation, etc.
- **Fondo oscuro**: Estilo consistente con el tema dark

### Feedback Visual
- **Loading spinner** mientras genera
- **Toast notifications** para éxitos/errores
- **Botón deshabilitado** mientras guarda
- **Parámetros como badges** cyan: `{{CODE}}`, `{{LANGUAGE}}`

### Validaciones
- Objetivo requerido (no vacío)
- Manejo de errores con try-catch
- Fallback si la IA no devuelve parámetros

---

## 🛠️ Troubleshooting

### La skill se genera vacía
**Causa:** El backend devuelve `{ skill: {...} }` pero el frontend espera los campos directamente

**Solución:** Verificar que `buildSkill()` en `lib/api.ts` extraiga `data.skill.*`

### Los parámetros no se muestran
**Causa:** `result.parameters` es undefined

**Solución:** Usar renderizado condicional:
```typescript
{result.parameters && result.parameters.length > 0 ? (
  result.parameters.map(...)
) : (
  <span>No parameters detected</span>
)}
```

### El botón "Guardar" no hace nada
**Causa:** Falta el endpoint `POST /api/skills` o el método `createSkillFromBuilder()`

**Solución:** Añadir endpoint en controller y método en service

---

## 📁 Archivos Clave

| Archivo | Función |
|---------|---------|
| `skill-builder-content.tsx` | UI del Skill Builder |
| `lib/api.ts` | Funciones `buildSkill()` y `createSkill()` |
| `SkillBuilderService.java` | Lógica de generación con IA |
| `SkillController.java` | Endpoints REST |
| `SkillService.java` | Guardado en BD |
| `SkillBuildResult.java` | DTO de respuesta |
| `SkillCreateRequest.java` | DTO de creación |

---

**Última actualización:** 2026-03-09
**Autor:** AI Assistant
