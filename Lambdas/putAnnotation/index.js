'use strict'
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-2" });

exports.handler = async (event, context) =>
{
    const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-2" });

    let responseBody = "";
    let statusCode = 0;

    //. Read the parameters from the body
    const { frameid, annotationTemplate, toolType, coordinates } = JSON.parse(event.body);

    //. build the query params object
    const frameparams = {
        TableName: "frame",
        Key: {
            frameid: frameid
        }
    }

    try 
    {
        //. Get the frame to update
        const framedata = await documentClient.get(frameparams).promise();
      
        if (!framedata)
        {
            //. No frame found
            responseBody = "No frame found";
            statusCode = 403;    
        }
        else
        {
            //. The frame is found, add the annotation to it

            //. Create the update params by adding the list of new annotations to the existing one
            var updateparams = 
            {
                TableName: "frame",
                Key: { frameid : frameid },
                UpdateExpression: "SET #attributes = list_append(#attributes, :values)",
                ExpressionAttributeNames: 
                {
                    "#attributes": "annotations"
                },
                ExpressionAttributeValues:
                {
                    ":values": [ 
                        {
                            annotationTemplate: annotationTemplate,
                            toolType: toolType,
                            coordinates:
                            {
                                "x1": coordinates.x1,
                                "x2": coordinates.x2,
                                "y1": coordinates.y1,
                                "y2": coordinates.y2
                            }
                        } ]
                },
                ReturnValues: "UPDATED_NEW"
            }
            
            //. And run the update
            const updatedata = await documentClient.update(updateparams).promise(); 
            
            responseBody = JSON.stringify(updatedata);
            statusCode = 200;
        }
    }
    catch (e) 
    {
        responseBody = "Failed to put annotation data: " + e;
        statusCode = 403;
    }

    //. Build the response object
    const response = {
        statusCode: statusCode,
        body: responseBody
    }

    return response;
}