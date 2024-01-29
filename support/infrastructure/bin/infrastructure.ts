#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/vpc-stack";
import { ComputeStack } from "../lib/compute-stack";
import { DatabaseStack } from "../lib/database-stack";

const app = new cdk.App();
const vpc = new VpcStack(app, "VpcStack", {});
const database = new DatabaseStack(app, "DatabaseStack", { vpc: vpc.vpc });
const compute = new ComputeStack(app, "ComputeStack", {
  vpc: vpc.vpc,
  database: database.database,
});
app.synth();
