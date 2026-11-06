# Multi-stage Dockerfile for ENSAM IIoT Edge Gateway
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/common.txt requirements/common.txt
COPY requirements/edge.txt requirements/edge.txt

RUN pip install --no-cache-dir --user -r requirements/edge.txt

# Final Runtime Image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Create unprivileged user
RUN useradd -m -u 1000 appuser

# Copy installed Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application source
COPY edge/src /app/src

# Create buffer directory writable by appuser
RUN mkdir -p /app/data && chown -R appuser:appuser /app/data

ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    EDGE_BUFFER_PATH=/app/data/edge_buffer.db

USER appuser

CMD ["python", "src/main.py"]

