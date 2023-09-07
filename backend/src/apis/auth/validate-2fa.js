const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const { question, answer } = event.body;
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
        let expectedAnswer;
        if (question === collection2fa.question1) {
            expectedAnswer = collection2fa.answer1;
        }
        else if (question === collection2fa.question2) {
            expectedAnswer = collection2fa.answer2;
        }
        else if (question === collection2fa.question3) {
            expectedAnswer = collection2fa.answer3;
        }
        else {
            return sendHTTPResponse(400, { error: "Invalid question." });
        }
        if (answer !== expectedAnswer) {
            return sendHTTPResponse(400, { error: "Invalid answer." });
        }
        await firebaseAuth.setCustomUserClaims(claims.uid, { is2faVerified: true, isAdmin: claims.isAdmin === true });
        return sendHTTPResponse(200, null);
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user add." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
