const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const { sendEmail } = require("../../lib/ses");

/**
 * This lambda is triggered whenever someone from team join a game. The lambda will send a email to
 * all the team members from that team with a link to the game page
 * @param {import("aws-lambda").SQSEvent} event
*/
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { gameId, teamId } = JSON.parse(Message);

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

        // iterate on all users and send a email for each user
        for (const member of members) {
            const { userEmail } = member;

            const subject = "Trivia Titans: You have been invited to a game!";
            const emailBody = `<html><body><h1>You have been invited to a game ${gameName} starting at ${startTime}!
            </h1><p>Click <a href="${process.env.FRONTEND_BASE_URL}/lobby/${gameId}">here</a> to go to the game.</p></body></html>`;

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
