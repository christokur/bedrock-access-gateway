import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BedrockProxyBaseStack, BedrockProxyBaseStackProps } from './base-stack';
import { Construct } from 'constructs';

export class BedrockProxyFargateStack extends BedrockProxyBaseStack {
  constructor(scope: Construct, id: string, props?: BedrockProxyBaseStackProps) {
    super(scope, id, props);

    // Create ECS cluster
    const cluster = new ecs.Cluster(this, 'ProxyCluster', {
      vpc: this.vpc,
    });

    // Build Docker image
    const image = new ecr_assets.DockerImageAsset(this, 'ProxyImage', {
      directory: 'src/api',
    });

    // Create Fargate service
    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'ProxyService',
      {
        cluster,
        memoryLimitMiB: 1024,
        cpu: 512,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromDockerImageAsset(image),
          environment: {
            API_KEY: this.apiKey,
          },
          containerPort: 8000,
        },
        publicLoadBalancer: true,
      }
    );

    // Configure health check
    service.targetGroup.configureHealthCheck({
      path: '/health',
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
      timeout: cdk.Duration.seconds(10),
      interval: cdk.Duration.seconds(30),
    });

    // Add security group rule for the container
    service.service.connections.allowFromAnyIpv4(
      ec2.Port.tcp(8000),
      'Allow inbound HTTP traffic'
    );

    // Add outputs
    this.exportValue(service.loadBalancer.loadBalancerDnsName, {
      name: `${this.stackName}Endpoint`,
      description: 'Load balancer DNS name',
    });
  }
}
