"""This is the lambda function for get_data on the AWS server.
"""
import boto3
import json
import requests
from datetime import datetime
from botocore.exceptions import ClientError

s3 = boto3.client('s3')

def get_secret():

    secret_name = "mplus_login"
    region_name = "eu-central-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # For a list of exceptions thrown, see
        # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        raise e

    return json.loads(get_secret_value_response['SecretString'])
    



def lambda_handler(event, context):
    data = { 'test': "Hello World", 'date': datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}
    file_name = "test.json"
    bucket_name = "sammlung.kumu.swiss"
    s3.put_object(Bucket=bucket_name, Key=file_name, Body=json.dumps(data))
    secret = get_secret()
    print(secret['url'])
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
