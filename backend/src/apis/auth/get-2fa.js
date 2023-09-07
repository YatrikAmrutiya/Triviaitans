const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const firebaseToken = event.headers.authorization;
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        const get2faCommand = new GetCommand({
            TableName: "user2fa",
            Key: {
                // @ts-ignore
                id: claims.uid
            }
        });
        const { Item: collection2fa } = await dynamoDocClient.send(get2faCommand);
        if (!collection2fa) {
            return sendHTTPResponse(404, { error: "2FA not found." });
        }
        const randomQuestionNumber = Math.floor(Math.random() * 3) + 1;
        const question = collection2fa[`question${randomQuestionNumber}`];
        return sendHTTPResponse(200, { question });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user add." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
