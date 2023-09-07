const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: "us-east-1" });

/**
 * This function handles the profile picture upload and update.
 * @param {import("aws-lambda").APIGatewayEvent} event - The API Gateway event containing profile picture data.
 * @returns {Promise<import("aws-lambda").APIGatewayProxyResult>} - The response object containing the HTTP status code and body.
 */
const handler = async (event) => {
  try {
    // Extract profile picture file name from the request body
    const { fileName } = event.body;
    const firebaseToken = event.headers.authorization;

    // Verify the Firebase token to get the user's ID
    /**
     * @type {import("firebase-admin/auth").DecodedIdToken}
     */
    const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
    const userId = claims.user_id;

    // Generate a pre-signed URL for uploading the object to S3
    const uploadUrl = await getSignedUrl(s3Client, new PutObjectCommand({
      Bucket: 'trivia-titans-sdp16-profile-photos',
      Key: userId,
      ACL: 'public-read',
    }));
    const displayUrl = `https://trivia-titans-sdp16-profile-photos.s3.amazonaws.com/${userId}`

    // Prepare update expression and attribute values for the user's display URL
    const userUpdateExpression = [];
    const userExpressionAttributeValues = {};

    if (displayUrl) {
      userUpdateExpression.push("set displayUrl = :displayUrl");
      userExpressionAttributeValues[":displayUrl"] = displayUrl;
    }

    // Create the update command and send it to DynamoDB to update the user's record
    const updateUserCommand = new UpdateCommand({
      TableName: "users",
      Key: { id: userId },
      UpdateExpression: userUpdateExpression.join(", "),
      ExpressionAttributeValues: userExpressionAttributeValues
    });

    await dynamoDocClient.send(updateUserCommand);

    // Return a successful response with the upload URL and the updated display URL
    return sendHTTPResponse(200, { uploadUrl, displayUrl });

  } catch (error) {
    // Handle errors and return an error response
    console.log(error);
    return sendHTTPResponse(500, { error: "An error occurred during the profile picture update." });
  }
};

// Export the handler wrapped with Middy middleware for JSON body parsing
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
