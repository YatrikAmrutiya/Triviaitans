const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: "us-east-1" });

const sendEmail = async ({ from, to, subject, body, isHTML }) => {
    const params = {
        Source: from,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {},
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
    };
    if (isHTML) {
        params.Message.Body = {
            Html: {
                Charset: "UTF-8",
                Data: body,
            },
        };
    }
    else {
        params.Message.Body = {
            Text: {
                Charset: "UTF-8",
                Data: body,
            },
        };
    }

    try {
        const data = await ses.send(new SendEmailCommand(params));
        return data;
    }
    catch (err) {
        console.error(err);
    }
};

module.exports = { ses, sendEmail };
