import os
import json
import logging

import boto3

from utils import get_secret, update_dynamodb

from phi.agent import Agent, RunResponse  # noqa
from phi.model.openai import OpenAIChat

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

secret_name = "PhidataServerlessAgentSecrets"
secret_storage = os.environ["SECRET_STORAGE"]
region_name = "us-east-1"

secret = get_secret(secret_name, region_name)
api_key = secret["OPENAI_API_KEY"]

def handler(event, context):
    process_id = event["processId"]
    question = event["question"]

    dynamodb = boto3.resource("dynamodb")
    process_table = dynamodb.Table(os.environ["PROCESS_TABLE"])

    # Update the process status to 'PROCESSING' in DynamoDB
    update_dynamodb(process_table, process_id, "PROCESSING")

    try:

        agent = Agent(model=OpenAIChat(id="gpt-4o", api_key=api_key), markdown=True)

        # Get the response in a variable
        run: RunResponse = agent.run(question)
        res = run.content

        # Update the process status to 'COMPLETED' and store the result in DynamoDB
        update_dynamodb(process_table, process_id, "COMPLETED", {"result": json.dumps(res)})

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Process completed successfully"}),
            "headers": {"Content-Type": "application/json"},
        }
    except Exception as e:
        # Update the process status to 'FAILED' in DynamoDB if an error occurs
        update_dynamodb(process_table, process_id, "FAILED", {"error": str(e)})
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "An error occurred during processing"}),
            "headers": {"Content-Type": "application/json"},
        }