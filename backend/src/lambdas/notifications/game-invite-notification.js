const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { v4: uuidV4 } = require("uuid");
const { sendHTTPResponse } = require("../../lib/api");

/**
 * This lambda is triggered whenever someone from team join a game. The lambda will push a notification in the
 * notification table for all users with a timestamp from that team, notification type, and a link to the game page
 * @param {import("aws-lambda").SQSEvent} event
 */

exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { gameId, teamId } = JSON.parse(Message);
        const id = uuidV4();

        // get game details from the game table

        const getGameCommand = new GetCommand({
            TableName: "GameQuestions",
            Key: {
                gameId,
            },
        });

        const response = await dynamoDocClient.send(getGameCommand);

        if (!response.Item) {
            return sendHTTPResponse(404, { error: "Game not found" });
        }

        const game = response.Item;

        const { gameName, startTime } = game;

        // get all team members from the team table

        const getTeamCommand = new GetCommand({
            TableName: "teams",
            Key: {
                id: teamId,
            },
        });

        const teamResponse = await dynamoDocClient.send(getTeamCommand);

        if (!teamResponse.Item) {
            return sendHTTPResponse(404, { error: "Team not found" });
        }

        const team = teamResponse.Item;

        const { members } = team;

        // iterate on all users and add a notification for each user

        for (const member of members) {
            const params = {
                TableName: "notifications",
                Item: {
                    id,
                    userId: member.userId,
                    timestamp: (new Date()).toISOString(),
                    type: "GAME_INVITE",
                    link: `/lobby/${gameId}`,
                    gameName,
                    startTime
                }
            };
            const storeNotificationCommand = new PutCommand(params);
            await dynamoDocClient.send(storeNotificationCommand);
        }
    }
    return {
        message: "Success"
    };
};
