# Phidata Agent Serverless API Basic

* A basic serverless API for interacting with the Phidata Agent
* The conversation gets stored in a DynamoDB table
* AWS Secrets Manager to store the OpenAI API Key
* AWS Lambda to run the Phidata Agent
* AWS API Gateway to expose the API

<img
  src="https://github.com/phidatahq/aws-templates/blob/main/assets/phidata-agent-serverless-basic-api.png"
  style="border-radius: 8px;"
/>

## Prerequisites

* [AWS Account](https://aws.amazon.com/free/)
* [Install NodeJS 18+](https://nodejs.org/en/download/)
* [Install Python 3.10+](https://www.python.org/downloads/)
* [Install AWS CLI](https://aws.amazon.com/cli/)
* [Authenticate AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
* [OpenAI API Key](https://platform.openai.com/api-keys)
* [Install CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html)

## Steps

1. Change directory to phidata-agent-serverless-api-basic
```
cd phidata-agent-serverless-api-basic
```

2. Add .env file from .env-template and add your OpenAI API Key

```
cp .env-template .env
```

3. Install dependencies

```
npm install
```

4. Bootstrap the stack

```
cdk bootstrap
```


5. Deploy the stack

```
cdk deploy
```

Once you've completed testing, you can remove the deployed resources by destroying the stack

```
cdk destroy
```

## Test the API

1. Get the API URL from the output of the cdk deploy command
```
PhidataAgentServerlessApiBasicStack.HttpAPIUrl = https://1djpu9.execute-api.us-east-1.amazonaws.com/
```

2. Change directory to phidata-agent-serverless-api-basic/test
```
cd test
```

3. Create a .env file from .env-template
```
cp .env-template .env
```

4. Paste the URL into the .env file

5. Create a virtual environment and install dependencies
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. Run the test
```
python test.py
```


## Useful CDK commands
The `cdk.json` file tells the CDK Toolkit how to execute your app.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
