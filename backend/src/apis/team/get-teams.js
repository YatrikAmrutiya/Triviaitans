const { dynamoDocClient } = require("../../lib/dynamoDB");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

const handler = async (event) => {
    try {
        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        const scanCommand = new ScanCommand({
            TableName: "teams"
        });

        const response = await dynamoDocClient.send(scanCommand);

        if (response.Items.length === 0) {
            return sendHTTPResponse(404, { error: "No Teams Found" });
        }

        /**
         *
         * @type {Array<Team>}
         *
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
         *
         * @type {Team}
         * */

        const teams = response.Items;

        // Check if user is part of that team
        const userTeams = teams.filter(team => team.members.find(member => member.userId === claims.uid));

        if (userTeams.length === 0) {
            return sendHTTPResponse(404, { error: "No Teams Found" });
        }

        return sendHTTPResponse(200, { userTeams });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "Something went wrong." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
