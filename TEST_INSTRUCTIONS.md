# 🧪 Test Scripts para Skill Builder

## Instrucciones de Uso

### Pré-requisitos
1. **Backend ejecutándose**: `mvn spring-boot:run` en `C:\Datos\proyectos\promptvault\backend`
2. **Puerto 8080 disponible**: El backend debe estar en `http://localhost:8080`

### Opción 1: PowerShell (Recomendado en Windows)

```powershell
# Desde la carpeta del frontend
cd C:\datos\proyectos\ai_studio
.\test-backend.ps1
```

### Opción 2: Node.js

```bash
# Desde la carpeta del frontend
cd C:\datos\proyectos\ai_studio
node test-backend.js
```

### Opción 3: curl (Manual)

```bash
# Test 1: CORS
curl -X OPTIONS http://localhost:8080/api/skills -v

# Test 2: Get Skills
curl http://localhost:8080/api/skills

# Test 3: Build Skill con IA
curl -X POST http://localhost:8080/api/skills/build ^
  -H "Content-Type: application/json" ^
  -d "{\"objective\":\"Test security review\",\"category\":\"security\"}"

# Test 4: Create Skill
curl -X POST http://localhost:8080/api/skills ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Skill\",\"description\":\"Test\",\"content\":\"[ROL] Test\",\"category\":\"testing\"}"

# Test 5: Popular Skills
curl http://localhost:8080/api/skills/popular
```

## Tests que se ejecutan

| # | Test | Endpoint | Método | Descripción |
|---|------|----------|--------|-------------|
| 1 | CORS | `/api/skills` | OPTIONS | Verifica configuración CORS |
| 2 | Get Skills | `/api/skills` | GET | Lista todas las skills |
| 3 | Build Skill | `/api/skills/build` | POST | Genera skill con IA |
| 4 | Create Skill | `/api/skills` | POST | Crea skill manualmente |
| 5 | Popular Skills | `/api/skills/popular` | GET | Skills más usadas |

## Resultados Esperados

### ✅ Todo Correcto
```
🧪 Tests Complete: 5 passed, 0 failed
```

### ❌ Si hay errores

El script mostrará qué test falló y el error específico:

```
❌ Error: 500 - Internal Server Error
```

## Solución de Problemas

### Error: "Failed to fetch" o "Connection refused"
- **Causa**: El backend no está ejecutándose
- **Solución**: Ejecuta `mvn spring-boot:run` en la carpeta del backend

### Error: 500 Internal Server Error
- **Causa**: Error en el backend
- **Solución**: Revisa los logs del backend para ver el stack trace completo

### Error: CORS
- **Causa**: Configuración CORS incorrecta
- **Solución**: Verifica que `CorsConfig.java` tenga `allowCredentials(false)`

## Verificación Manual en el Frontend

1. Abre `http://localhost:3000/skill-builder`
2. Escribe un objetivo: "code review for security vulnerabilities"
3. Click en "Generar Skill con IA"
4. Debería aparecer la skill generada con:
   - Nombre
   - Parámetros (badges cyan)
   - Template completo
   - Calidad estimada

5. Click en "Guardar en el catálogo"
6. Debería aparecer toast: "Skill guardada"
7. Ve a `http://localhost:3000/skills` y verifica que aparece la skill

## Logs del Backend

Cuando todo funciona correctamente, deberías ver en los logs:

```
=== CONTROLLER: POST /api/skills/build - objective=code review...
=== CONTROLLER: Skill generated - name=Code Review
=== SERVICE: Creando skill desde builder: Code Review
=== SERVICE: Skill creada con ID: 123
```
