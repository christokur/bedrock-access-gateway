import { AwsCdkTypeScriptApp } from 'projen/lib/awscdk';
import { NodePackageManager } from 'projen/lib/javascript';

class BedrockAccessGatewayProject extends AwsCdkTypeScriptApp {
  constructor(options = {}) {
    super({
      authorName: 'Christo De Lange',
      authorEmail: 'sands@christodelange.com',
      cdkVersion: '2.171.1',
      defaultReleaseBranch: 'main',
      name: 'bedrock-access-gateway',
      description: 'A FastAPI-based secure gateway for AWS Bedrock AI models',
      repository: 'git@github.com:christokur/bedrock-access-gateway.git',
      license: 'Apache-2.0',
      projenrcTs: true,
      packageManager: NodePackageManager.NPM,
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
      ],
      deps: [
        'aws-cdk-lib',
        'constructs',
        '@aws-cdk/aws-apigatewayv2-alpha',
        '@aws-cdk/aws-apigatewayv2-integrations-alpha',
      ],
      devDeps: [
        'projen@^0.91.0',
        '@types/node@^20.0.0',
        'esbuild@^0.19.0',
        'ts-node@^10.9.0',
        'typescript@~5.3.0',
      ],
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
      ...options,
    });

    // Add Python-specific configurations
    this.addTask('start', {
      description: 'Start the FastAPI server',
      exec: 'uvicorn src.api.app:app --reload',
    });

    this.addTask('test', {
      description: 'Run Python tests',
      exec: 'pytest',
    });

    this.addTask('lint', {
      description: 'Run Python linting',
      exec: 'flake8 src tests',
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

    // Add a clean task
    this.addTask('clean', {
      description: 'Clean up temporary build files',
      exec: 'rm -rf node_modules package-lock.json yarn.lock tmp .jsii cdk.out',
    });
  }
}

const project = new BedrockAccessGatewayProject({});
project.synth();
