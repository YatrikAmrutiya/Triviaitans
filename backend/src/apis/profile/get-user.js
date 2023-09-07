const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { firebaseAuth } = require("../../lib/firebase");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 * This function handles the retrieval of user data from the DynamoDB table.
 * @param {import("aws-lambda").APIGatewayEvent} event - The API Gateway event containing the user ID in the headers.
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>} - The response object containing the HTTP status code and body.
 */
const handler = async(event) => {
    try {
        // Extract the Firebase token from the request headers
        const firebaseToken = event.headers.authorization;
        
        // Verify the Firebase token to get the user's ID
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        const userId = claims.user_id;

        // Prepare the GetCommand to fetch user data from DynamoDB
        const getUserCommand = new GetCommand({
            TableName: "users",
            Key: { id: userId },
        });

        // Send the GetCommand to DynamoDB to retrieve the user data
        const response = await dynamoDocClient.send(getUserCommand);

        // Return the user data retrieved from DynamoDB
        return response.Item;
    } catch(error) {
        // Handle errors and return an error response
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user retrieval." });
    }
};

// Export the handler wrapped with Middy middleware for JSON body parsing
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
