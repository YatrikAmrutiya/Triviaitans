const { dynamoDocClient } = require("../../lib/dynamoDB");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const { question1, question2, question3, answer1, answer2, answer3 } = event.body;
        const firebaseToken = event.headers.authorization;
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        const collection2fa = {
            // @ts-ignore
            id: claims.uid,
            question1,
            question2,
            question3,
            answer1,
            answer2,
            answer3
        };

        const store2faCommand = new PutCommand({
            TableName: "user2fa",
            // @ts-ignore
            Item: collection2fa
        });

        await dynamoDocClient.send(store2faCommand);

        return sendHTTPResponse(200, null);
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user add." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
