const { sendHTTPResponse } = require("../../lib/api");
const { firebaseAuth } = require("../../lib/firebase");
const middy = require("@middy/core");
const httpJsonBodyParser = require("@middy/http-json-body-parser");


const handler = async (event) => {
    try {
        const firebaseToken = event.headers.authorization;
        const claims = await firebaseAuth.verifyIdToken(firebaseToken.replace("Bearer ", ""));
        await firebaseAuth.setCustomUserClaims(claims.uid, { is2faVerified: false, isAdmin: claims.isAdmin });


        return sendHTTPResponse(200, null);
    }
    catch (error) {
        console.log(error);
        return sendHTTPResponse(500, { error: "An error occurred during user add." });
    }
};

// @ts-ignore
module.exports = { handler: middy(handler).use(httpJsonBodyParser()) };
