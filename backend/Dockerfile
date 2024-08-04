# The "buster" flavor of the official docker Python image is based on Debian and includes common packages.
# Keep any dependencies and versions in this file aligned with the environment.yml and Makefile
FROM python:3.11-buster

# Create the working directory
#   set -x prints commands and set -e causes us to stop on errors
RUN set -ex && mkdir /repo
WORKDIR /repo

# Install Python dependencies
COPY requirements/prod.txt ./requirements.txt
RUN pip install --upgrade pip==23.2.1
RUN pip install -r requirements.txt
ENV PYTHONPATH ".:"

# Copy only the relevant directories
#   note that we use a .dockerignore file to avoid copying logs etc.
COPY app/ ./app
#   argument for specifying the environment file
ARG ENV_FILE
#   copy the specified environment file to .env
COPY $ENV_FILE .env

# Use docker run -it --rm to run the web server
ENTRYPOINT ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0"]