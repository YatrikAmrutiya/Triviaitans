// This lambda fetches the notifications of the current user based on the timestamp provided in the query parameter.
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const { dynamoDocClient } = require("../../lib/dynamoDB");
const { QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event, context) => {
    try {
        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        // @ts-ignore
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        const { timestamp } = event.queryStringParameters;

        if (!timestamp) {
            const getAllNotificationsCommand = new ScanCommand({
                TableName: "notifications",
                IndexName: "userId-index",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": claims.uid
                },
                ScanIndexForward: false
            });

            const response = await dynamoDocClient.send(getAllNotificationsCommand);

            const notifications = response.Items;

            return sendHTTPResponse(200, { notifications });
        }

        const getNotificationsCommand = new QueryCommand({
            TableName: "notifications",
            IndexName: "userId-index",
            KeyConditionExpression: "userId = :userId",
            FilterExpression: "#notificationTimestamp > :timestamp",
            ExpressionAttributeNames: {
                "#notificationTimestamp": "timestamp"
            },
            ExpressionAttributeValues: {
                ":timestamp": timestamp,
                ":userId": claims.uid
            },
            ScanIndexForward: false
        });

        const response = await dynamoDocClient.send(getNotificationsCommand);

        const notifications = response.Items;

        return sendHTTPResponse(200, { notifications });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "Internal server error." });
    }
};

module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
