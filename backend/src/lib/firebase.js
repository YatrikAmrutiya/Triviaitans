const { cleanEnv, str } = require("envalid");
const { credential } = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const envVariables = cleanEnv(process.env, {
    FIREBASE_SERVICE_ACCOUNT_BASE64_ENCODED: str()
});

const serviceAccount = JSON.parse(
    Buffer.from(envVariables.FIREBASE_SERVICE_ACCOUNT_BASE64_ENCODED, "base64").toString("utf-8")
);

const app = initializeApp({
    // @ts-ignore
    credential: credential.cert(serviceAccount)
});

const firebaseAuth = getAuth(app);

module.exports = {
    firebaseAuth,
    app
};
