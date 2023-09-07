const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { sendMessageToSNSTopic } = require("../../lib/sns");

/**
 * This lambda is triggered after a user answers a question.
 * @param {import("aws-lambda").SNSEvent} event - The SNS event containing the user's answer data.
 */
exports.handler = async (event) => {
    // Extract the message from the SNS event
    const message = event.Records[0].Sns.Message;
    const parsedMessage = JSON.parse(message);
    const item = parsedMessage.Item;

    // Get the user's data from the DynamoDB table using the userId provided in the message
    const getUserCommand = new GetCommand({
        TableName: "users",
        Key: { id: item.userId },
    });

    const response = await dynamoDocClient.send(getUserCommand);
    console.log(response);
    console.log(response.Item);

    // Initialize achievement update expression and attribute values
    const achievementUpdateExpression = [];
    const achievementExpressionAttributeValues = {};

    // If the user is not found in the table, return without further processing
    if (!response.Item) {
        return;
    }

    const user = response.Item;
    const userId = user.id;
    const userEmail = user.email;
    let achievementUnlockedName = "";

    // Check if the user has answered their first question and update the achievement if necessary
    if (!user.firstQuestionAnswered) {
        achievementUpdateExpression.push("set firstQuestionAnswered = :firstQuestionAnswered");
        achievementExpressionAttributeValues[":firstQuestionAnswered"] = true;
        console.log("First Question Answered");
        achievementUnlockedName = "First Question Answered";
    }

    // Check if the user has answered their first question correctly and update the achievement if necessary
    if (!user.firstQuestionAnsweredCorrectly) {
        if (item.points > 0) {
            achievementUpdateExpression.push("set firstQuestionAnsweredCorrectly = :firstQuestionAnsweredCorrectly");
            achievementExpressionAttributeValues[":firstQuestionAnsweredCorrectly"] = true;
            achievementUnlockedName = "First Question Answered Correctly";
        }
        else {
            achievementUpdateExpression.push("set firstQuestionAnsweredCorrectly = :firstQuestionAnsweredCorrectly");
            achievementExpressionAttributeValues[":firstQuestionAnsweredCorrectly"] = false;
        }
    }

    // If there are achievement updates to be made, update the user's record in the table
    if (achievementUpdateExpression.length > 0) {
        const storeAchievementsCommand = new UpdateCommand({
            TableName: "users",
            Key: { id: item.userId },
            UpdateExpression: achievementUpdateExpression.join(", "),
            ExpressionAttributeValues: achievementExpressionAttributeValues,
        });

        await dynamoDocClient.send(storeAchievementsCommand);

        // Publish a message to the SNS topic to notify the user of their new achievements
        const topicArn = `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID || event.requestContext.accountId}:AchievementUnlockedSNSTopic`;
        await sendMessageToSNSTopic(topicArn, {
            userId,
            userEmail,
            achievementUnlockedName,
        });
    }
};
