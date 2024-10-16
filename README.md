# Phidata AWS Templates

A collection of AWS templates for deploying AI Agents

## Collection:

- [Phidata OpenAI Agent Serverless API Basic](./phidata-agent-serverless-api-basic/README.md)
    
- [Phidata Bedrock Claude 3.5 Sonnet Agent Serverless API](./phidata-agent-serverless-api-bedrock/README.md)
    - A basic serverless API for interacting with the Phidata Agent using AWS Bedrock
    - The conversation gets stored in a DynamoDB table
    - AWS Bedrock as the LLM Provider
    - AWS Lambda to run the Phidata Agent
    - AWS API Gateway to expose the API

