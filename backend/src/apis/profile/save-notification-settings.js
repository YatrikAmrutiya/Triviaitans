const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { firebaseAuth } = require("../../lib/firebase");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 * This function handles the saving of notification settings for a user.
 * @param {import("aws-lambda").APIGatewayEvent} event - The API Gateway event containing the notification settings data.
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>} - The response object containing the HTTP status code and body.
 */
const handler = async(event) => {
    try {
        // Extract selected notification values from the request body
        const { selectedValues } = event.body;
        const firebaseToken = event.headers.authorization;
        
        // Verify the Firebase token to get the user's ID
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        const userId = claims.user_id;

        // List of checkbox names corresponding to different notification settings
        const checkboxNames = [
            "teamInviteCheckbox",
            "newGameCheckbox",
            "gameJoiningCheckbox",
            "achievementUnlockedCheckbox",
            "teamUpdatesCheckbox",
            "newTriviaGameAvailabilityCheckbox",
            "leaderboardCheckbox",
        ];

        const notificationUpdateExpression = [];
        const notificationExpressionAttributeValues = {};

        // Loop through each checkbox and prepare the update expression and attribute values
        for (const checkboxName of checkboxNames) {
            const isSelected = selectedValues.includes(checkboxName);
            notificationExpressionAttributeValues[`:${checkboxName}`] = isSelected;
            notificationUpdateExpression.push(`${checkboxName} = :${checkboxName}`);
        }

        // Create the final update expression string
        const updateExpressionStr = `set ${notificationUpdateExpression.join(", ")}`;

        // If there are no changes to update, return a successful response
        if (notificationUpdateExpression.length === 0) {
            return sendHTTPResponse(200, null);
        }

        // Create the update command and send it to DynamoDB to update the user's notification settings
        const updateNotificationCommand = new UpdateCommand({
            TableName: "users",
            Key: { id: userId },
            UpdateExpression: updateExpressionStr,
            ExpressionAttributeValues: notificationExpressionAttributeValues,
        });

        await dynamoDocClient.send(updateNotificationCommand);

        // Return a successful response
        return sendHTTPResponse(200, null);
    } catch(error) {
        // Handle errors and return an error response
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during the user update." });
    }
};

// Export the handler wrapped with Middy middleware for JSON body parsing
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
