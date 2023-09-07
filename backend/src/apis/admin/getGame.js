const { dynamoDocClient } = require("../../lib/dynamoDB");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { firebaseAuth } = require("../../lib/firebase");
const { omit } = require("lodash");

const timePerQuestionInSeconds = 30;
const timeToShowAnswerInSeconds = 10;

const handler = async (event) => {
    try {
        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        const params = {
            TableName: "GameQuestions",
        };

        const data = await dynamoDocClient.send(new ScanCommand(params));

        if (!data.Items) {
            return sendHTTPResponse(200, []);
        }


        const games = data.Items?.map((game) => {
            const startTime = new Date(game.startTime);
            const endTime = new Date(startTime.getTime() + (game.questions.length * (timePerQuestionInSeconds + timeToShowAnswerInSeconds) * 1000));
            game.endTime = endTime;
            return game;
        });
        if (claims.isAdmin) {
            return sendHTTPResponse(200, games);
        }
        else {
            return sendHTTPResponse(200, games.map(game => omit(game, ["questions"])));
        }
    }
    catch (error) {
        console.error("Error:", error);
        return sendHTTPResponse(500, { error: "Failed to get games." });
    }
};

module.exports = {
    // @ts-ignore
    handler: middy(handler).use(httpJsonBodyParser()),

};
