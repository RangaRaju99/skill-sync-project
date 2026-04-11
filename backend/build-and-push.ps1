$DockerUsername = "rangaraju939238"
$Tag = "latest"

$Services = @(
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

Write-Host "Logging in to Docker Hub..."
docker login

foreach ($Service in $Services) {
    if (Test-Path "./$Service") {
        $Image = "${DockerUsername}/skillsync-${Service}:${Tag}"
        Write-Host "`nBuilding $Image ..."
        docker build -t $Image "./$Service"
        Write-Host "Pushing $Image ..."
        docker push $Image
        Write-Host "$Service done."
    }
}

Write-Host "`nAll images built and pushed successfully!"
Write-Host "Images are available at: https://hub.docker.com/u/$DockerUsername"
