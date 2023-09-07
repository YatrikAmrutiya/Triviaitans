const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { UpdateCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    const { gameId } = event.pathParameters;
    const { gameName, difficulty, category, numQuestions, shortDescription, startTime } = event.body;

    // Fetch questions matching the updated category and difficulty
    const questionsParams = {
        TableName: "Questions",
        FilterExpression: "#category = :category AND #difficulty = :difficulty",
        ExpressionAttributeNames: { "#category": "category", "#difficulty": "difficulty" },
        ExpressionAttributeValues: { ":category": category, ":difficulty": difficulty },
    };

    const { Items: allQuestions } = await dynamoDocClient.send(new ScanCommand(questionsParams));

    const selectedQuestions = allQuestions.slice(0, numQuestions); // Get the desired number of questions

    const params = {
        TableName: "GameQuestions",
        Key: { gameId },
        UpdateExpression: "set #gameName = :gameName,#shortDescription = :shortDescription, #difficulty = :difficulty, #category = :category, #questions = :questions, #startTime = :startTime",
        ExpressionAttributeNames: {
            "#gameName": "gameName",
            "#shortDescription": "shortDescription",
            "#difficulty": "difficulty",
            "#category": "category",
            "#questions": "questions",
            "#startTime": "startTime",
        },
        ExpressionAttributeValues: {
            ":gameName": gameName,
            ":difficulty": difficulty,
            ":shortDescription": shortDescription,
            ":category": category,
            ":questions": selectedQuestions,
            ":startTime": startTime,
        },
        ReturnValues: "ALL_NEW",
    };

    try {
        const data = await dynamoDocClient.send(new UpdateCommand(params));
        const updatedGame = data.Attributes;

        return sendHTTPResponse(200, updatedGame);
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to update game." });
    }
};

module.exports = {
    handler: middy(handler).use(httpJsonBodyParser()),

};
