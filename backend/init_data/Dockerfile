ARG PYTHON_VERSION=3.12
FROM python:${PYTHON_VERSION}-slim AS base

WORKDIR /init_data

# Copy requirements and install dependencies if you have them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your script and any other needed files
COPY app_data.json .
COPY load_data.py .

CMD ["python3", "load_data.py"]