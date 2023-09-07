// Get team statistics for a given team from game_answers table

const { dynamoDocClient } = require("../../lib/dynamoDB");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 *
 * @param {import("aws-lambda").APIGatewayEvent} event
 * @returns
 */
const handler = async (event) => {
    try {
        const { teamId } = event.pathParameters;

        const queryCommand = new QueryCommand({
            TableName: "game-answers",
            IndexName: "teamId-index",
            KeyConditionExpression: "teamId = :e",
            ExpressionAttributeValues: {
                ":e": teamId,
            },
        });

        const response = await dynamoDocClient.send(queryCommand);

        let totalPoints = 0;
        const pointsByCategory = {};
        const gameCount = new Set();

        if (response.Items && response.Items.length > 0) {
            response.Items.forEach((item) => {
                console.log(item.points);
                totalPoints += item.points;
                if (pointsByCategory[item.category]) {
                    pointsByCategory[item.category] += item.points;
                }
                else {
                    pointsByCategory[item.category] = item.points;
                }
                gameCount.add(item.gameId);
            });

            const totalGames = gameCount.size;

            const teamStats = {
                totalPoints,
                pointsByCategory,
                totalGames,
            };
            console.log(teamStats);

            return sendHTTPResponse(200, teamStats);
        }

        else {
            // If no matching team is found
            return sendHTTPResponse(404, { error: "No statistics for this team" });
        }
    }
    catch (error) {
        console.error(error);
        return sendHTTPResponse(500, { error: error.message });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };


