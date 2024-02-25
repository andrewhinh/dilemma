# Arcane incantation to print all the other targets, from https://stackoverflow.com/a/26339924
help:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST))

# Install exact Python and CUDA versions
env:
	conda env update --prune -f environment.yml

# Compile and install exact pip packages
install:
	pip install uv==0.1.10
	uv pip compile requirements/prod.in -o requirements/prod.txt && uv pip compile requirements/dev.in -o requirements/dev.txt
	uv pip sync requirements/prod.txt requirements/dev.txt

# Setup
setup:
	pre-commit install
	export PYTHONPATH=.
	echo "export PYTHONPATH=.:$PYTHONPATH" >> ~/.bashrc
	mkcert -install
	mkcert localhost 127.0.0.1 ::1
	mkdir -p certificates
	mv localhost+2-key.pem certificates/localhost+2-key.pem
	mv localhost+2.pem certificates/localhost+2.pem

# Generate migration script
script:
	alembic revision --autogenerate -m "$(m)"

# Apply migration
migrate:
	alembic upgrade head

# Test
test:
	pytest tests -s

# Run app
dev:
	sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'dilemma'" | grep -q 1 || sudo -u postgres createdb dilemma; python app/main.py

# Login to Docker
login:
	env $(cat ../.env | xargs) docker login -u "$$DOCKERHUB_USERNAME" --password "$$DOCKERHUB_PASSWORD"

# Build Docker image
build:
	docker build --build-arg ENV_FILE=.env -t andrewhinh/dilemma:local-latest .
build-dev:
	docker build --build-arg ENV_FILE=.env.development -t andrewhinh/dilemma:dev-latest .
build-prod:
	docker build --build-arg ENV_FILE=.env.production -t andrewhinh/dilemma:prod-latest .

# Run Docker image
run:
	docker run -p 8000:8000 andrewhinh/dilemma:local-latest
run-dev:
	docker run -p 8000:8000 andrewhinh/dilemma:dev-latest
run-prod:
	docker run -p 8000:8000 andrewhinh/dilemma:prod-latest

# Push Docker image
push-dev:
	make login
	docker push andrewhinh/dilemma:dev-latest
push-prod:
	make login
	docker push andrewhinh/dilemma:prod-latest

# Connect to database
db:
	sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'dilemma'" | grep -q 1 || sudo -u postgres createdb dilemma; sudo -u postgres psql -d dilemma

# Start linting server
lint:
	ruff check . --watch --fix

# Lint and format
fix:
	pre-commit run --all-files

# Bump versions of transitive dependencies
upgrade:
	pip install uv==0.1.10
	uv pip compile --upgrade requirements/prod.in -o requirements/prod.txt && uv pip compile --upgrade requirements/dev.in -o requirements/dev.txt
	uv pip sync requirements/prod.txt requirements/dev.txt
