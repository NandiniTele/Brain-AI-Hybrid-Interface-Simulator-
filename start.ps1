# ============================================================
# Brain-AI Hybrid Interface Simulator - Startup Script
# Run this from the AI_Brain root folder:
#   powershell -ExecutionPolicy Bypass -File start.ps1
# ============================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Brain-AI Hybrid Interface Simulator  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Start FastAPI Backend ---
Write-Host "[1/2] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal

Start-Sleep -Seconds 2

# --- Start Vite Frontend ---
Write-Host "[2/2] Starting React frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "   Backend  → http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend → http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor Magenta
Write-Host ""
