from projen.python import PythonProject, VenvOptions

project = PythonProject(
    author_email="sands@christodelange.com",
    author_name="Christo De Lange",
    module_name="bedrock_access_gateway",
    name="bedrock-access-gateway",
    version="0.1.0",
    venv=VenvOptions(
        envdir="/Users/christo/.pyenv/versions/3.11.10/envs/b2b-sso-service"
    )
)

# Add custom tasks
project.add_task("start", "Start the FastAPI server", ["uvicorn", "src.api.app:app", "--reload"])
project.add_task("format", "Format code with black and isort", ["black", ".", "&&", "isort", "."])
project.add_task("lint", "Run linting tools", ["flake8", "src", "tests"])
project.add_task("type-check", "Run type checking", ["mypy", "src"])

# Docker tasks
project.add_task(
    "docker:build",
    "Build Docker image",
    ["docker", "build", "-t", "bedrock-access-gateway", "."]
)
project.add_task(
    "docker:run",
    "Run Docker container",
    ["docker", "run", "-p", "8000:8000", "bedrock-access-gateway"]
)

project.synth()