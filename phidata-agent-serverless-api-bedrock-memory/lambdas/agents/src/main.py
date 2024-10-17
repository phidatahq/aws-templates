import os
import json
import logging

import boto3

from utils import update_dynamodb

from phi.agent import Agent, RunResponse  # noqa
from phi.model.aws.claude import Claude
from phi.storage.agent.dynamodb import DynamoDbAgentStorage

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def handler(event, context):
    process_id = event["processId"]
    question = event["question"]
    username = event["username"]
    session_id = event["session_id"]

    dynamodb = boto3.resource("dynamodb")
    process_table = dynamodb.Table(os.environ["PROCESS_TABLE"])
    session_table = os.environ["SESSION_TABLE"]

    storage = DynamoDbAgentStorage(table_name=session_table, region_name="us-east-1")

    # Update the process status to 'PROCESSING' in DynamoDB
    update_dynamodb(process_table, process_id, "PROCESSING")

    try:

        agent = Agent(
            session_id=session_id,
            user_id=username,
            model=Claude(id="anthropic.claude-3-5-sonnet-20240620-v1:0"), 
            storage=storage,
            read_chat_history=True,
            add_history_to_messages=True,
            add_datetime_to_instructions=True,               
        )

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