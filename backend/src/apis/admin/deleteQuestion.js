const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    const { id } = event.pathParameters;

    const params = {
        TableName: "Questions",
        Key: { id },
    };

    try {
        await dynamoDocClient.send(new DeleteCommand(params));

        return sendHTTPResponse(200, { message: `Question with ID '${id}' deleted successfully.` });
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to delete question." });
    }
};

module.exports = {
    handler: middy(handler).use(httpJsonBodyParser()),

};
