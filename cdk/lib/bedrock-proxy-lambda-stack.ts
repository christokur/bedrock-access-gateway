import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    // Get entrypoint type from context, default to 'apigateway'
    const entrypoint = this.node.tryGetContext('entrypoint') || 'apigateway';

    switch (entrypoint.toLowerCase()) {
      case 'alb':
        // Create Application Load Balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, 'ProxyALB', {
          vpc: this.vpc,
          internetFacing: true,
          securityGroup: new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
            vpc: this.vpc,
            description: 'Security group for ALB',
            allowAllOutbound: true,
          }),
        });

        // Create target group with health check
        const targetGroup = new elbv2.ApplicationTargetGroup(this, 'ProxyTargetGroup', {
          vpc: this.vpc,
          port: 80,
          targetType: elbv2.TargetType.LAMBDA,
          targets: [new targets.LambdaTarget(handler)],
          healthCheck: {
            enabled: true,
            path: '/api/v1/health',
            healthyHttpCodes: '200',
            interval: cdk.Duration.seconds(30),
            timeout: cdk.Duration.seconds(5),
          },
        });

        // Add explicit Lambda permission for ALB
        handler.addPermission('AllowAlbInvoke', {
          principal: new iam.ServicePrincipal('elasticloadbalancing.amazonaws.com'),
          action: 'lambda:InvokeFunction',
          sourceArn: targetGroup.targetGroupArn,
        });

        // Add HTTP listener (default)
        const listener = alb.addListener('HttpListener', {
          port: 80,
          defaultAction: elbv2.ListenerAction.forward([targetGroup]),
        });

        // Allow inbound HTTP from anywhere to ALB
        alb.connections.allowFromAnyIpv4(ec2.Port.tcp(80), 'Allow HTTP inbound');

        // Output the ALB DNS and endpoint URL
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
          value: alb.loadBalancerDnsName,
          description: 'Application Load Balancer DNS Name',
        });

        new cdk.CfnOutput(this, 'ApiEndpoint', {
          value: `http://${alb.loadBalancerDnsName}/api/v1`,
          description: 'API Endpoint URL',
        });
        break;

      case 'apigateway':
      default:
        // Create API Gateway
        const api = new apigw.LambdaRestApi(this, 'ProxyApi', {
          handler: handler,
          proxy: true,
          deployOptions: {
            stageName: 'prod',
          },
        });

        // Output the API Gateway URL
        new cdk.CfnOutput(this, 'ApiGatewayUrl', {
          value: api.url,
          description: 'API Gateway URL',
        });
        break;
    }
  }
}
