const { apihandler } = require("../helpers/apiHandler");

const registerUser = async (firstName, lastName, admin) => {
    return apihandler.post("/auth/register", { firstName, lastName, admin });
}

const get2fa = async () => {
    return apihandler.get("/auth/2fa");
}

const verify2fa = async (question, answer) => {
    return apihandler.post("/auth/2fa/validate", { question, answer });
}

const set2fa = async (question1, answer1, question2, answer2, question3, answer3) => {
    return apihandler.post("/auth/2fa", { question1, answer1, question2, answer2, question3, answer3 });
}

const logout = async () => {
    const request = apihandler.post("/auth/logout");
    localStorage.removeItem("firebaseToken");
    return request;
}

export {
    registerUser,
    verify2fa,
    set2fa,
    get2fa,
    logout
};
