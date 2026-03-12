# Test Script para verificar el backend del Skill Builder
# Ejecutar: .\test-backend.ps1

$BASE_URL = "http://localhost:8080"

Write-Host "`n🧪 ========================================" -ForegroundColor Blue
Write-Host "🧪 Testing Skill Builder Backend" -ForegroundColor Blue
Write-Host "🧪 ========================================" -ForegroundColor Blue

$passed = 0
$failed = 0

# Test 1: CORS Configuration
Write-Host "`nTest 1: CORS Configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/skills" -Method OPTIONS -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ CORS configured correctly" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ CORS error: $($response.StatusCode)" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ CORS error: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Get Skills List
Write-Host "`nTest 2: GET /api/skills..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/skills" -Method GET -ErrorAction Stop
    Write-Host "✅ Skills endpoint works. Found $($response.content.Count) skills" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 3: Build Skill with IA
Write-Host "`nTest 3: POST /api/skills/build (Generate Skill with IA)..." -ForegroundColor Yellow
$body = @{
    objective = "Test code security review"
    targetAudience = "Developers"
    category = "security"
    desiredOutputFormat = "Security report"
    saveToDatabase = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/skills/build" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Skill generated successfully!" -ForegroundColor Green
    Write-Host "   Name: $($response.skill.name)" -ForegroundColor Green
    Write-Host "   Parameters: $($response.skill.parameters.Count)" -ForegroundColor Green
    Write-Host "   Quality: $($response.skill.estimatedQualityScore)%" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Create Skill Manually
Write-Host "`nTest 4: POST /api/skills (Create Skill)..." -ForegroundColor Yellow
$body = @{
    name = "Test Skill $(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "Test skill created by automated test"
    content = "[ROL] Test role`n[TAREA] Test task"
    category = "testing"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/skills" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Skill created successfully with ID: $($response.id)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Get Popular Skills
Write-Host "`nTest 5: GET /api/skills/popular..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/skills/popular" -Method GET -ErrorAction Stop
    Write-Host "✅ Popular skills endpoint works. Found $($response.Count) skills" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n🧪 ========================================" -ForegroundColor Blue
Write-Host "🧪 Tests Complete: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "🧪 ========================================" -ForegroundColor Blue

if ($failed -gt 0) {
    exit 1
}
