const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const { question, category, difficulty, options, correctAnswer, tags } = event.body;

        const params = {
            TableName: "Questions",
            Key: { id },
            UpdateExpression: "set #question = :question, #category = :category, #difficulty = :difficulty, #options = :options, #correctAnswer = :correctAnswer, #tags = :tags",
            ExpressionAttributeNames: {
                "#question": "question",
                "#category": "category",
                "#difficulty": "difficulty",
                "#options": "options",
                "#correctAnswer": "correctAnswer",
                "#tags": "tags",
            },
            ExpressionAttributeValues: {
                ":question": question,
                ":category": category,
                ":difficulty": difficulty,
                ":options": options,
                ":correctAnswer": correctAnswer,
                ":tags": tags,
            },
            ReturnValues: "ALL_NEW",
        };

        const data = await dynamoDocClient.send(new UpdateCommand(params));
        const updatedQuestion = data.Attributes;

        return sendHTTPResponse(200, updatedQuestion);
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to update question." });
    }
};

module.exports = {
    handler: middy(handler).use(httpJsonBodyParser()),

};
