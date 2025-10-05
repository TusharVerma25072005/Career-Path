# Cloud & Backend Service

This directory contains the Python Flask application that acts as the orchestration layer for the Career Path project. It handles requests from the web application, communicates with the Machine Learning (ML) backend (hosted on Google Cloud Vertex AI), and interacts with the Google Gemini API for career guidance and chat functionalities.

## Architecture Overview

- **Web Application:** Sends user assessment data and chat queries to this backend.
- **ML Backend (Vertex AI):** A separate service (from the `ml_backend` directory) that performs career clustering and initial recommendations. This service is expected to be deployed as a Vertex AI endpoint.
- **Google Gemini API:** Used for generating detailed career guidance reports and handling conversational chat.

## Project Structure

```
Cloud & backend/
├── Dockerfile
├── main.py
├── requirements.txt
└── cloud_run.sh
```

- `Dockerfile`: Defines the Docker image for this Flask application.
- `main.py`: The core Flask application with API endpoints for assessment and chat.
- `requirements.txt`: Lists the Python dependencies required by `main.py`.
- `cloud_run.sh`: A shell script to build the Docker image and deploy the service to Google Cloud Run.

## Setup and Deployment

### Prerequisites

Before deploying this service, ensure you have:

1.  **Google Cloud Project:** A Google Cloud Project with billing enabled.
2.  **Google Cloud SDK:** Installed and configured on your local machine.
3.  **Docker:** Installed on your local machine.
4.  **ML Backend Deployed:** Your `ml_backend` service (from the `ml_backend` directory) should be deployed to Google Cloud Vertex AI or a similar accessible endpoint. Obtain its URL.
5.  **Gemini API Key:** A Google Gemini API key.

### Environment Variables

This service requires the following environment variables:

-   `GOOGLE_API_KEY`: Your Google Gemini API key.
-   `ML_BACKEND_URL`: The URL of your deployed ML backend (e.g., `https://your-ml-backend-url.cloudfunctions.net/predict`).

These variables are set during the Cloud Run deployment process using the `cloud_run.sh` script.

### Local Development (Optional)

To run the Flask application locally for testing:

1.  **Navigate to the directory:**
    ```bash
    cd "Cloud & backend"
    ```
2.  **Create a virtual environment and install dependencies:**
    ```bash
    python -m venv venv
    ./venv/Scripts/activate # On Windows
    # source venv/bin/activate # On macOS/Linux
    pip install -r requirements.txt
    ```
3.  **Create a `.env` file** in the `Cloud & backend` directory with your environment variables:
    ```
    GOOGLE_API_KEY="your-gemini-api-key"
    ML_BACKEND_URL="http://localhost:8081" # Or your actual ML backend URL
    ```
4.  **Run the application:**
    ```bash
    flask run
    ```
    The application will typically run on `http://127.0.0.1:5000`.

### Deployment to Google Cloud Run

Use the provided `cloud_run.sh` script to deploy this service:

1.  **Update `cloud_run.sh`:**
    Open `cloud_run.sh` and replace the placeholder values for `PROJECT_ID`, `REGION`, `ML_BACKEND_URL`, and `GOOGLE_API_KEY` with your actual values.

2.  **Make the script executable (if on Linux/macOS):**
    ```bash
    chmod +x cloud_run.sh
    ```

3.  **Navigate to the `Cloud & backend` directory:**
    ```bash
    cd "Cloud & backend"
    ```

4.  **Run the deployment script:**
    ```bash
    ./cloud_run.sh
    ```

The script will:
-   Authenticate Docker with Google Container Registry.
-   Build the Docker image based on the `Dockerfile`.
-   Push the Docker image to Google Container Registry.
-   Deploy the service to Google Cloud Run, setting the necessary environment variables.

After successful deployment, the script will output the URL of your deployed Cloud Run service.

## API Endpoints

-   **`/assess` (POST):**
    -   **Input:** JSON containing user assessment data.
    -   **Output:** JSON with ML backend results and structured career guidance from Gemini.
-   **`/chat` (POST):**
    -   **Input:** JSON with `user_query`, `chat_history` (list of `{"role": "user/assistant", "content": "message"}`), and `assessment_data` (containing `career_details` and `responses`).
    -   **Output:** JSON with Gemini's chat response and updated `chat_history`.
