# Smart Agriculture AI System - Launcher

# Check if backend is ready
Write-Host "🚀 Starting Smart Agriculture AI System..." -ForegroundColor Green

# Start Backend in a new window
Write-Host "📦 Starting Flask Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"

# Start Frontend in a new window
Write-Host "🌐 Starting Vite Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ Both services are starting! Check the new windows for logs." -ForegroundColor Green
Write-Host "🔗 Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "🔗 Backend API: http://localhost:5000" -ForegroundColor Yellow
