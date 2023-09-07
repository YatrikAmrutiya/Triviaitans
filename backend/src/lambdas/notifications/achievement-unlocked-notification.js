const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { v4: uuidV4 } = require("uuid");

/**
 * This lambda is triggered when a user unlocked an achievement. The record contains the user's userId and the achievement
 * unlocked. the lambda will push a notification in the motification table for the user with a timestamp,
 * notification type, and a link to the dashboard page.
 * @param {import("aws-lambda").SQSEvent} event
 */
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { userId, achievementUnlockedName } = JSON.parse(Message);
        const id = uuidV4();
        const params = {
            TableName: "notifications",
            Item: {
                id,
                userId,
                timestamp: (new Date()).toISOString(),
                type: "ACHIEVEMENT_UNLOCKED",
                link: "/dashboard",
                achievementUnlockedName
            }
        };
        const storeNotificationCommand = new PutCommand(params);
        await dynamoDocClient.send(storeNotificationCommand);
    }
    return {
        message: "Success"
    };
};
