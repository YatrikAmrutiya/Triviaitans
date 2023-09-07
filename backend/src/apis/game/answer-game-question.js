const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { firebaseAuth } = require("../../lib/firebase");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const httpEventNormalizer = require("@middy/http-event-normalizer");
const { v4: uuidv4 } = require("uuid");
const { sendMessageToSNSTopic } = require("../../lib/sns");

const { BigQuery } = require("@google-cloud/bigquery");

const serviceAccount = {
   //removed for security purposes
};


const bqClient = new BigQuery({
    credentials: serviceAccount
});

const timePerQuestionInSeconds = 30;
const timeToShowAnswerInSeconds = 10;

const handler = async (event) => {
    try {
        // @ts-ignore
        const { gameId } = event.pathParameters;
        const { questionNumber, answer, teamId } = event.body;

        const firebaseToken = event.headers.authorization;
        /**
         * @type {import("firebase-admin/auth").DecodedIdToken}
         */
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));

        const requestTime = new Date();

        const getGameCommand = new GetCommand({
            TableName: "GameQuestions",
            Key: {
                gameId,
            },
        });

        const getGameResult = await dynamoDocClient.send(getGameCommand);

        /**
         * @typedef {object} Question
         * @property {string} category
         * @property {string} correctAnswer
         * @property {string} difficulty
         * @property {string} explaination
         * @property {string} id
         * @property {Array<string>} options
         * @property {string} question
         * @property {Array<string>} tags
         */

        /**
         * @typedef {object} Game
         * @property {string} gameId
         * @property {string} category
         * @property {string} difficulty
         * @property {string} gameName
         * @property {Array<Question>} questions
         * @property {string} startTime
         */

        /**
         * @type {Game}
         */

        // @ts-ignore
        const game = getGameResult.Item;

        if (!game) {
            return sendHTTPResponse(404, { error: "Game not found." });
        }

        if (game.questions.length < questionNumber) {
            return sendHTTPResponse(404, { error: "Question not found." });
        }

        const startTime = new Date(game.startTime);
        const endTime = new Date(startTime.getTime() + (game.questions.length * (timePerQuestionInSeconds + timeToShowAnswerInSeconds) * 1000));

        if (requestTime < startTime) {
            return sendHTTPResponse(400, { error: "Game has not started yet." });
        }

        if (requestTime >= endTime) {
            return sendHTTPResponse(400, { error: "Game has ended." });
        }

        const questionStartTime = new Date(startTime.getTime() + ((questionNumber - 1) * (timePerQuestionInSeconds + timeToShowAnswerInSeconds) * 1000));
        const questionEndTime = new Date(questionStartTime.getTime() + (timePerQuestionInSeconds * 1000));

        if (requestTime < questionStartTime) {
            return sendHTTPResponse(400, { error: "Question has not started yet." });
        }

        if (requestTime >= questionEndTime) {
            return sendHTTPResponse(400, { error: "Question has ended." });
        }

        const question = game.questions[questionNumber - 1];
        const getGameAnswerCommand = new ScanCommand({
            TableName: "game-answers",
            FilterExpression: "gameId = :gameId AND userId = :userId AND questionId = :questionId",
            ExpressionAttributeValues: {
                ":gameId": gameId,
                ":userId": claims.uid,
                ":questionId": question.id
            }
        });

        const getGameAnswerResult = await dynamoDocClient.send(getGameAnswerCommand);

        if (getGameAnswerResult.Items.length > 0) {
            return sendHTTPResponse(400, { error: "You have already answered this question." });
        }

        const getTeamCommand = new GetCommand({
            TableName: "teams",
            Key: {
                id: teamId
            }
        });

        const getTeamResult = await dynamoDocClient.send(getTeamCommand);

        if (!getTeamResult.Item) {
            return sendHTTPResponse(404, { error: "Team not found." });
        }

        /**
         * @typedef {Object} Member
         * @property {string} userId
         * @property {string} userEmail
         * @property {string} role
         * @property {string} status
         */
        /**
         * @typedef {Object} Team
         * @property {string} id
         * @property {string} teamName
         * @property {Array<Member>} members
         */

        /**
         * @type {Team}
         */
        // @ts-ignore
        const team = getTeamResult.Item;

        const gameAnswer = {
            id: uuidv4(),
            gameId,
            teamId,
            teamName: team.teamName,
            userId: claims.uid,
            userName: claims.name,
            questionId: question.id,
            timestamp: requestTime.toISOString(),
            correctAnswer: question.correctAnswer,
            answer,
            category: question.category,
            points: 0
        };

        if (question.correctAnswer === answer) {
            gameAnswer.points = 1 / team.members.filter(member => member.status === "accepted").length;
        }

        const putGameAnswerCommand = new PutCommand({
            TableName: "game-answers",
            Item: gameAnswer
        });

       await dynamoDocClient.send(putGameAnswerCommand);
        
        const topicArn = `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID || event.requestContext.accountId}:UserAchievementsSNSTopic`;
        console.log(topicArn);
        await sendMessageToSNSTopic(topicArn, {
            TableName: "game-answers",
            Item: gameAnswer
        });

        try {
            const datasetId = "game_statistics";
            const tableId = "answer-data";
            const dataset = bqClient.dataset(datasetId);
            const table = dataset.table(tableId);

            const dataToInsert = [
                gameAnswer
            ];

            const options = { ignoreUnknownValues: true };
            const [apiResponse] = await table.insert(dataToInsert, options);
            console.log("Data successfully inserted into BigQuery:", apiResponse);
        }
        catch (error) {
            console.error("Error processing record:", error);
        }

        return sendHTTPResponse(200, { message: `The answer ${answer} has been recorded.` });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "Something went wrong." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()).use(httpEventNormalizer()) };
