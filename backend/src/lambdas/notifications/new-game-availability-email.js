const { sendEmail } = require("../../lib/ses");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");

/**
 * This lambda is triggered when a new game is available.
 * The lambda will send an email notification to the all registered users using SES containing a link
 * to the game page
 * @param {import("aws-lambda").SQSEvent} event
 */
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { gameId, gameName, startTime } = JSON.parse(Message);

        // get all users from the user table
        const scanCommand = new ScanCommand({
            TableName: "users"
        });

        const response = await dynamoDocClient.send(scanCommand);

        if (response.Items.length === 0) {
            return sendHTTPResponse(404, { error: "No Users Found" });
        }

        const users = response.Items;

        // iterate on all users and send an email for each user
        for (const user of users) {
            const { email } = user;

            const subject = "Trivia Titans: New Game Available!";
            const emailBody = `<html><body><h1>A new game ${gameName} is available in lobby starting at ${startTime}!
            </h1><p>Click <a href="${process.env.FRONTEND_BASE_URL}/lobby/${gameId}">here</a> to join the game.</p></body></html>`;

            const params = {
                from: `Trivia Titans <${process.env.SES_SENDER_ADDRESS}>`,
                to: email,
                subject,
                body: emailBody,
                isHTML: true
            };
            await sendEmail(params);
        }
    }
    return {
        message: "Success"
    };
};
