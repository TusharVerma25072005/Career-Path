# Backend

This directory contains the backend services for the Career Path application.

## Technologies Used

*   **Python**: The primary programming language.
*   **Flask**: Web framework for building the API.
*   **Gunicorn**: WSGI HTTP Server for Python web applications.
*   **Docker**: For containerization and deployment.
*   **scikit-learn**: For machine learning models (e.g., `career_model.pkl`).
*   **Gemini API**: For AI-powered utilities (`gemini_utils.py`).

## Project Structure

*   `.env`: Environment variables for configuration.
*   `career_model.pkl`: Pre-trained machine learning model for career recommendations.
*   `clusters_meta.json`: Metadata related to career clusters.
*   `config.py`: Configuration settings for the Flask application.
*   `Dockerfile`: Defines the Docker image for the backend service.
*   `gemini_utils.py`: Utilities for interacting with the Gemini API.
*   `gunicorn.conf.py`: Gunicorn server configuration.
*   `index.html`: A simple HTML file, likely for testing or a basic landing page.
*   `main.py`: The main Flask application entry point.
*   `mapping.csv`: Data mapping file.
*   `model_loader.py`: Handles loading of machine learning models.
*   `preprocessing.py`: Contains data preprocessing logic.
*   `requirements.txt`: Lists Python dependencies.

## Setup and Installation

### 1. Local Development (without Docker)

1.  **Create a Virtual Environment** (recommended):

    ```bash
    python -m venv venv
    ./venv/Scripts/activate
    ```

2.  **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:

    Create a `.env` file in the `backend` directory and add necessary environment variables (e.g., API keys, database URLs). Refer to `config.py` for expected variables.

4.  **Run the Application**:

    ```bash
    python main.py
    ```

    Alternatively, using Gunicorn:

    ```bash
    gunicorn -c gunicorn.conf.py main:app
    ```

### 2. Docker

1.  **Build the Docker Image**:

    Navigate to the `backend` directory and run:

    ```bash
    docker build -t career-path-backend .
    ```

2.  **Run the Docker Container**:

    ```bash
    docker run -p 8000:8000 career-path-backend
    ```

    (Adjust port mapping `-p 8000:8000` as needed.)

## API Endpoints

*   **`/predict` (POST)**: Receives raw student data, preprocesses it, and returns a career cluster prediction along with Gemini-powered guidance.
    *   **Request Body**: JSON object containing student attributes.
    *   **Response**: JSON object with `predicted_cluster` (details of the cluster) and `career_guidance` (AI-generated advice).

*   **`/predict_from_questionnaire` (POST)**: Receives questionnaire responses, calculates scores, and returns a career cluster prediction, suggested careers, and Gemini-powered guidance.
    *   **Request Body**: JSON object containing questionnaire responses.
    *   **Response**: JSON object with `cluster_label`, `cluster_name`, `cluster_description`, `suggested_careers`, and `guidance`.

## Contributing


