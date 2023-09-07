const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const { sendEmail } = require("../../lib/ses");

/**
 * This lambda is triggered whenever someone join the team. The lambda will send a email to
 * all the team members from that team with link to the team page
 * @param {import("aws-lambda").SQSEvent} event
*/

exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { teamId, userId } = JSON.parse(Message);

        // get details of the user who joined the team

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

        // iterate on all members and send email to each member

        for (const member of members) {
            const { userEmail } = member;

            const subject = "Trivia Titans: New Member joined the team!";
            const emailBody = `<html><body><h1>New member ${firstName} joined the team ${teamName}!
            </h1><p>Click <a href="${process.env.FRONTEND_BASE_URL}/teams/${teamId}">here</a> to see the team.</p></body></html>`;

            const params = {
                from: `Trivia Titans <${process.env.SES_SENDER_ADDRESS}>`,
                to: userEmail,
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
