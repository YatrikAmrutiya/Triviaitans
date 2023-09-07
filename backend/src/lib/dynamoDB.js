const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

module.exports = {
    dynamoDocClient: DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }), {
        marshallOptions: {
            removeUndefinedValues: true
        }
    })
};
