'use strict'
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-2" });

exports.handler = async (event, context) =>
{
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

    let responseBody = "";
    let statusCode = 0;

    //. Get the frame id to retrieve
    const { frameid } = event.pathParameters;

    //. build the query params object
    const frameparams = {
        TableName: "frame",
        Key: {
            frameid: frameid
        }
    }

    try 
    {
        //. Query the db to get the frame
        const framedata = await documentClient.get(frameparams).promise();
        
        responseBody = JSON.stringify(framedata.Item);
        statusCode = 200;
    }
    catch (e) 
    {
        responseBody = "Failed to get frame data";
        statusCode = 403;
    }

    //. Build the response object
    const response = {
        statusCode: statusCode,
        body: responseBody
    }

    return response;
}