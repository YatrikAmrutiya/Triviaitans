const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { firebaseAuth } = require("../../lib/firebase");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 * This function handles the user update request.
 * @param {import("aws-lambda").APIGatewayEvent} event - The API Gateway event containing user update data.
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>} - The response object containing the HTTP status code and body.
 */
const handler = async(event) => {
    try {
        // Extract user update data from the request body
        const { firstName, lastName, email } = event.body;
        const firebaseToken = event.headers.authorization;

        // Verify the Firebase token to get the user's ID
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        const userId = claims.user_id;

        // Check if there's anything to update; return 204 if no updates are provided
        if (!firstName && !lastName && !email) {
            return sendHTTPResponse(204, "Nothing to Update");
        }

        // Initialize user update expression and attribute values
        const userUpdateExpression = [];
        const userExpressionAttributeValues = {};

        // Add update expressions and values for each provided field
        if (firstName) {
            userUpdateExpression.push("set firstName = :firstName");
            userExpressionAttributeValues[":firstName"] = firstName;
        }

        if (lastName) {
            userUpdateExpression.push("set lastName = :lastName");
            userExpressionAttributeValues[":lastName"] = lastName;
        }

        if (email) {
            userUpdateExpression.push("set email = :email");
            userExpressionAttributeValues[":email"] = email;
        }

        // Create the update command and send it to DynamoDB to update the user's record
        const updateUserCommand = new UpdateCommand({
            TableName: "users",
            Key: { id: userId },
            UpdateExpression: userUpdateExpression.join(", "),
            ExpressionAttributeValues: userExpressionAttributeValues,
        });

        await dynamoDocClient.send(updateUserCommand);

        // Return a successful response
        return sendHTTPResponse(200, null);
    } catch (error) {
        // Handle errors and return an error response
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user update." });
    }
};

// @ts-ignore
// Export the handler wrapped with Middy middleware for JSON body parsing
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
