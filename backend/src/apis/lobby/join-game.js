const { dynamoDocClient } = require("../../lib/dynamoDB");
const { UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { sendHTTPResponse } = require("../../lib/api");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { sendMessageToSNSTopic } = require("../../lib/sns");

const handler = async (event) => {
    try {
        const { teamId, gameId } = event.body;

        // Retrieve the current game record
        const getGameCommand = new GetCommand({
            TableName: "GameQuestions",
            Key: {
                gameId,
            },
        });

        const { Item: game } = await dynamoDocClient.send(getGameCommand);

        if (!game) {
            return sendHTTPResponse(404, { error: "Game not found" });
        }

        // Check if the teamId already exists in the teams array
        const teams = game.teams || [];
        if (teams.includes(teamId)) {
            return sendHTTPResponse(200, { message: "Team is already part of the game" });
        }

        // Append the teamId to the teams array
        teams.push(teamId);

        // Update the game record with the modified teams array
        const updateGameCommand = new UpdateCommand({
            TableName: "GameQuestions",
            Key: {
                gameId,
            },
            UpdateExpression: "SET teams = :teams",
            ExpressionAttributeValues: {
                ":teams": teams,
            },
        });

        await dynamoDocClient.send(updateGameCommand);

        // send notification to all team members of this team

        const topicArn = `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID || event.requestContext.accountId}:GameInviteSNSTopic`;
        await sendMessageToSNSTopic(topicArn, {
            gameId,
            teamId,
        });

        return sendHTTPResponse(200, { message: "Team joined the game successfully" });
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: `An error occurred while joining the game \n Error message: ${error}` });
    }
};

module.exports = {
    // @ts-ignore
    handler: middy(handler).use(httpJsonBodyParser()),
};
