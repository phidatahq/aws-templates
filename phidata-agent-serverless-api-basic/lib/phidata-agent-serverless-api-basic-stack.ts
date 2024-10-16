import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dotenv from 'dotenv';

dotenv.config();

export class PhidataAgentServerlessApiBasicStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const requiredEnvVars = [
        'OPENAI_API_KEY',
    ];

    for (const envVar of requiredEnvVars) {
        if (typeof process.env[envVar] !== 'string') {
            throw new Error(`${envVar} environment variable is not set`);
        }
    }
    
    const secret = new secretsmanager.Secret(this, 'EnvVarsSecret', {
        secretName: 'PhidataServerlessAgentSecrets',
        generateSecretString: {
            secretStringTemplate: JSON.stringify({
                OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            }),
            generateStringKey: 'ignore_this',
        }
    });        

    const processStatusTable = new dynamodb.Table(this, "PhidataServerlessAgentLogs", {
        partitionKey: { name: "processId", type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });


    const httpApi = new apigatewayv2.HttpApi(this, "PhidataServerlessAgentHttpApi", {
        corsPreflight: {
            allowHeaders: ['Content-Type', 'Authorization'],
            allowMethods: [apigatewayv2.CorsHttpMethod.POST, apigatewayv2.CorsHttpMethod.GET, apigatewayv2.CorsHttpMethod.OPTIONS],
            allowOrigins: ['*'],
        },
    });

    const agentLambda = new lambda.DockerImageFunction(this, "PhidataServerlessAgent", {
        code: lambda.DockerImageCode.fromImageAsset("./lambdas/agents"),
        memorySize: 1024 * 2,
        timeout: cdk.Duration.seconds(90),
        architecture: lambda.Architecture.X86_64,
        environment: {
            PROCESS_TABLE: processStatusTable.tableName,
            SECRET_STORAGE: secret.secretName,
        },
    });
         
               
    const initiatorLambda = new lambda.DockerImageFunction(this, "PhidataAgentInitiatorFunction", {
        code: lambda.DockerImageCode.fromImageAsset("./lambdas/initiator"),
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
        architecture: lambda.Architecture.X86_64,
        environment: {
            PROCESS_TABLE: processStatusTable.tableName,
            AGENT_FUNCTION_NAME: agentLambda.functionName,
        },
    });

    const statusCheckLambda = new lambda.DockerImageFunction(this, "PhidataAgentStatusCheckFunction", {
        code: lambda.DockerImageCode.fromImageAsset("./lambdas/poller"),
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
        architecture: lambda.Architecture.X86_64,
        environment: {
            PROCESS_TABLE: processStatusTable.tableName
        },
    });

    const lambdaInvokePolicyStatement = new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [
            initiatorLambda.functionArn,
            statusCheckLambda.functionArn,
            agentLambda.functionArn,
        ],
        effect: iam.Effect.ALLOW,
    });

    initiatorLambda.role?.attachInlinePolicy(new iam.Policy(this, 'InvokeLambdaPolicy', {
        statements: [lambdaInvokePolicyStatement],
    }));

    secret.grantRead(initiatorLambda);
    secret.grantRead(statusCheckLambda);
    secret.grantRead(agentLambda);
    
    processStatusTable.grantReadWriteData(statusCheckLambda);
    processStatusTable.grantReadWriteData(initiatorLambda);
    processStatusTable.grantReadWriteData(agentLambda);


    statusCheckLambda.grantInvoke(initiatorLambda);
    agentLambda.grantInvoke(initiatorLambda);

    httpApi.addRoutes({
        path: "/initiate/{type}",
        methods: [apigatewayv2.HttpMethod.POST],
        integration: new apigatewayv2Integrations.HttpLambdaIntegration("InitiatorIntegration", initiatorLambda),
    });

    const statusCheckIntegration = new apigatewayv2Integrations.HttpLambdaIntegration("StatusCheckIntegration", statusCheckLambda);
    httpApi.addRoutes({
        path: "/status/{processId}",
        methods: [apigatewayv2.HttpMethod.GET],
        integration: statusCheckIntegration,
    });

    const AgentIntegration = new apigatewayv2Integrations.HttpLambdaIntegration("AgentIntegration", agentLambda);
    httpApi.addRoutes({
        path: "/agent",
        methods: [HttpMethod.POST],
        integration: AgentIntegration,
    });

    new cdk.CfnOutput(this, "SecretName", {
        value: secret.secretName,
    });    

    new cdk.CfnOutput(this, "ProcessStatusTableName", {
        value: processStatusTable.tableName,
    });

    new cdk.CfnOutput(this, "HttpAPIUrl", {
        value: httpApi.url!,
    });
  }
}
