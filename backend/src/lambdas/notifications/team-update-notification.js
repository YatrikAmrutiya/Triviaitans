const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { v4: uuidV4 } = require("uuid");
const { sendHTTPResponse } = require("../../lib/api");

/**
 * This lambda is triggered whenever a new person join the team. The lambda will push a notification in the
 * notification table for all team members of that team with a timestamp, notification type, and a link to the team page
 * @param {import("aws-lambda").SQSEvent} event
*/

exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { teamId, userId } = JSON.parse(Message);
        const id = uuidV4();

        // get user name from user table

        const getCommand = new GetCommand({
            TableName: "users",
            Key: {
                id: userId
            }
        });

        const response = await dynamoDocClient.send(getCommand);

        if (!response.Item) {
            return sendHTTPResponse(404, { error: "User not found." });
        }

        const { firstName } = response.Item;

        // get all members of the team

        const getTeamCommand = new GetCommand({
            TableName: "teams",
            Key: {
                id: teamId
            }
        });

        const teamResponse = await dynamoDocClient.send(getTeamCommand);

        if (!teamResponse.Item) {
            return sendHTTPResponse(404, { error: "Team not found." });
        }

        const { teamName } = teamResponse.Item;

        const { members } = teamResponse.Item;

        // iterate on all members and add a notification for each member

        for (const member of members) {
            const params = {
                TableName: "notifications",
                Item: {
                    id,
                    userId: member.userId,
                    timestamp: (new Date()).toISOString(),
                    type: "TEAM_UPDATE",
                    link: `/teams/${teamId}`,
                    firstName,
                    teamName
                }
            };
            const storeNotificationCommand = new PutCommand(params);
            await dynamoDocClient.send(storeNotificationCommand);
        }
    }
    return sendHTTPResponse(200, { message: "Success" });
};
