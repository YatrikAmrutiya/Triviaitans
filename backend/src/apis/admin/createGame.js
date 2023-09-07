const { v4: uuidv4 } = require("uuid");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { sendMessageToSNSTopic } = require("../../lib/sns");

const handler = async (event) => {
    try {
        const { gameName, difficulty, category, numQuestions, shortDescription, startTime } = event.body;
        const gameId = uuidv4();

        // Fetch questions matching the specified category and difficulty
        const questionsParams = {
            TableName: "Questions",
            FilterExpression: "#category = :category AND #difficulty = :difficulty",
            ExpressionAttributeNames: {
                "#category": "category",
                "#difficulty": "difficulty"
            },
            ExpressionAttributeValues: { ":category": category, ":difficulty": difficulty },
        };

        const { Items: allQuestions } = await dynamoDocClient.send(new ScanCommand(questionsParams));
        const selectedQuestions = allQuestions.slice(0, numQuestions); // Get the desired number of questions

        const gameParams = {
            TableName: "GameQuestions",
            Item: {
                gameId,
                gameName,
                difficulty,
                category,
                questions: selectedQuestions,
                shortDescription,
                startTime
            },
        };

        await dynamoDocClient.send(new PutCommand(gameParams));

        const topicArn = `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID || event.requestContext.accountId}:NewGameAvailabilitySNSTopic`;
        await sendMessageToSNSTopic(topicArn, {
            gameId,
            gameName,
            startTime,
        });

        return sendHTTPResponse(200, {
            gameId,
            gameName,
            difficulty,
            category,
            questions: selectedQuestions
        });
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to create game." });
    }
};

module.exports = {
    handler: middy(handler).use(httpJsonBodyParser()),
};
