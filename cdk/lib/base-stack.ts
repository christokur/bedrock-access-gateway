import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface BedrockProxyBaseStackProps extends cdk.StackProps {
  apiKeyParam?: string;
}

export class BedrockProxyBaseStack extends cdk.Stack {
  protected vpc: ec2.Vpc;
  protected apiKey: string;

  constructor(scope: Construct, id: string, props?: BedrockProxyBaseStackProps) {
    super(scope, id, props);

    // Create VPC with both public and private subnets
    this.vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Get API Key from SSM Parameter Store or use default
    const apiKeyParam = props?.apiKeyParam || '';
    if (apiKeyParam) {
      const param = ssm.StringParameter.fromStringParameterName(
        this,
        'ApiKeyParam',
        apiKeyParam
      );
      this.apiKey = param.stringValue;
    } else {
      this.apiKey = 'default-key'; // Replace with your default key logic
    }
  }
}
