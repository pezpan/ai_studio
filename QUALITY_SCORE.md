# 📊 Prompt Quality Score - Documentación

## Overview

El sistema de **Quality Score** mide la calidad de los prompts basándose en su estructura y completitud después de ser mejorados con IA.

---

## 🎯 Rangos de Quality Score

| Score | Nivel | Descripción |
|-------|-------|-------------|
| **90-100** | 🟢 **Excelente** | Prompt con todas las 5 secciones completas y bien estructuradas |
| **80-89** | 🟡 **Muy Bueno** | Prompt con 4-5 secciones, minoría de detalles faltantes |
| **70-79** | 🟠 **Bueno** | Prompt con 3-4 secciones, estructura aceptable |
| **60-69** | 🔵 **Regular** | Prompt con 2-3 secciones, necesita mejoras |
| **50-59** | ⚪ **Básico** | Prompt sin mejorar o con estructura incompleta |

---

## 📈 Cómo se Calcula

### Fórmula

```
Quality Score = 50 + (Completeness / 2)
```

Donde **Completeness** es el porcentaje de secciones presentes (0-100%).

### Secciones Evaluadas

El sistema verifica la presencia de estas 5 secciones obligatorias:

1. **[ROL]** - Define quién debe responder o desde qué perspectiva
2. **[TAREA]** - Explica qué debe hacer el modelo
3. **[AUDIENCIA]** - Indica para quién es el resultado
4. **[FORMATO]** - Define cómo presentar la salida
5. **[CONTEXTO/DETALLES]** - Incluye información relevante

### Ejemplos de Cálculo

| Secciones Presentes | Completeness | Quality Score | Nivel |
|---------------------|--------------|---------------|-------|
| 5/5 (todas) | 100% | 50 + (100/2) = **100** | Excelente |
| 4/5 | 80% | 50 + (80/2) = **90** | Muy Bueno |
| 3/5 | 60% | 50 + (60/2) = **80** | Bueno |
| 2/5 | 40% | 50 + (40/2) = **70** | Regular |
| 1/5 | 20% | 50 + (20/2) = **60** | Básico |
| 0/5 | 0% | 50 + (0/2) = **50** | Básico |

---

## 🔄 Flujo de Mejora

### Antes de Mejorar
```
Prompt Original → Quality Score: 50 (default)
- Sin estructura definida
- Contenido en texto plano
```

### Después de Mejorar con IA
```
Prompt Mejorado → Quality Score: 50-100 (según completitud)
- Estructura de 5 secciones
- Contenido organizado y profesional
```

### Ejemplo de Prompt Excelente (100/100)

```
[ROL]
Actúa como desarrollador senior especializado en Spring Boot con 10 años de experiencia.

[TAREA]
1. Analiza el código proporcionado
2. Identifica posibles bugs y vulnerabilidades
3. Propón soluciones con ejemplos de código
4. Explica las mejores prácticas aplicables

[AUDIENCIA]
Desarrolladores Java mid-level que trabajan con Spring Boot.

[FORMATO]
- Código corregido con comentarios explicativos
- Lista de issues encontrados por severidad
- Explicación paso a paso de cada solución

[CONTEXTO/DETALLES]
- Framework: Spring Boot 3.2
- Java 17
- Base de datos: PostgreSQL 15
- Enfocarse en seguridad y performance
```

---

## 💡 Consejos para Mejorar el Quality Score

### Para Alcanzar 100/100:

1. **Usa "Mejorar con IA"** - La IA estructurará automáticamente tu prompt
2. **Revisa las 5 secciones** - Asegúrate de que todas estén presentes
3. **Añade detalles específicos** - Cuanta más información, mejor
4. **Sé explícito en el formato** - Define cómo quieres la salida
5. **Proporciona contexto relevante** - Tecnologías, versiones, restricciones

### Para Mantener un Buen Score:

- ✅ No elimines las secciones después de mejorar
- ✅ Añade información adicional si es necesario
- ✅ Mantén la estructura [TAG] para cada sección

---

## 🛠️ Implementación Técnica

### Backend (Java/Spring Boot)

**Entidad Prompt:**
```java
@Column(name = "quality_score")
@Builder.Default
private Integer qualityScore = 50;
```

**Servicio AIEnhancementService:**
```java
int completeness = response.getStructureValidation().getCompleteness();
int newQualityScore = 50 + (completeness / 2);
prompt.setQualityScore(newQualityScore);
```

### Frontend (React/TypeScript)

**Visualización:**
- Barra de progreso circular
- Color gradiente: índigo → verde
- Porcentaje visible al lado

**Actualización:**
- Automática después de mejorar con IA
- Re-fetch de datos para obtener nuevo score

---

## 📊 Estadísticas

### Distribución Típica de Scores

```
100 ┤     █
 90 ┤    ███
 80 ┤   █████
 70 ┤  ███████
 60 ┤ █████████
 50 ┤███████████
   └─────────────
     Prompts en la biblioteca
```

### Métricas Sugeridas

- **Average Quality Score**: Promedio de todos los prompts
- **Improved Prompts**: Prompts con score > 50
- **Excellent Prompts**: Prompts con score >= 90

---

## 🎓 Mejores Prácticas

### DO ✅
- Usar la mejora con IA para prompts importantes
- Revisar y editar las secciones generadas
- Mantener actualizado el contexto
- Especificar claramente el formato deseado

### DON'T ❌
- No eliminar las secciones después de mejorar
- No usar prompts genéricos sin contexto
- No omitir la definición de audiencia
- No dejar el formato ambiguo

---

## 📝 Historial de Versiones

| Versión | Cambio | Fecha |
|---------|--------|-------|
| 1.0 | Implementación inicial de Quality Score | 2026-03-08 |
| 1.1 | Integración con mejora de IA | 2026-03-08 |

---

## 🔗 Recursos Relacionados

- [Guía de Prompt Engineering](./prompt-engineering-guide.md)
- [Estructura de 5 Secciones](./five-section-structure.md)
- [API de Mejora con IA](./ai-improvement-api.md)

---

**Última actualización:** 2026-03-08
**Autor:** PromptVault Team
