const { v4: uuidv4 } = require("uuid");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const { question, category, difficulty, options, correctAnswer, tags, explaination } = event.body;
        const id = uuidv4();

        const params = {
            TableName: "Questions",
            Item: {
                id,
                question,
                category,
                difficulty,
                options,
                correctAnswer,
                tags,
                explaination
            },
        };

        await dynamoDocClient.send(new PutCommand(params));

        return sendHTTPResponse(200, { id, question, category, difficulty, options, correctAnswer, tags, explaination });
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to create question." });
    }
};

module.exports = {
    handler: middy(handler).use(httpJsonBodyParser()),
};
