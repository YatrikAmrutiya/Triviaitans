const { sendEmail } = require("../../lib/ses");

/**
 * This lambda is triggered when a user unlock an achievement. The record contains the user's email and the
 * achievement unlocked. the lambda will send an email notification to the user using SES containing a link
 * to the dashboard.
 * @param {import("aws-lambda").SQSEvent} event
 */
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { Message } = JSON.parse(record.body);
        const { userEmail, achievementUnlockedName } = JSON.parse(Message);

        const subject = "Trivia Titans: You have unlocked an achievement!";
        const emailBody = `<html><body><h1>You have unlocked an achievement!</h1><p>You have unlocked the ${achievementUnlockedName} achievement. Click <a href="${process.env.FRONTEND_BASE_URL}/dashboard">here</a> to view your achievements.</p></body></html>`;

        const params = {
            from: `Trivia Titans <${process.env.SES_SENDER_ADDRESS}>`,
            to: userEmail,
            subject,
            body: emailBody,
            isHTML: true
        };
        await sendEmail(params);
    }
    return {
        message: "Success"
    };
}