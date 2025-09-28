FROM python:3.11-slim as base
WORKDIR /app

# Prevent Python from writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build deps only during build stage
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifest first for better layer caching
COPY requirements.txt /app/requirements.txt

# Install Python deps into the image
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code and model artifact.
# Ensure `career_model.pkl` exists in the build context (project root) before building.
COPY . /app/

# Remove build-essential to keep image small
RUN apt-get purge -y --auto-remove build-essential || true

EXPOSE 8080
ENV PORT=8080

# Use gunicorn with modest concurrency: Cloud Run charges per instance; prefer threads over many processes.
# 1 worker with several threads gives good throughput with low memory.
CMD ["gunicorn", "server:app", "-b", "0.0.0.0:8080", "--workers", "1", "--threads", "4", "--timeout", "120"]
