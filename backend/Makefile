# Arcane incantation to print all the other targets, from https://stackoverflow.com/a/26339924
help:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST))

# Install exact Python and CUDA versions
env:
	conda env update --prune -f environment.yml

# Compile and install exact pip packages
install:
	pip install pip-tools==7.1.0 setuptools==68.0.0
	pip-compile requirements/prod.in && pip-compile requirements/dev.in
	pip-sync requirements/prod.txt requirements/dev.txt

# Setup
setup:
	pre-commit install
	export PYTHONPATH=.
	echo "export PYTHONPATH=.:$PYTHONPATH" >> ~/.bashrc
	mkcert -install
	mkcert localhost 127.0.0.1 ::1
	mv localhost+2-key.pem certificates/localhost+2-key.pem
	mv localhost+2.pem certificates/localhost+2.pem

# Test
test:
	pytest tests -s

# Run app
dev:
	python app/main.py

# Start linting server
lint:
	ruff check . --watch --fix


# Lint and format
fix:
	pre-commit run --all-files

# Bump versions of transitive dependencies
upgrade:
	pip install pip-tools==7.1.0 setuptools==68.0.0
	pip-compile --upgrade requirements/prod.in && pip-compile --upgrade requirements/dev.in
	pip-sync requirements/prod.txt requirements/dev.txt
