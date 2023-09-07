const { dynamoDocClient } = require("../../lib/dynamoDB");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");

const handler = async (event) => {
    try {
        const { teamId, teamName } = event.body;

        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        const team = {
            // @ts-ignore
            id: teamId,
            // @ts-ignore
            teamName,
            // @ts-ignore
            members: [{
                userId: claims.uid,
                userEmail: claims.email,
                role: "admin",
                status: "accepted"
            }]
        };

        const storeTeamCommand = new PutCommand({
            TableName: "teams",
            // @ts-ignore
            Item: team
        });
        await dynamoDocClient.send(storeTeamCommand);

        return sendHTTPResponse(200, { message: "Team created successfully." });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user add." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
