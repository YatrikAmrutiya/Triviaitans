const { firebaseAuth } = require("../../lib/firebase");
const { sendEmail } = require("../../lib/ses");

/**
 * This lambda is triggered when a user is invited to a team. The record contains the invited user's userId and the
 * teamId to which they are invited. the lambda will send an email notification to the user using SES containing a link
 * to the team's page.
 * @param {import("aws-lambda").SQSEvent} event
 */
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { userId, teamId } = JSON.parse(Message);
        const user = await firebaseAuth.getUser(userId);
        if (!user.email) {
            return { message: "User does not have an email address." };
        }

        const subject = "Trivia Titans: You have been invited to a team!";
        const emailBody = `<html><body><h1>You have been invited to a team!</h1><p>Click <a href="${process.env.FRONTEND_BASE_URL}/teams/${teamId}">here</a> to view the team.</p></body></html>`;

        const params = {
            from: `Trivia Titans <${process.env.SES_SENDER_ADDRESS}>`,
            to: user.email,
            subject,
            body: emailBody,
            isHTML: true
        };
        await sendEmail(params);
    }
    return {
        message: "Success"
    };
};
