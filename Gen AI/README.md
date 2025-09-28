Career Guidance clustering demo

Files added:
- `career_guidance.py` : clustering, metadata, matching and prompt preparation utilities
- `sample_run.py` : example runner that generates clusters and one sample Gemini prompt
- `requirements.txt` : minimal Python deps

How to run (Windows PowerShell):

1. Create a venv and install requirements

    python -m venv .venv; .\.venv\Scripts\activate; pip install -r requirements.txt

2. Run the sample

    python sample_run.py

Notes:
- The Gemini/OpenAI API call is intentionally a placeholder in `career_guidance.py::send_to_gemini`.
- After clusters are produced you'll find `clusters_meta.json` with cluster metadata.
- The clustering uses AgglomerativeClustering and a simple recursive split heuristic; tune `max_cluster_size` and `min_improvement` in `recursive_agglomerative_split`.

Security:
- Do not place API keys in source. Use environment variables or a secure secrets manager.

Docker and deployment notes
---------------------------

Two ways to provide the model (`career_model.pkl`) to the container:

1) Bake into image (simple): place `career_model.pkl` in the project root and build the image. The `Dockerfile` copies the PKL into the image.

    docker build -t career-guidance:local .
    docker run -p 8080:8080 career-guidance:local

2) Mount at runtime (preferred for frequent model updates): do not include the PKL in the image; instead mount a host directory or a downloaded file into `/app/career_model.pkl` when starting the container.

    docker run -p 8080:8080 -v /path/on/host/career_model.pkl:/app/career_model.pkl career-guidance:local

After the container is running you can call the inference endpoint:

GET /health
POST /predict (JSON student profile)

