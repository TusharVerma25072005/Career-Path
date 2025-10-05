#!/bin/bash

# This script deploys the Python backend service to Google Cloud Run.

# --- Configuration Variables ---
# Replace with your Google Cloud Project ID
PROJECT_ID="your-gcp-project-id"
# Replace with your desired Google Cloud region (e.g., us-central1)
REGION="us-central1"
# Name for your Cloud Run service
SERVICE_NAME="career-path-backend"
# URL of your deployed ML Backend (Vertex AI Endpoint)
ML_BACKEND_URL="https://your-ml-backend-url.cloudfunctions.net/predict"
# Your Google Gemini API Key
GOOGLE_API_KEY="your-gemini-api-key"

# --- Script Logic ---

echo "Authenticating with Google Cloud..."
gcloud auth configure-docker

echo "Building Docker image..."
# The image name format is gcr.io/PROJECT_ID/SERVICE_NAME
DOCKER_IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
docker build -t "${DOCKER_IMAGE}" .

echo "Pushing Docker image to Google Container Registry..."
docker push "${DOCKER_IMAGE}"

echo "Deploying service to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${DOCKER_IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars ML_BACKEND_URL="${ML_BACKEND_URL}",GOOGLE_API_KEY="${GOOGLE_API_KEY}" \
  --project "${PROJECT_ID}"

echo "Deployment complete!"
echo "You can find your service at: $(gcloud run services describe ${SERVICE_NAME} --project ${PROJECT_ID} --region ${REGION} --format='value(status.url)')"
