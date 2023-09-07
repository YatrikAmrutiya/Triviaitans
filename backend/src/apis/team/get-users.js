const { dynamoDocClient } = require("../../lib/dynamoDB");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { firebaseAuth } = require("../../lib/firebase");

/**
 *
 * @param {import("aws-lambda").APIGatewayEvent} event
 * @returns
 */
const handler = async (event) => {
    try {
        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));


        const scanCommand = new ScanCommand({
            TableName: "users"
        });

        const response = await dynamoDocClient.send(scanCommand);

        if (response.Items.length === 0) {
            return sendHTTPResponse(404, { error: "No Users Found" });
        }

        let users = response.Items;

        // filter out current user
        users = users.filter(user => user.id !== claims.uid);

        return sendHTTPResponse(200, { users });
    }
    catch (error) {
        console.error(error);
        return sendHTTPResponse(500, { error: "Internal server error." });
    }
};

exports.handler = middy(handler).use(httpJsonBodyParser());
