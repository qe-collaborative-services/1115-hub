import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface ComputeStackProps extends StackProps {
  vpc: ec2.IVpc;
  database: rds.ServerlessCluster;
}

export class ComputeStack extends Stack {
  readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // Security Group for EC2
    const ec2SecurityGroup = new ec2.SecurityGroup(this, "Ec2SecurityGroup", {
      vpc: props.vpc,
      description: "Security group for EC2 instance",
      allowAllOutbound: false,
    });

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.ipv4("108.198.190.77/32"),
      ec2.Port.tcp(22),
      "Allow SSH access from a specific IP"
    );

    // Security Group for RDS
    const rdsSecurityGroup = new ec2.SecurityGroup(this, "RdsSecurityGroup", {
      vpc: props.vpc,
      description: "Security group for RDS cluster",
      allowAllOutbound: false,
    });

    // Allow EC2 to communicate with RDS
    rdsSecurityGroup.addIngressRule(
      ec2SecurityGroup,
      ec2.Port.tcp(5432),
      "Allow EC2 to access RDS PostgreSQL"
    );

    // Attach the security group to the RDS Serverless Cluster
    props.database.connections.addSecurityGroup(rdsSecurityGroup);

    // IAM Role for the EC2 Instance
    const role = new iam.Role(this, "Ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      // Add necessary managed policies or inline policies here
    });

    // EC2 Instance
    this.instance = new ec2.Instance(this, "1115ComputeInstance", {
      vpc: props.vpc,
      instanceType: new ec2.InstanceType("t3.micro"),
      machineImage: ec2.MachineImage.genericLinux({
        "us-east-1": "ami-0133fb3dded749b65", // debian bullseye latest amd64
        // ...add other regions if necessary
        // view other ids here: https://wiki.debian.org/Cloud/AmazonEC2Image
      }),
      securityGroup: ec2SecurityGroup,
      role: role,
      vpcSubnets: {
        subnetGroupName: "compute-subnet",
      },
    });
  }
}
