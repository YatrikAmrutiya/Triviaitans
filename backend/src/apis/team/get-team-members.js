const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

/**
 *
 * @param {import("aws-lambda").APIGatewayEvent} event
 * @returns
 */
const handler = async (event) => {
    try {
        const { teamId } = event.pathParameters;

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
         *
         * @typedef {Object} Team
         * @property {string} id
         * @property {string} name
         * @property {Array<Member>} members
         **/

        let accessLevel = "member";
        const members = response.Item.members;

        const user = members.find(member => member.userId === claims.uid);
        const role = user.role;
        if (role === "admin") {
            accessLevel = "admin";
        }

        return sendHTTPResponse(200, { members, accessLevel });
    }
    catch (error) {
        console.error(error);
        return sendHTTPResponse(500, { error: "Internal Server Error" });
    }
};

exports.handler = middy(handler).use(httpJsonBodyParser());
