Write-Host "Starting development servers..." -ForegroundColor Cyan

# Start Backend in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Extension Watch in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd extension; npm run watch"

Write-Host "Development servers started!" -ForegroundColor Green
