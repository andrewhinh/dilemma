# Backend

Built with:

- Conda for Python package management
- FastAPI for the web framework
- SQLModel for the ORM
- Ruff for linting and formatting

## Set Up

Either create the conda environment locally:

   ```bash
   make env
   conda activate dilemma
   ```

Or create the conda environment in a Docker container:

- In [this guide](https://code.visualstudio.com/docs/devcontainers/containers#_getting-started):
  - [Install the prerequisites](https://code.visualstudio.com/docs/devcontainers/containers#_getting-started).
  - Then open the current working directory (`backend`) [in the container](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container).

Set up the conda environment:

   ```bash
   make install
   make setup
   ```

Create a `.env` (+ `.env.development` + `.env.production`):

```bash
# Get your SMTP_SSL_PASSWORD: https://myaccount.google.com/apppasswords
# Get your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET: https://console.cloud.google.com/apis/credentials
# Get your OpenAI API key: https://platform.openai.com/signup
API_KEY=$(openssl rand -hex 32)
DB_ECHO=True
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
POSTGRES_DB=dilemma
JWT_SECRET=$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=11520
REFRESH_TOKEN_EXPIRE_MINUTES=43200
VERIFY_CODE_EXPIRE_MINUTES=15
RECOVERY_CODE_EXPIRE_MINUTES=15
SMTP_SSL_HOST=smtp.gmail.com
SMTP_SSL_PORT=587
SMTP_SSL_SENDER=<your name here>
SMTP_SSL_LOGIN=<your email here>
SMTP_SSL_PASSWORD=<your password here>
FRONTEND_URL=<frontend URL here>
GOOGLE_CLIENT_ID=<your client ID here>
GOOGLE_CLIENT_SECRET=<your client secret here>
GOOGLE_REDIRECT_URI=${FRONTEND_URL}/home
OPENAI_API_KEY=<your key here>

cat <<EOF > .env.test
API_URL=$API_URL
API_KEY=$API_KEY
DB_ECHO=$DB_ECHO
POSTGRES_SERVER=$POSTGRES_SERVER
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB
JWT_SECRET=$JWT_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=$ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_MINUTES=$REFRESH_TOKEN_EXPIRE_MINUTES
VERIFY_CODE_EXPIRE_MINUTES=$VERIFY_CODE_EXPIRE_MINUTES
RECOVERY_CODE_EXPIRE_MINUTES=$RECOVERY_CODE_EXPIRE_MINUTES
SMTP_SSL_HOST=$SMTP_SSL_HOST
SMTP_SSL_PORT=$SMTP_SSL_PORT
SMTP_SSL_SENDER=$SMTP_SSL_SENDER
SMTP_SSL_LOGIN=$SMTP_SSL_LOGIN
SMTP_SSL_PASSWORD=$SMTP_SSL_PASSWORD
FRONTEND_URL=$FRONTEND_URL
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI
OPENAI_API_KEY=$OPENAI_API_KEY
EOF
```

## Development

To generate a database migration script:

   ```bash
   make script m="<your message here>"
   ```

To apply a database migration script:

   ```bash
   make migrate
   ```

To run all tests:

   ```bash
   make test
   ```

To run the backend locally:

```bash
make dev
```

To build the backend Docker image:

- Local:

  ```bash
  make build
  ```

- Development:

  ```bash
  make build-dev
  ```

- Production:

  ```bash
  make build-prod
  ```

To run the backend Docker container:

- Local:

  ```bash
  make run
  ```

- Development:

  ```bash
  make run-dev
  ```

- Production:

  ```bash
  make run-prod
  ```

To push the backend Docker image to the registry:

- Development:

  ```bash
  make push-dev
  ```

- Production:

  ```bash
  make push-prod
  ```

To connect to the database:

   ```bash
   make db
   ```

To start a local linting server:

   ```bash
   make lint
   ```

To lint + format the code manually:

   ```bash
   make fix
   ```

To bump transitive dependencies:

   ```bash
   make upgrade
   ```
