FROM python:3.10-slim

# Install system dependencies required for OpenCV and DeepFace
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /app

# Copy requirements and install base dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install the heavy AI packages that Render couldn't handle
RUN pip install --no-cache-dir deepface tf-keras opencv-python-headless

# Copy the rest of the backend files
COPY . .

# Google Cloud Run dynamically assigns a port via the PORT environment variable (defaults to 8080)
EXPOSE 8080

# Start the FastAPI server using the dynamic PORT variable
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
