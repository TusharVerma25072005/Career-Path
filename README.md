# Career Path Project

This repository contains the codebase for a Career Path recommendation and guidance system. The project is divided into two main components:

1.  **`ml_backend`**: A Python-based Machine Learning backend responsible for career clustering and initial recommendations.
2.  **`Cloud & backend`**: A Python Flask application deployed on Google Cloud Run that acts as an orchestration layer, integrating the ML backend with the Google Gemini API for detailed career guidance and chat functionalities.
3.  **`webapp`**: A React/Vite frontend application for user interaction, assessment, and displaying career recommendations and chat.

## Architecture

The overall architecture involves:

-   **Users:** Interact with the `webapp`.
-   **Web Application (`webapp`):** A React/Vite frontend that collects user assessment data and handles chat interactions.
-   **Cloud & Backend Service (`Cloud & backend`):**
    -   Deployed on Google Cloud Run.
    -   Receives assessment data and chat queries from the `webapp`.
    -   Calls the `ml_backend` (deployed on Vertex AI) for career clustering.
    -   Calls the Google Gemini API for detailed career guidance and chat responses.
    -   Returns combined responses to the `webapp`.
-   **ML Backend (`ml_backend`):**
    -   Deployed as a Vertex AI endpoint.
    -   Processes assessment data to determine career clusters and provides initial recommendations.
-   **Google Gemini API:** Provides advanced natural language capabilities for personalized career guidance and conversational AI.
-   **Relational DB (e.g., Supabase):** Stores user data, assessment results, and chat history (managed by `webapp`'s Supabase Edge Functions or directly by the `Cloud & backend` in a more integrated setup).
-   **Auth & IAM:** Handles user authentication and authorization.

## Project Setup

### Prerequisites

-   Node.js and npm/bun (for `webapp`)
-   Python 3.9+ and pip (for `ml_backend` and `Cloud & backend`)
-   Docker
-   Google Cloud SDK
-   Google Cloud Project with billing enabled
-   Google Gemini API Key

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/topspeed69/Career-Path.git
    cd Career-Path
    ```

2.  **ML Backend Setup (`ml_backend` folder):**
    Refer to the `ml_backend/README.md` (if it exists, otherwise create one) for instructions on how to set up and deploy the ML model to Google Cloud Vertex AI. Ensure you obtain the endpoint URL for the deployed model.

3.  **Cloud & Backend Service Setup (`Cloud & backend` folder):**
    Refer to the `Cloud & backend/README.md` for instructions on how to set up, run locally, and deploy this Flask application to Google Cloud Run. You will need the Vertex AI endpoint URL and your Gemini API key.

4.  **Web Application Setup (`webapp` folder):**
    Refer to the `webapp/README.md` for instructions on how to set up and run the frontend application. This will involve configuring API endpoints to point to your deployed Cloud Run service.

## Development

Each sub-project (`ml_backend`, `Cloud & backend`, `webapp`) has its own `README.md` with specific development instructions.

## Deployment

Deployment instructions for each component are provided in their respective `README.md` files.

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.

## License

[Specify your license here, e.g., MIT License]
