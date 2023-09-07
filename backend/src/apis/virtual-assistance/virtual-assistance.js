const { dynamoDocClient } = require("../../lib/dynamoDB");
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");

/**
 * This lambda is triggered when a user performs some interaction with the bot.
 * @param {import("aws-lambda").LexV2Event} event - The Lex V2 event containing the user interaction details.
 * @returns {Promise<import("aws-lambda").LexV2EventResponse>} - The Lex V2 response object containing the bot's reply.
 */
exports.handler = async (event) => {
    const intentName = event.sessionState.intent.name;
    let response;

    // Handle the "SignupIntent" request
    if (intentName === "SignupIntent") {
        response = {
            // Constructing the response message for fulfillment
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    state: "Fulfilled",
                    name: intentName
                }
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "For signup, firstly, go to the registration page & fill your details like name, email & password."
                },
                {
                    contentType: "PlainText",
                    content: "After that, verify your account & login. You will be prompted to set 3 questions as part of 2-factor-validation. After setting up those questions, you are good to go."
                },
                {
                    contentType: "PlainText",
                    content: "I hope this was helpful!"
                }
            ]
        };
    }

    // Handle the "GameOptionsIntent" request
    else if (intentName === "GameOptionsIntent") {
        response = {
            // Constructing the response message for fulfillment
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    state: "Fulfilled",
                    name: intentName
                }
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "For accessing game playing options, you first have to sign in to your account."
                },
                {
                    contentType: "PlainText",
                    content: "After that, on the Dashboard page, click on 'Game Lobby'. You will be able to see the game playing options."
                },
                {
                    contentType: "PlainText",
                    content: "I hope this was helpful!"
                }
            ]
        };
    }

    // Handle the "DatabaseIntent" request
    else if (intentName === "DatabaseIntent") {
        // Extract the teamName from the slot in the user's request
        const teamName = event.sessionState.intent.slots.TeamName.value.originalValue;

        // Prepare the QueryCommand to fetch data from DynamoDB based on the teamName
        const queryCommand = new QueryCommand({
            TableName: "game-answers",
            IndexName: "teamName-index",
            KeyConditionExpression: "teamName = :e",
            ExpressionAttributeValues: {
                ":e": teamName,
            },
        });

        try {
            // Send the QueryCommand to DynamoDB to retrieve data
            const result = await dynamoDocClient.send(queryCommand);
            let totalPoints = 0;

            if (result.Items && result.Items.length > 0) {
                // Calculate the total points for the team by iterating over the result items
                result.Items.forEach((item) => {
                    totalPoints += item.points;
                });

                response = {
                    // Constructing the response message for fulfillment
                    sessionState: {
                        dialogAction: {
                            type: "Close"
                        },
                        intent: {
                            state: "Fulfilled",
                            name: intentName
                        }
                    },
                    messages: [
                        {
                            contentType: "PlainText",
                            content: `The points for ${teamName} is ${totalPoints}.`
                        },
                        {
                            contentType: "PlainText",
                            content: "I hope this was helpful!"
                        }
                    ]
                };
            } else {
                // If the team with the given name does not exist in the database
                response = {
                    // Constructing the response message for fulfillment
                    sessionState: {
                        dialogAction: {
                            type: "Close"
                        },
                        intent: {
                            state: "Fulfilled",
                            name: intentName
                        }
                    },
                    messages: [
                        {
                            contentType: "PlainText",
                            content: `Sorry, the team with name ${teamName} doesn't exist.`
                        }
                    ]
                };
            }
        } catch (error) {
            // If an error occurs while querying DynamoDB
            console.error("DynamoDB Error:", error);
            response = {
                // Constructing the response message for failure
                sessionState: {
                    dialogAction: {
                        type: "Close"
                    },
                    intent: {
                        state: "Failed",
                        name: intentName
                    }
                },
                messages: [
                    {
                        contentType: "PlainText",
                        content: "Apologies, there was an error while retrieving the team score. Please try again later."
                    }
                ]
            };
        }
    }

    // Handle unrecognized intents
    else {
        response = {
            // Constructing the response message for fulfillment
            sessionState: {
                dialogAction: {
                    type: "Close"
                },
                intent: {
                    state: "Fulfilled",
                    name: intentName
                }
            },
            messages: [
                {
                    contentType: "PlainText",
                    content: "I'm sorry, but I don't have a specific response for this. Can you type that again?"
                }
            ]
        };
    }

    // Return the response object with the bot's reply
    return response;
};
