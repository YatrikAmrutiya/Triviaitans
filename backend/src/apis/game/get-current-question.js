const { dynamoDocClient } = require("../../lib/dynamoDB");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const lodash = require("lodash");
const httpEventNormalizer = require("@middy/http-event-normalizer");

const timePerQuestionInSeconds = 30;
const timeToShowAnswerInSeconds = 10;

/**
 *
 * @param {import("aws-lambda").APIGatewayEvent} event
 * @returns
 */
const handler = async (event) => {
    try {
        // @ts-ignore
        const { gameId } = event.pathParameters;

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

        const startTime = new Date(game.startTime);
        const endTime = new Date(startTime.getTime() + (game.questions.length * (timePerQuestionInSeconds + timeToShowAnswerInSeconds) * 1000));

        if (requestTime < startTime) {
            return sendHTTPResponse(400, { error: "Game has not started yet." });
        }

        if (requestTime >= endTime) {
            return sendHTTPResponse(400, { error: "Game has ended." });
        }

        for (let i = 0; i < game.questions.length; i++) {
            const question = game.questions[i];
            const questionStartTime = new Date(startTime.getTime() + (i * (timePerQuestionInSeconds + timeToShowAnswerInSeconds) * 1000));
            const questionEndTime = new Date(questionStartTime.getTime() + (timePerQuestionInSeconds * 1000));
            const answerEndTime = new Date(questionEndTime.getTime() + (timeToShowAnswerInSeconds * 1000));

            if (requestTime >= questionStartTime && requestTime < questionEndTime) {
                return sendHTTPResponse(200, {
                    question: lodash.omit(question, ["correctAnswer", "explaination"]),
                    questionNumber: i + 1,
                    questionEndTime: questionEndTime.toISOString(),
                    answerEndTime: answerEndTime.toISOString(),
                    isLastQuestion: i === game.questions.length - 1,
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "Something went wrong." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()).use(httpEventNormalizer()) };
