FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose the API port
EXPOSE 7860

# Run Uvicorn specifically on 0.0.0.0 to be publicly accessible on HuggingFace's required port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
