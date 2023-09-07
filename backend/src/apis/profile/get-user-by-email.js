const { dynamoDocClient } = require("../../lib/dynamoDB");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { firebaseAuth } = require("../../lib/firebase");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 * This function handles the retrieval of user data from the DynamoDB table based on the user's email address.
 * @param {import("aws-lambda").APIGatewayEvent} event - The API Gateway event containing the email in the path parameters and Firebase token in headers.
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>} - The response object containing the HTTP status code and user data.
 */
const handler = async (event) => {
    try {
        // Extract the Firebase token from the headers of the API Gateway event
        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        // Verify the Firebase token to get the user ID (claims.user_id) from the decoded token
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        const userId = claims.user_id;

        // Extract the email address from the path parameters of the API Gateway event
        const { email } = event.pathParameters;

        // Prepare the QueryCommand to fetch user data from DynamoDB based on the email address (using the email-index GSI)
        const queryCommand = new QueryCommand({
            TableName: "users",
            IndexName: "email-index", // Use the email-index GSI
            KeyConditionExpression: "email = :e",
            ExpressionAttributeValues: {
                ":e": email,
            },
        });

        // Send the QueryCommand to DynamoDB to retrieve user data
        const response = await dynamoDocClient.send(queryCommand);

        // Process the response and return user data if a matching user is found
        if (response.Items && response.Items.length > 0) {
            const user = response.Items[0];
            return sendHTTPResponse(200, user);
        } else {
            // If no matching user is found
            return sendHTTPResponse(404, { error: "User not found" });
        }
    } catch (error) {
        // Handle errors and return an error response
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during retrieving user data." });
    }
};

// Export the handler wrapped with Middy middleware for JSON body parsing
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
