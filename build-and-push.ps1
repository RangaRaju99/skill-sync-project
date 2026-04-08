param (
    [Parameter(Position=0)]
    [string]$DockerUsername = "rangaraju939238",
    
    [Parameter(Position=1)]
    [string]$Tag = "latest"
)

Write-Host "`n==========================================="
Write-Host "SkillSync Build and Push Script"
Write-Host "==========================================="
Write-Host "Docker Username: $DockerUsername"
Write-Host "Image Tag:       $Tag"
Write-Host "==========================================="

$BackendServices = @(
  "eureka-server",
  "api-gateway",
  "auth-service",
  "user-service",
  "skill-service",
  "session-service",
  "mentor-service",
  "group-service",
  "review-service",
  "notification-service",
  "payment-gateway"
)

Write-Host "`nStep 1: Logging in to Docker Hub..."
docker login

# Build Backend Services
Write-Host "`nStep 2: Building and Pushing Backend Services..."
foreach ($Service in $BackendServices) {
    if (Test-Path "./backend/$Service/Dockerfile") {
        $Image = "${DockerUsername}/skillsync-${Service}:${Tag}"
        Write-Host "`n[Building $Service] -> Image: $Image"
        docker build -t $Image "./backend/$Service"
        
        Write-Host "[Pushing $Service] -> $Image"
        docker push $Image
        Write-Host "[DONE] $Service"
    } else {
        Write-Warning "Dockerfile not found for $Service at ./backend/$Service/Dockerfile"
    }
}

# Build Frontend (Old Angular one)
Write-Host "`nStep 3: Building and Pushing Frontend (Angular)..."
if (Test-Path "./frontend/Dockerfile") {
    $Image = "${DockerUsername}/skillsync-frontend:${Tag}"
    Write-Host "`n[Building Frontend] -> Image: $Image"
    docker build -t $Image "./frontend"
    
    Write-Host "[Pushing Frontend] -> $Image"
    docker push $Image
    Write-Host "[DONE] Frontend (Angular)"
} else {
    Write-Host "`nFrontend (Angular) Dockerfile not found. Skipping."
}

# Build New React Frontend (if Dockerfile added)
Write-Host "`nStep 4: Building and Pushing Frontend (React)..."
if (Test-Path "./frontend-react/Dockerfile") {
    $Image = "${DockerUsername}/skillsync-frontend-react:${Tag}"
    Write-Host "`n[Building Frontend-React] -> Image: $Image"
    docker build -t $Image "./frontend-react"
    
    Write-Host "[Pushing Frontend-React] -> $Image"
    docker push $Image
    Write-Host "[DONE] Frontend (React)"
} else {
    Write-Host "`nFrontend (React) Dockerfile not found. Skipping."
}

Write-Host "`n==========================================="
Write-Host "All images built and pushed successfully!"
Write-Host "Images available at: https://hub.docker.com/u/$DockerUsername"
Write-Host "==========================================="
