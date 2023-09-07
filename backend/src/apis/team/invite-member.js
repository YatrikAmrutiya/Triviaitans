const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { sendMessageToSNSTopic } = require("../../lib/sns");

/**
 *
 * @param {import("aws-lambda").APIGatewayEvent} event
 * @param {*} context
 * @returns
 */
const handler = async (event, context) => {
    try {
        // @ts-ignore
        const { teamId, email } = event.body;

        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        // @ts-ignore
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        const getCommand = new GetCommand({
            TableName: "teams",
            Key: {
                id: teamId
            }
        });

        const response = await dynamoDocClient.send(getCommand);

        if (!response.Item) {
            return sendHTTPResponse(404, { error: "Team not found." });
        }

        const team = response.Item;

        // Check whether current user exists in the team and is an admin
        if (!team.members.find(member => member.userId === claims.uid && member.role === "admin")) {
            return sendHTTPResponse(403, { error: "You are not authorized to invite a user to this team." });
        }

        // Check whether the user to be invited exists
        const userRecord = await firebaseAuth.getUserByEmail(email);

        if (!userRecord) {
            return sendHTTPResponse(404, { error: "User not found." });
        }

        // Check whether the user to be invited is already a member of the team
        if (team.members.find(member => member.userId === userRecord.uid)) {
            return sendHTTPResponse(400, { error: "User is already a member of the team." });
        }

        // Add the user to the team
        team.members.push({
            userId: userRecord.uid,
            userEmail: userRecord.email,
            role: "member",
            status: "pending"
        });

        const updateCommand = new UpdateCommand({
            TableName: "teams",
            Key: {
                id: teamId
            },
            UpdateExpression: "set members = :members",
            ExpressionAttributeValues: {
                ":members": team.members
            },
            ReturnValues: "ALL_NEW"
        });

        await dynamoDocClient.send(updateCommand);

        const topicArn = `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID || event.requestContext.accountId}:TeamInvitationSNSTopic`;
        await sendMessageToSNSTopic(topicArn, {
            teamId,
            userId: userRecord.uid,
        });

        return sendHTTPResponse(200, { message: "User invited successfully.", members: team.members });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred while inviting the user.", message: error.message });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
