#!/usr/bin/env bash
# Deploy the container to Cloud Run from local machine.
# Usage: ./deploy_cloudrun.sh <GCP_PROJECT> [REGION]

PROJECT=$1
REGION=${2:-us-central1}

if [ -z "$PROJECT" ]; then
  echo "Usage: $0 <GCP_PROJECT> [REGION]"
  exit 1
fi

gcloud config set project "$PROJECT"
gcloud builds submit --tag gcr.io/$PROJECT/career-guidance:latest
gcloud run deploy career-guidance --image gcr.io/$PROJECT/career-guidance:latest --region $REGION --platform managed --allow-unauthenticated
