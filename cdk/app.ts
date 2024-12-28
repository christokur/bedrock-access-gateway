#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib';
import { BedrockProxyLambdaStack } from './lib/bedrock-proxy-lambda-stack';
import { BedrockProxyFargateStack } from './lib/bedrock-proxy-fargate-stack';

const VERSION = '0.1.0';
const OWNER = 'sands@christodelange.com';

const app = new App({
  context: {
    appName: 'BedrockAccessGateway',
    description: 'A FastAPI-based secure gateway for AWS Bedrock AI models',
    environment: process.env.NODE_ENV || 'development',
    owner: OWNER,
    version: VERSION,
  }
});

// Add tags to all resources
Tags.of(app).add('Project', 'bedrock-access-gateway');
Tags.of(app).add('Environment', app.node.tryGetContext('environment'));
Tags.of(app).add('Owner', app.node.tryGetContext('owner'));
Tags.of(app).add('ManagedBy', 'cdk');
Tags.of(app).add('Version', VERSION);

// Get deployment type from context, default to 'lambda'
const deploymentType = app.node.tryGetContext('deploymentType') || 'lambda';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// Create stack based on deployment type
switch (deploymentType.toLowerCase()) {
  case 'fargate':
    new BedrockProxyFargateStack(app, 'BedrockProxyFargate', { 
      env,
      description: 'Bedrock Access Gateway - Fargate deployment',
      tags: {
        DeploymentType: 'fargate',
      },
    });
    break;
  case 'lambda':
  default:
    new BedrockProxyLambdaStack(app, 'BedrockProxy', { 
      env,
      description: 'Bedrock Access Gateway - Lambda deployment',
      tags: {
        DeploymentType: 'lambda',
      },
    });
    break;
}

app.synth();
