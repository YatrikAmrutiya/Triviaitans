const { dynamoDocClient } = require("../../lib/dynamoDB");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 * This function handles the retrieval of user statistics from the DynamoDB table based on the user's username.
 * @param {import("aws-lambda").APIGatewayEvent} event - The API Gateway event containing the username in the path parameters.
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>} - The response object containing the HTTP status code and user statistics.
 */
const handler = async (event) => {
    try {
        // Extract the username from the path parameters of the API Gateway event
        const { userName } = event.pathParameters;

        // Prepare the QueryCommand to fetch user statistics from DynamoDB based on the username
        const queryCommand = new QueryCommand({
            TableName: "game-answers",
            IndexName: "userName-index",
            KeyConditionExpression: "userName = :e",
            ExpressionAttributeValues: {
                ":e": userName,
            },
        });

        // Send the QueryCommand to DynamoDB to retrieve user statistics
        const response = await dynamoDocClient.send(queryCommand);

        // Initialize variables to store user statistics
        let totalPoints = 0;
        const pointsByCategory = {};
        const gameCount = new Set();

        // Process the response and calculate user statistics
        if (response.Items && response.Items.length > 0) {
            response.Items.forEach((item) => {
                totalPoints += item.points;
                if (pointsByCategory[item.category]) {
                    pointsByCategory[item.category] += item.points;
                } else {
                    pointsByCategory[item.category] = item.points;
                }
                gameCount.add(item.gameId);
            });

            const totalGames = gameCount.size;

            const userStats = {
                totalPoints,
                pointsByCategory,
                totalGames,
            };

            // Return the user statistics in the response
            return sendHTTPResponse(200, userStats);
        } else {
            // If no matching user statistics are found
            return sendHTTPResponse(404, { error: "User not found" });
        }
    } catch (error) {
        // Handle errors and return an error response
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during retrieving user statistics." });
    }
};

// Export the handler wrapped with Middy middleware for JSON body parsing
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
