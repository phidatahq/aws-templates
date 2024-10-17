import json
import uuid
import boto3
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(format=LOG_FORMAT)


dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda')

def handler(event, context):
    
    function_type = event['pathParameters']['type']
    if function_type == 'agent':
        lambda_function_name = os.environ['AGENT_FUNCTION_NAME']
    else:
        return {'statusCode': 400, 'body': 'Invalid function type'}

    request_body = json.loads(event['body'])

    logger.info(f"Request body: {request_body}")
    process_id = str(uuid.uuid4())
    process_table = dynamodb.Table(os.environ['PROCESS_TABLE'])
    process_table.put_item(Item={
        'processId': process_id,
        'status': 'PENDING',
        'agent': function_type,
        'input': request_body.get('question', ''),
        'username': request_body.get('username', '')
    })

    lambda_client.invoke(
        FunctionName=lambda_function_name,
        InvocationType='Event',
        Payload=json.dumps({
            'processId': process_id,
            'question': request_body.get('question', ''),
            'username': request_body.get('username', ''),
            'session_id': request_body.get('session_id', ''),
        })
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'processId': process_id})
    }