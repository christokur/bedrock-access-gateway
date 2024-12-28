import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BedrockProxyBaseStack, BedrockProxyBaseStackProps } from './base-stack';
import { Construct } from 'constructs';

export class BedrockProxyLambdaStack extends BedrockProxyBaseStack {
  constructor(scope: Construct, id: string, props?: BedrockProxyBaseStackProps) {
    super(scope, id, props);

    // Create Lambda function in private subnet
    const handler = new lambda.Function(this, 'ProxyApiHandler', {
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      handler: 'app.handler',
      code: lambda.Code.fromAsset('src/api'),
      environment: {
        API_KEY: this.apiKey,
      },
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Create REST API
    const api = new apigw.RestApi(this, 'ProxyApi', {
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Add proxy integration
    api.root.addProxy({
      defaultIntegration: new apigw.LambdaIntegration(handler),
    });

    // Add outputs
    this.exportValue(api.url, {
      name: 'ApiEndpoint',
      description: 'API Gateway endpoint URL',
    });
  }
}
