import boto3
import json

from datetime import datetime

def get_secret(secret_name, region_name):
    # Create a session using the specified profile
    session = boto3.Session()
    
    # Create a Secrets Manager client using the session
    client = session.client('secretsmanager', region_name=region_name)

    try:
        get_secret_value_response = client.get_secret_value(SecretId=secret_name)
    except Exception as e:
        raise Exception(f"Error retrieving secret {secret_name}: {e}")

    # Decrypts secret using the associated KMS key.
    secret = get_secret_value_response['SecretString']

    return json.loads(secret)

def update_dynamodb(table, process_id, status, additional_data=None):
    current_time = datetime.now().isoformat()
    update_expression = "SET #status = :status, #timestamp = :timestamp"
    expression_attribute_names = {
        "#status": "status",
        "#timestamp": "timestamp",
    }
    expression_attribute_values = {
        ":status": status,
        ":timestamp": current_time,
    }

    if additional_data:
        for key, value in additional_data.items():
            update_expression += f", #{key} = :{key}"
            expression_attribute_names[f"#{key}"] = key
            expression_attribute_values[f":{key}"] = value

    table.update_item(
        Key={"processId": process_id},
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expression_attribute_names,
        ExpressionAttributeValues=expression_attribute_values,
    )