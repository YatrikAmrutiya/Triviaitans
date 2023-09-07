const { dynamoDocClient } = require("../../lib/dynamoDB");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpEventNormalizer = require("@middy/http-event-normalizer");

const handler = async (event) => {
    try {
        // @ts-ignore
        const { gameId } = event.pathParameters;

        const getAllAnswersCommand = new ScanCommand({
            TableName: "game-answers",
            FilterExpression: "gameId = :gameId",
            ExpressionAttributeValues: {
                ":gameId": gameId,
            }
        });

        const getAllAnswersResult = await dynamoDocClient.send(getAllAnswersCommand);

        const allAnswers = getAllAnswersResult.Items;

        if (!allAnswers) {
            return sendHTTPResponse(404, { error: "No answers found." });
        }

        /**
         * @typedef {object} TeamStatisticsRow
         * @property {string} teamId
         * @property {string} teamName
         * @property {number} points
         */


        /**
         * @type {Array<TeamStatisticsRow>}
         */
        const inGameTeamPerformance = [];

        /**
         * @typedef {object} PlayerStatisticsRow
         * @property {string} userId
         * @property {string} userName
         * @property {number} points
         */


        /**
         * @type {Array<PlayerStatisticsRow>}
         */
        const inGamePlayerPerformance = [];

        for (const answer of allAnswers) {
            if (!inGameTeamPerformance.find((team) => team.teamId === answer.teamId)) {
                inGameTeamPerformance.push({
                    teamId: answer.teamId,
                    teamName: answer.teamName,
                    points: answer.points,
                });
            }
            else {
                const teamIndex = inGameTeamPerformance.findIndex((team) => team.teamId === answer.teamId);
                inGameTeamPerformance[teamIndex].points += answer.points;
            }

            if (!inGamePlayerPerformance.find((player) => player.userId === answer.userId)) {
                inGamePlayerPerformance.push({
                    userId: answer.userId,
                    userName: answer.userName,
                    points: answer.points,
                });
            }
            else {
                const playerIndex = inGamePlayerPerformance.findIndex((player) => player.userId === answer.userId);
                inGamePlayerPerformance[playerIndex].points += answer.points;
            }
        }

        const sortedInGameTeamPerformance = inGameTeamPerformance.sort((a, b) => b.points - a.points);
        const sortedInGamePlayerPerformance = inGamePlayerPerformance.sort((a, b) => b.points - a.points);

        return sendHTTPResponse(200, {
            inGameTeamPerformance: sortedInGameTeamPerformance,
            inGamePlayerPerformance: sortedInGamePlayerPerformance,
        });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "Something went wrong." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()).use(httpEventNormalizer()) };
