const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

const handler = async (event) => {
    try {
        const { teamId } = event.body;

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
         */

        /**
         * @type {Team}
         */
        const team = response.Item;

        const memberToBeRemoved = team.members.findIndex(member => member.userId === claims.uid);

        if (memberToBeRemoved === -1) {
            return sendHTTPResponse(404, { error: "User not found." });
        }
        team.members.splice(memberToBeRemoved, 1);

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

        if (team.members.length === 0) {
            const deleteCommand = new DeleteCommand({
                TableName: "teams",
                Key: {
                    id: teamId
                }
            });

            await dynamoDocClient.send(deleteCommand);
        }

        return sendHTTPResponse(200, { message: "User removed from team." });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user remove." });
    }
};

exports.handler = middy(handler).use(httpJsonBodyParser());

