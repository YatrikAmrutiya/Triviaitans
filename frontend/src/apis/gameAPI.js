const { apihandler } = require("../helpers/apiHandler");

const getCurrentQuestion = async (gameId) => {
    const response = apihandler.get(`/game/${gameId}/current-questions`);
    return response;
}

const getCurrentQuestionAnswer = async (gameId) => {
    const response = apihandler.get(`/game/${gameId}/current-answer`);
    return response;
}

const getGameStatistics = async (gameId) => {
    const response = apihandler.get(`/game/${gameId}/statistics`);
    return response;
}

const answerQuestion = async (gameId, questionNumber, answer, teamId) => {
    const response = apihandler.post(`/game/${gameId}/answer`, { 
        questionNumber,
        answer,
        teamId
     });
    return response;
}

export {
    getCurrentQuestion,
    getGameStatistics,
    answerQuestion,
    getCurrentQuestionAnswer
};
