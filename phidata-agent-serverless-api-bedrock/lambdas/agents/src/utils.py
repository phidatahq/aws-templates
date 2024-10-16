import boto3
import json

from datetime import datetime

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