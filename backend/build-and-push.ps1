# Usage: .\build-and-push.ps1 -DockerUsername <your-dockerhub-username>
# Example: .\build-and-push.ps1 -DockerUsername rangaraju939238

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername
)

$ErrorActionPreference = "Stop"
$TAG = "latest"

$SERVICES = @(
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

Write-Host "Logging in to Docker Hub..." -ForegroundColor Cyan
docker login

foreach ($SERVICE in $SERVICES) {
    $IMAGE = "$DockerUsername/skillsync-${SERVICE}:$TAG"
    Write-Host ""
    Write-Host "Building $IMAGE ..." -ForegroundColor Yellow
    docker build -t $IMAGE "./$SERVICE"
    
    Write-Host "Pushing $IMAGE ..." -ForegroundColor Yellow
    docker push $IMAGE
    Write-Host "$SERVICE done." -ForegroundColor Green
}

Write-Host ""
Write-Host "All images built and pushed successfully!" -ForegroundColor Green
Write-Host "Images are available at: https://hub.docker.com/u/$DockerUsername" -ForegroundColor Cyan
