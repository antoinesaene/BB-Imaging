'use strict'
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-2" });

exports.handler = async (event, context) =>
{
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

    let responseBody = "";
    let statusCode = 0;

    //. Get the study id to retrieve
    const { studyid } = event.pathParameters;

    //. build the query params object
    const params = {
        TableName: "study",
        Key: {
            studyID: studyid
        }
    }

    try 
    {
        //. Query the db
        const data = await documentClient.get(params).promise();
        responseBody = JSON.stringify(data.Item);
        statusCode = 200;
    }
    catch (e) 
    {
        responseBody = "Failed to get study data";
        statusCode = 403;
    }

    //. Build the response object
    const response = {
        statusCode: statusCode,
        body: responseBody
    }

    return response;
}