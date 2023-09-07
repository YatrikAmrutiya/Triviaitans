const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { v4: uuidV4 } = require("uuid");

/**
 * This lambda is triggered when a user is invited to a team. The record contains the invited user's userId and the
 * teamId to which they are invited. the lambda will push a notification in the motification table for the invited
 * user with a timestamp, notification type, and a link to the team page.
 * @param {import("aws-lambda").SQSEvent} event
 */
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { userId, teamId } = JSON.parse(Message);
        const id = uuidV4();
        const params = {
            TableName: "notifications",
            Item: {
                id,
                userId,
                timestamp: (new Date()).toISOString(),
                type: "TEAM_INVITATION",
                link: `/teams/${teamId}`
            }
        };
        const storeNotificationCommand = new PutCommand(params);
        await dynamoDocClient.send(storeNotificationCommand);
    }
    return {
        message: "Success"
    };
};
