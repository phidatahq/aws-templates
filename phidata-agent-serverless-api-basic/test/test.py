import os
import httpx
import time
import json
import logging

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger()
logger.setLevel(logging.INFO)

api_url = os.getenv("AWS_API_GATEWAY_URL")

def make_api_request(url, method, body=None):
    headers = {'Content-Type': 'application/json'}
    try:
        if method == 'POST':
            response = httpx.post(url, headers=headers, data=json.dumps(body))
            print(f"POST request to {url} response:", response)
        elif method == 'GET':
            response = httpx.get(url, headers=headers)
        else:
            return None
        
        print(f"{method} request to {url} response:", response)
        if response:
            return response.json()
        else:
            print(f"{method} request to {url} failed with status: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error during {method} request to {url}:", e)
        return None

def test_initiate(test_type, payload):
    initiate_url = f"{api_url}/initiate/{test_type}"
    data = make_api_request(initiate_url, 'POST', payload)
    print(f"Initiate response: {data}")
    logger.info(f"Initiate response: {data}")
    return data["processId"] if data else None

def test_status(process_id):
    status_url = f"{api_url}/status/{process_id}"
    while True:
        result = make_api_request(status_url, 'GET')
        if result and result['status'] == 'COMPLETED':
            print(f"Status test passed. Result: {result.get('result')}")
            return result.get('result', None)
        elif result and result['status'] == 'FAILED':
            print('Status test failed. Process failed.')
            return None
        else:
            print(f"Process status: {result.get('status') if result else 'UNKNOWN'}. Waiting...")
            time.sleep(5)

# Example of usage
if __name__ == "__main__":
    data = {"question": "Write a paragraph about the benefits of using Phidata"}
    print("Question data type:", type(data))

    logger.info(f"Initiating test with payload: {data}")
    process_id = test_initiate('agent', data)
    if process_id:
        result = test_status(process_id)
        print("Final Result:", result)