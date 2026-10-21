# ==============================================================================
# Campus Pulse — Start with Supabase PostgreSQL & Mail OTP
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CAMPUS PULSE — SUPABASE POSTGRESQL & MAIL OTP LAUNCH   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if .env exists
$envFile = Join-Path $PSScriptRoot "backend\.env"
if (-not (Test-Path $envFile)) {
    $envFile = Join-Path $PSScriptRoot ".env"
}

if (Test-Path $envFile) {
    Write-Host "[✓] Loading environment variables from: $envFile" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not ($line.StartsWith("#"))) {
            $parts = $line.Split('=', 2)
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $val = $parts[1].Trim()
                [System.Environment]::SetEnvironmentVariable($name, $val, [System.EnvironmentVariableTarget]::Process)
            }
        }
    }
} else {
    Write-Host "[!] No .env file found. Creating from backend\.env.example..." -ForegroundColor Yellow
    Copy-Item (Join-Path $PSScriptRoot "backend\.env.example") (Join-Path $PSScriptRoot "backend\.env")
    Write-Host "[i] Please update backend\.env with your Supabase DB URL and Password!" -ForegroundColor Yellow
}

# Set profile to supabase
[System.Environment]::SetEnvironmentVariable("SPRING_PROFILES_ACTIVE", "supabase", [System.EnvironmentVariableTarget]::Process)

Write-Host "`n[1/2] Starting Spring Boot Backend with Supabase Profile..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; if (Test-Path .env) { Get-Content .env | ForEach-Object { `$l = `$_.Trim(); if (`$l -and -not `$l.StartsWith('#')) { `$p = `$l.Split('=', 2); if (`$p.Length -eq 2) { [System.Environment]::SetEnvironmentVariable(`$p[0].Trim(), `$p[1].Trim(), 'Process') } } } }; .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=supabase"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Frontend Vite Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Campus Pulse is launching!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend  : http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Database : Supabase PostgreSQL (Cloud)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
