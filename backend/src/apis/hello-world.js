const { v4: uuidv4 } = require("uuid");

module.exports.handler = (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                uuid: uuidv4(),
                message: "Go Serverless v3.0! Your function executed successfully!",
                input: event
            },
            null,
            2
        )
    };
};
