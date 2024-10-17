import boto3
import json

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