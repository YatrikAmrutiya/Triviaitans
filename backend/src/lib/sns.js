const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({ region: "us-east-1" });

const sendMessageToSNSTopic = async (topicArn, message) => {
    const publishCommand = new PublishCommand({
        TopicArn: topicArn,
        Message: JSON.stringify(message)
    });

    console.log("Sending message to SNS topic:", topicArn);
    console.log("Message:", message);

    await snsClient.send(publishCommand);
};

module.exports = { sendMessageToSNSTopic, snsClient };
