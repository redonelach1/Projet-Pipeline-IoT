# Multi-stage Dockerfile for ENSAM IIoT Simulator
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/common.txt requirements/common.txt
COPY requirements/simulator.txt requirements/simulator.txt

RUN pip install --no-cache-dir --user -r requirements/simulator.txt

# Final Runtime Image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Create unprivileged user
RUN useradd -m -u 1000 appuser

# Copy installed Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application source
COPY simulator/src /app/src

ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

USER appuser

CMD ["python", "src/main.py"]

