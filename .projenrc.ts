import { execSync } from "child_process";
import { AwsCdkPythonApp } from "projen/lib/awscdk";
import { NodePackageManager } from "projen/lib/javascript";

class BedrockAccessGatewayProject extends AwsCdkPythonApp {
  constructor(options = {}) {
    super({
      author: "Christo De Lange",
      authorAddress: "sands@christodelange.com",
      cdkVersion: "2.171.1",
      defaultReleaseBranch: "main",
      name: "bedrock-access-gateway",
      description: "A FastAPI-based secure gateway for AWS Bedrock AI models",
      repositoryUrl: "git@github.com:christokur/bedrock-access-gateway.git",
      license: "Apache-2.0",
      projenrcTs: true,
      packageManager: NodePackageManager.NPM,
      gitignore: [
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
      deps: [],
      devDeps: [
        "projen@^0.91.0",
        "@types/node@22.10.1",
        "typescript@~5.6.3",
        "eslint@^8",
        "prettier"
      ],
      ...options,
    });

    // Add Python-specific configurations
    this.addTask("start", {
      description: "Start the FastAPI server",
      exec: "uvicorn src.api.app:app --reload",
    });

    this.addTask("test", {
      description: "Run Python tests",
      exec: "pytest",
    });

    this.addTask("lint", {
      description: "Run Python linting",
      exec: "flake8 src tests",
    });

    // Add Docker-related tasks
    this.addTask("docker:build", {
      description: "Build Docker image",
      exec: "docker build -t bedrock-access-gateway .",
    });

    this.addTask("docker:run", {
      description: "Run Docker container",
      exec: "docker run -p 8000:8000 bedrock-access-gateway",
    });
  }
}

const project = new BedrockAccessGatewayProject({});
project.synth();
