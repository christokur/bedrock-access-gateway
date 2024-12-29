import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { NodePackageManager } from 'projen/lib/javascript';
import {execSync} from "child_process";

class BedrockAccessGatewayProject extends AwsCdkTypeScriptApp {
  constructor(options = {}) {
    super({
      authorName: 'Christo De Lange',
      authorEmail: 'sands@christodelange.com',
      defaultReleaseBranch: 'main',
      name: 'bedrock-access-gateway',
      description: 'A FastAPI-based secure gateway for AWS Bedrock AI models',
      repository: 'git@github.com:christokur/bedrock-access-gateway.git',
      license: 'Apache-2.0',
      projenrcTs: true,
      packageManager: NodePackageManager.NPM,
      // Keep Jest but make it do nothing
      jest: false,
      // CDK directory structure
      srcdir: 'cdk',
      appEntrypoint: 'cdk/app.ts',
      outdir: 'cdk.out',
      gitignore: [
        '/.aider*',
        '/.jsii',
        '/dist',
        '/lib',
        '/.vscode',
        '/.idea',
        '/coverage',
        '/cdk.out',
        '/test-reports',
        '/node_modules',
        '/.DS_Store',
        '/.ai',
        '/env.txt',
        '/cmd.txt',
        '/errors.txt',
        '/ai',
        '.env',
        '__pycache__',
        '*.pyc',
        '.pytest_cache',
        '.coverage',
        'htmlcov',
        'dist',
        'build',
        '*.egg-info',
        '!/tsconfig*',
        'src/.npmrc',
        '.yalc',
        'yalc*',
        'test-reports',
      ],
      deps: [
        'aws-cdk-lib',
        'constructs',
      ],
      devDeps: [
        'projen@^0.91.0',
        '@types/node@^20.0.0',
        'esbuild@^0.19.0',
        'ts-node@^10.9.0',
        'typescript@~5.3.0',
      ],
      cdkVersion: '2.172.0',
      jsiiReleaseVersion: "0.1.0",
      nextVersionCommand: "bump2version patch --allow-dirty",
      releaseToNpm: false,
      release: false,
      minNodeVersion: "20.0.0",
      tsconfig: {
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          lib: ['es2020'],
          declaration: true,
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          noImplicitThis: true,
          alwaysStrict: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: false,
          experimentalDecorators: true,
          inlineSourceMap: true,
          inlineSources: true,
          esModuleInterop: true,
          resolveJsonModule: true,
        },
      },
    });

    // Update the test task to use pytest
    const testTask = this.tasks.tryFind('test');
    if (testTask) {
      testTask.reset('pytest');
    }

    this.addTask('start', {
      description: 'Start the FastAPI server',
      exec: 'uvicorn src.api.app:app --reload',
    });

    this.addTask('lint:py', {
      description: 'Run Python linting',
      exec: 'flake8 src/api tests',
    });

    // Add Docker-related tasks
    this.addTask('docker:build', {
      description: 'Build Docker image',
      exec: 'docker build -t bedrock-access-gateway .',
    });

    this.addTask('docker:run', {
      description: 'Run Docker container',
      exec: 'docker run -p 8000:8000 bedrock-access-gateway',
    });

    // Add a clean task that handles both TypeScript and Python artifacts
    this.addTask('clean', {
      description: 'Clean up all temporary build files',
      exec: 'rm -rf node_modules tmp .jsii cdk.out __pycache__ *.pyc .pytest_cache .coverage htmlcov',
    });
  }

  postSynthesize() {
    super.postSynthesize();
    execSync("node scripts/update-version.js", { stdio: "inherit" });
    // execSync("python scripts/update-python-exec.py", { stdio: "inherit" });
  }
}

const project = new BedrockAccessGatewayProject({});
project.synth();
