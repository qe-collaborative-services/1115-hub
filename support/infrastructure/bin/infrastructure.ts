#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as transfer from "aws-cdk-lib/aws-transfer";

interface ComputeStackProps extends StackProps {
  // vpc: ec2.IVpc;
  // database: rds.ServerlessCluster;
}

class ComputeStack extends Stack {
  readonly instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // create a vpc that we can put an ec2 and rds instance into
    const vpc = new ec2.Vpc(this, "VPC", {
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

    // Security Group for compute EC2
    const ec2SecurityGroup = new ec2.SecurityGroup(this, "Ec2SecurityGroup", {
      vpc: vpc,
      description: "Security group for compute EC2 instance",
      allowAllOutbound: true,
    });

    // Allow SSH access from a specific IP range, all for now
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access from a specific block"
    );
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allows HTTPS access from Internet"
    );

    // IAM Role for the EC2 Instance
    const role = new iam.Role(this, "Ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      // Add necessary managed policies or inline policies here
    });

    // EC2 Instance
    this.instance = new ec2.Instance(this, "ElevenFifteenComputeInstance", {
      vpc: vpc,
      instanceType: new ec2.InstanceType("t3.micro"),
      machineImage: ec2.MachineImage.genericLinux({
        "us-east-1": "ami-0133fb3dded749b65", // debian bullseye latest amd64
        // ...add other regions if necessary
        // view other ids here: https://wiki.debian.org/Cloud/AmazonEC2Image
      }),
      securityGroup: ec2SecurityGroup,
      role: role,
      // keyName is a temporary solution for testing
      keyName: "keys",
      // should use a key pair for production (or not include to block ssh access)
      // keyPair: new ec2.KeyPair(this, "ComputeInstanceKeyPair", {}),
      vpcSubnets: {
        subnetGroupName: "compute-subnet",
      },
    });

    // run commands on the instance for initial setup
    this.instance.userData.addCommands(
      "sudo apt-get update -y",
      "sudo apt-get upgrade -y",
      "sudo install -m 0755 -d /etc/apt/keyrings",
      "sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc",
      "sudo chmod a+r /etc/apt/keyrings/docker.asc",
      "sudo apt-get install apt-transport-https ca-certificates curl gnupg2 software-properties-common -y",
      "curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -",
      "sudo add-apt-repository 'deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable'",
      "sudo apt-get update -y",
      "sudo apt-get install docker-ce docker-ce-cli containerd.io -y",
      "curl -o ./pkgx --compressed -f --proto '=https' https://pkgx.sh/$(uname)/$(uname -m)",
      "sudo install -m 755 pkgx /usr/local/bin",
      "export PATH=$PATH:/home/admin/.local/bin",
      "pkgx install docker",
      "pkgx install docker-compose",
      "pkgx install git",
      "export PATH=$PATH:/home/admin/.local/bin",
      "git clone https://github.com/softservesoftware/1115-hub.git",
      "cd 1115-hub/support/infrastructure/containers",
      "sudo systemctl start docker",
      "docker-compose up --build"
    );
  }
}

const app = new cdk.App();
const compute = new ComputeStack(app, "ElevenFifteenInfrastructure", {});
app.synth();
