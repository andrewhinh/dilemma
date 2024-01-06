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

Create a `.env` file:

   ```bash
   # Get an OpenAI API key: https://platform.openai.com/signup
   # Get your SMTP_SSL_PASSWORD: https://myaccount.google.com/apppasswords
   API_PORT=8000
   DB_URL=sqlite:///data.db
   DB_ECHO=True
   OPENAI_API_KEY=<your key here>
   JWT_SECRET=$(openssl rand -hex 32)
   SMTP_SSL_HOST=smtp.gmail.com
   SMTP_SSL_PORT=587
   SMTP_SSL_LOGIN=<your email here>
   SMTP_SSL_PASSWORD=<your password here>
   FRONTEND_URL=<frontend URL here>
   echo "API_PORT=$API_PORT" >> .env
   echo "DB_URL=$DB_URL" >> .env
   echo "DB_ECHO=$DB_ECHO" >> .env
   echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env
   echo "JWT_SECRET=$JWT_SECRET" >> .env
   echo "SMTP_SSL_HOST=$SMTP_SSL_HOST" >> .env
   echo "SMTP_SSL_PORT=$SMTP_SSL_PORT" >> .env
   echo "SMTP_SSL_LOGIN=$SMTP_SSL_LOGIN" >> .env
   echo "SMTP_SSL_PASSWORD=$SMTP_SSL_PASSWORD" >> .env
   echo "FRONTEND_URL=$FRONTEND_URL" >> .env
   echo "ECHO=$ECHO" >> .env
   ```

## Development

To run all tests:

   ```bash
   make test
   ```

To run the backend locally:

   ```bash
   make dev
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
