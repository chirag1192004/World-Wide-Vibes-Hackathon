FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose the API port (Render injects its own $PORT at runtime)
EXPOSE 8000

# Shell-form so $PORT env var from Render is expanded at runtime.
# Falls back to 8000 for local Docker usage.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
