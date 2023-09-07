const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async () => {
    try {
        const params = {
            TableName: "Questions",
        };

        const data = await dynamoDocClient.send(new ScanCommand(params));
        const questions = data.Items;

        return sendHTTPResponse(200, questions);
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to get questions." });
    }
};

module.exports = {
    handler: middy(handler).use(httpJsonBodyParser()),


};
