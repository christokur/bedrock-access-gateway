from projen.python import PythonProject

project = PythonProject(
    author_email="sands@christodelange.com",
    author_name="Christo De Lange",
    module_name="bedrock_access_gateway",
    name="bedrock-access-gateway",
    version="0.1.0",
    description="A FastAPI-based secure gateway for AWS Bedrock AI models",
    license="Apache-2.0",
    homepage="https://github.com/christokur/bedrock-access-gateway",
    
    # Dependencies
    deps=[
        "fastapi~=0.104.1",
        "uvicorn~=0.24.0",
        "pydantic~=2.5.2",
        "boto3~=1.33.6",
        "python-jose[cryptography]~=3.3.0",
        "python-multipart~=0.0.6",
        "python-dotenv~=1.0.0",
    ],
    
    dev_deps=[
        "pytest~=7.4.3",
        "pytest-cov~=4.1.0",
        "black~=23.11.0",
        "flake8~=6.1.0",
        "isort~=5.12.0",
        "mypy~=1.7.1",
    ],
    
    # Git ignore patterns
    gitignore=[
        ".vscode/",
        ".idea/",
        "__pycache__/",
        "*.pyc",
        ".pytest_cache/",
        ".coverage",
        "htmlcov/",
        "dist/",
        "build/",
        "*.egg-info/",
        ".env",
        ".DS_Store",
        "coverage.xml",
        ".mypy_cache/",
        "/.aider*",
        "/.jsii",
        "/dist",
        "/lib",
        "/.vscode",
        "/.idea",
        "/coverage",
        "/cdk.out",
        "/test-reports",
        "/node_modules",
        "/.DS_Store",
        "/.ai",
        "/env.txt",
        "/cmd.txt",
        "/errors.txt",
        "/ai",
        ".env",
        "__pycache__",
        "*.pyc",
        ".pytest_cache",
        ".coverage",
        "htmlcov",
        "dist",
        "build",
        "*.egg-info",
        "!/tsconfig*",
        "src/.npmrc",
        ".yalc",
        "yalc*",
      ],
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