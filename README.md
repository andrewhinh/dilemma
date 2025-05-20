# Dilemma

Real estate website demo to better understand React, Next.js, Tailwind CSS, PostgreSQL, and FastAPI.

## Contributing

If you'd like to develop in Docker, create a `.env` file:

```bash
# Sign up for DockerHub here: https://hub.docker.com/signup
DOCKERHUB_USERNAME=<your username here>
DOCKERHUB_PASSWORD=<your password here>
echo "DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME" >> .env
echo "DOCKERHUB_PASSWORD=$DOCKERHUB_PASSWORD" >> .env
```

Check out the respective READMEs for more information.

## Running with Docker Compose

This is the recommended way to run the application locally for development and testing, as it sets up both the frontend and backend services with networking.

### Prerequisites

*   Ensure you have [Docker](https://docs.docker.com/get-docker/) installed.
*   Ensure you have [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop).

### Setup

1.  **Backend Environment Configuration:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Copy the example environment file: `cp .env.example .env.development`
    *   Edit `backend/.env.development` and fill in all the required values (e.g., `POSTGRES_PASSWORD`, `JWT_SECRET`, `API_KEY`, SMTP details, etc.).
    *   `cd ..` to return to the project root.

2.  **Frontend Environment Configuration:**
    *   Navigate to the `frontend` directory: `cd frontend`
    *   Copy the example environment file: `cp .env.local.example .env.local.development`
    *   Edit `frontend/.env.local.development`.
    *   **Crucially, set `API_URL=http://backend:8000`**. This allows the frontend container to find the backend service via Docker's internal network.
    *   Fill in other values like `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000`), `NEXT_PUBLIC_SUPPORT_EMAIL`, and `API_KEY`. **The `API_KEY` here must match the `API_KEY` in `backend/.env.development`**.
    *   `cd ..` to return to the project root.

### Running the Application

1.  **Start the services:**
    Open a terminal at the project root and run:
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for both frontend and backend (if they don't exist or if Dockerfiles have changed) and then start the services. The `--build` flag ensures images are rebuilt if necessary.

2.  **Accessing the application:**
    *   Frontend: Open your browser and go to [http://localhost:3000](http://localhost:3000)
    *   Backend API: Accessible at [http://localhost:8000](http://localhost:8000) (e.g., for API testing tools or if the frontend proxies to it)

### Stopping the Application

1.  To stop the services, press `Ctrl+C` in the terminal where `docker-compose up` is running.
2.  To remove the containers (and optionally volumes if you add `-v`):
    ```bash
    docker-compose down
    ```

### Notes
*   The `docker-compose.yml` uses volumes to map your local `backend` and `frontend` code into the respective containers. This means changes you make to the code locally should be reflected (frontend often hot-reloads, backend might if using a dev server with reload capabilities like Uvicorn's reload).
*   The `backend` service uses `ENV_FILE=.env.development` as a build argument, which is then copied to `.env` inside the backend container. Its runtime environment is also populated from `./backend/.env.development`.
*   The `frontend` service uses build arguments and runtime environment variables sourced from `./frontend/.env.local.development`. The `API_URL` for runtime is explicitly set to `http://backend:8000` in the `docker-compose.yml` to ensure proper service discovery.
