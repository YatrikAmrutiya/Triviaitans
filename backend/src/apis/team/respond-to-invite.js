const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { sendMessageToSNSTopic } = require("../../lib/sns");

const handler = async (event) => {
    try {
        const { teamId, invitiationResponse } = event.body;

        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
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

        /**
         * @typedef {Object} Member
         * @property {string} userId
         * @property {string} userEmail
         * @property {string} role
         * @property {string} status
         */
        /**
         * @typedef {Object} Team
         * @property {string} id
         * @property {string} name
         * @property {Array<Member>} members
         * */

        /**
         * @type {Team}
         */
        // @ts-ignore
        const team = response.Item;

        // check whether the user is a part of the team and their status is pending
        const memberIndex = team.members.findIndex(member => member.userId === claims.uid && member.status === "pending");

        if (memberIndex === -1) {
            return sendHTTPResponse(403, { error: "You are not authorized to perform this action." });
        }
        else {
            if (invitiationResponse !== "accepted" && invitiationResponse !== "rejected") {
                return sendHTTPResponse(400, { error: "Invalid invitation response." });
            }

            team.members[memberIndex].status = invitiationResponse;
        }

        const updateCommand = new UpdateCommand({
            TableName: "teams",
            Key: {
                id: teamId
            },
            UpdateExpression: "set #members = :members",
            ExpressionAttributeNames: {
                "#members": "members"
            },
            ExpressionAttributeValues: {
                ":members": team.members
            }
        });

        await dynamoDocClient.send(updateCommand);

        // If the user accepted the invitation, send notification and email to the team members
        if (invitiationResponse === "accepted") {
            const topicArn = `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID || event.requestContext.accountId}:TeamUpdateSNSTopic`;
            await sendMessageToSNSTopic(topicArn, {
                teamId,
                userId: claims.uid,
            });
        }

        return sendHTTPResponse(200, { message: "User updated successfully.", members: team.members });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred while updating the user.", message: error.message });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
