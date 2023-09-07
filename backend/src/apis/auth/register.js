const { dynamoDocClient } = require("../../lib/dynamoDB");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const { firstName, lastName, admin } = event.body;
        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        await firebaseAuth.setCustomUserClaims(claims.uid, { is2faVerified: false, isAdmin: admin === true });
        const user = {
            // @ts-ignore
            id: claims.uid,
            // @ts-ignore
            email: claims.email,
            firstName,
            lastName,
            isAdmin: admin === true
        };
        const storeUserCommand = new PutCommand({
            TableName: "users",
            // @ts-ignore
            Item: user
        });
        await dynamoDocClient.send(storeUserCommand);

        return sendHTTPResponse(201, null);
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user add." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
