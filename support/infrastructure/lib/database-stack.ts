import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface DatabaseStackProps extends StackProps {
  vpc: ec2.IVpc;
}

export class DatabaseStack extends Stack {
  readonly database: rds.ServerlessCluster;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Security group for RDS
    const securityGroup = new ec2.SecurityGroup(this, "DatabaseSecurityGroup", {
      vpc: props.vpc,
      description: "Security group for RDS Serverless Database",
      allowAllOutbound: false,
    });

    // RDS Serverless Cluster
    this.database = new rds.ServerlessCluster(this, "Database", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_2,
      }),
      defaultDatabaseName: "myDatabase",
      vpc: props.vpc,
      vpcSubnets: {
        subnetGroupName: "data-subnet",
      },
      securityGroups: [securityGroup],
      scaling: {
        autoPause: Duration.minutes(5),
        minCapacity: rds.AuroraCapacityUnit.ACU_2,
        maxCapacity: rds.AuroraCapacityUnit.ACU_16, // Adjusted to default max capacity
      },
      credentials: rds.Credentials.fromGeneratedSecret("masterUsername"), // Adjust username as necessary
      // Additional options like backup and maintenance can be added here
    });
  }
}
