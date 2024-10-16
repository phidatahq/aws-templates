import os
import json
import logging

import boto3

from utils import update_dynamodb

from phi.agent import Agent, RunResponse  # noqa
from phi.model.aws.claude import Claude

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def handler(event, context):
    process_id = event["processId"]
    question = event["question"]

    dynamodb = boto3.resource("dynamodb")
    process_table = dynamodb.Table(os.environ["PROCESS_TABLE"])

    # Update the process status to 'PROCESSING' in DynamoDB
    update_dynamodb(process_table, process_id, "PROCESSING")

    try:

        agent = Agent(model=Claude(id="anthropic.claude-3-5-sonnet-20240620-v1:0"), markdown=True)

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