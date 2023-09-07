const { apihandler } = require("../helpers/apiHandler");

const getGames = async () => {
    const response = apihandler.get("/games");
    return response;
}

const joinGame = async (teamId, gameId) => {
    return apihandler.post("/join", { teamId, gameId });
}

export {
    getGames,
    joinGame
};