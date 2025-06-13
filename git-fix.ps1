function gitpush {
    param(
        [string]$remote = "origin",
        [string]$branch = "main"
    )
    
    Write-Host "🔧 Using Git with correct exec-path..." -ForegroundColor Yellow
    & "C:\Program Files\Git\cmd\git.exe" --exec-path="C:\Program Files\Git\mingw64\libexec\git-core" push $remote $branch
}

function gitpull {
    param(
        [string]$remote = "origin",
        [string]$branch = "main"
    )
    
    Write-Host "🔧 Using Git with correct exec-path..." -ForegroundColor Yellow
    & "C:\Program Files\Git\cmd\git.exe" --exec-path="C:\Program Files\Git\mingw64\libexec\git-core" pull $remote $branch
}

function gitfetch {
    Write-Host "🔧 Using Git with correct exec-path..." -ForegroundColor Yellow
    & "C:\Program Files\Git\cmd\git.exe" --exec-path="C:\Program Files\Git\mingw64\libexec\git-core" fetch
}

Write-Host "✅ Git helper functions loaded!" -ForegroundColor Green
Write-Host "Use: gitpush, gitpull, gitfetch instead of git commands" -ForegroundColor Cyan 