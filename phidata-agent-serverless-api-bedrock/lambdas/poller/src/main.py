import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    # Get the process ID from the path parameters
    process_id = event['pathParameters']['processId']
    
    # Retrieve the process status from DynamoDB
    process_table = dynamodb.Table(os.environ['PROCESS_TABLE'])
    response = process_table.get_item(Key={'processId': process_id})
    
    # Check if the process exists
    if 'Item' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Process not found'})
        }
    
    # Get the process status and result
    process_item = response['Item']
    process_id = process_item['processId']
    process_status = process_item.get('status', 'PENDING')
    process_result = process_item.get('result', None)
    
    # Return the process status and result
    return {
        'statusCode': 200,
        'body': json.dumps({
            'processId': process_id,
            'status': process_status,
            'result': process_result,
        })
    }