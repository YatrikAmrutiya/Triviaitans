const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { v4: uuidV4 } = require("uuid");
const { sendHTTPResponse } = require("../../lib/api");

/**
 * This lambda is triggered whenever there is a new game available. The lambda will push a notification in the
 * notification table for all users with a timestamp, notification type, and a link to the game page
 * @param {import("aws-lambda").SQSEvent} event
*/

exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { gameId, gameName, startTime } = JSON.parse(Message);
        const id = uuidV4();

        // get all users from the user table
        const scanCommand = new ScanCommand({
            TableName: "users"
        });

        const response = await dynamoDocClient.send(scanCommand);

        if (response.Items.length === 0) {
            return sendHTTPResponse(404, { error: "No Users Found" });
        }

        const users = response.Items;

        // iterate on all users and add a notification for each user

        for (const user of users) {
            const params = {
                TableName: "notifications",
                Item: {
                    id,
                    userId: user.id,
                    timestamp: (new Date()).toISOString(),
                    type: "NEW_GAME_AVAILABILITY",
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
