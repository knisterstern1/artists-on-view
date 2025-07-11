import boto3
import json
import requests
from datetime import datetime
from botocore.exceptions import ClientError

s3 = boto3.client('s3')

XML_SEARCH = b'<?xml version="1.0" encoding="UTF-8"?> \
    <application xmlns="http://www.zetcom.com/ria/ws/module/search" \
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
                 xsi:schemaLocation="http://www.zetcom.com/ria/ws/module/search http://www.zetcom.com/ria/ws/module/search/search_1_1.xsd"> \
                 <modules> \
                    <module name="Person"> \
                        <search limit="7000" offset="0"> \
                            <expert> \
                                <or> \
                                    <startsWithField fieldPath="PerObjectRef.ObjCurrentLocationVrt" operand="HB"/> \
                                    <startsWithField fieldPath="PerObjectRef.ObjCurrentLocationVrt" operand="NB"/> \
                                    <startsWithField fieldPath="PerObjectRef.ObjCurrentLocationVrt" operand="GW"/> \
                                </or> \
                            </expert> \
                            <sort> \
                                <field fieldPath="PerSurNameTxt" direction="Ascending"/> \
                            </sort> \
                        </search> \
                    </module> \
                </modules> \
    </application>'

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
        raise e
    return json.loads(get_secret_value_response['SecretString'])
    
def get_artists_on_view(login_data):
    session = requests.Session()
    session.auth = (f'user[{login_data["user"]}]', f'password[{login_data["password"]}]')
    headers = {'Content-Type':'application/xml; charset=UTF-8'}
    url = login_data['url'] + '/ria-ws/application/module/Person/export/' + login_data['export']
    response = session.post(url, data=XML_SEARCH, headers=headers)
    if response.status_code == 200:
        return json.loads(response.content)
    else:
        raise Exception(response.status_code)

def lambda_handler(event, context):
    data = { 'startDate': datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}
    file_name = "artists.json"
    bucket_name = "sammlung.kumu.swiss"
    secret = get_secret()
    try:
        data['artists'] = get_artists_on_view(secret)
        data['status'] = 'success'
    except Exception as e:
        data['status'] = 'fail'
    data['endDate'] = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    s3.put_object(Bucket=bucket_name, Key=file_name, Body=json.dumps(data))
    
    return {
        'statusCode': 200,
        'body': json.dumps(data['status'])
    }
