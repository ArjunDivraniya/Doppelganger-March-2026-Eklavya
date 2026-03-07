Write-Host "Installing dependencies for all services..." -ForegroundColor Cyan

# Root
Write-Host "No root dependencies."

# Extension
Write-Host "Installing extension dependencies..."
Set-Location -Path "extension"
npm install
Set-Location -Path ".."

# Backend
Write-Host "Installing backend dependencies..."
Set-Location -Path "backend"
npm install
Set-Location -Path ".."

Write-Host "Installation complete!" -ForegroundColor Green
