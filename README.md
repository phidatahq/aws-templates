# Phidata AWS Templates

A collection of AWS templates for deploying AI Agents

## Collection:

1. [Phidata OpenAI Agent Serverless API Basic](./phidata-agent-serverless-api-basic/README.md)
    - A basic serverless API for interacting with the Phidata Agent
    - The conversation gets stored in a DynamoDB table
    - AWS Secrets Manager to store the OpenAI API Key
    - AWS Lambda to run the Phidata Agent
    - AWS API Gateway to expose the API
    
2. [Phidata Bedrock Claude 3.5 Sonnet Agent Serverless API](./phidata-agent-serverless-api-bedrock/README.md)
    - A basic serverless API for interacting with the Phidata Agent using AWS Bedrock
    - The conversation gets stored in a DynamoDB table
    - AWS Bedrock as the LLM Provider
    - AWS Lambda to run the Phidata Agent
    - AWS API Gateway to expose the API

