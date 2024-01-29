import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class VpcStack extends Stack {
  readonly vpc: ec2.IVpc;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // create a vpc that we can put an ec2 and rds instance into
    this.vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: 3, // Default is all AZs in region
      subnetConfiguration: [
        // we should also create a management subnet eventually
        {
          cidrMask: 24,
          name: "compute-subnet",
          // when management infra is created, this can be PRIVATE_ISOLATED
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "data-subnet",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
