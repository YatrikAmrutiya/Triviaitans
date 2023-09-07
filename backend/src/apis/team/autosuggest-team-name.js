/* This lambda is used to suggest a team name. It uses the OpenAI API to generate a team name. */
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");
const { sendHTTPResponse } = require("../../lib/api");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (event) => {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Generate cool unique team name" }],
        });

        console.log(completion.data.choices[0].message.content.split("\n")[0]);

        const suggestedTeamName = completion.data.choices[0].message.content.split("\n")[0];

        return sendHTTPResponse(200, { suggestedTeamName });
    }
    catch (error) {
        console.error(error);
        return sendHTTPResponse(500, { error: "Something went wrong." });
    }
};

module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };


