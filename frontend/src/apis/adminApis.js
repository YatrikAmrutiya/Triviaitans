const { apihandler } = require("../helpers/apiHandler");

const getGames = async () => {
    const response = apihandler.get("/games");
    return response;
}

const createGames = async () => {
    const response = apihandler.post("/games", { newGame });
    return response;
}

const deleteGame = async (gameId) => {
    return apihandler.delete(`/games/${gameId}`);
}
const editGames = async () => {
    const response = apihandler.put(`/games/${editGame.gameId}`, { editGame });
    return response;
}
const GameQuestions = async () => {
    const response = apihandler.get("/questions");
    return response;
}
const createQuestions = async () => {
    const response = apihandler.post("/questions", { ...newQuestion, tags: tags, });
    return response;
}
const deleteQuestion = async (gameId) => {
    return apihandler.delete(`/questions/${id}`);
}
const editQuestion = async () => {
    const response = apihandler.put(`/questions/${editQuestion.id}`, { ...editQuestion, tags: tags });
    return response;
}


export {
    getGames,
    createGames,
    deleteGame,
    editGames,
    GameQuestions,
    createQuestions,
    deleteQuestion

};