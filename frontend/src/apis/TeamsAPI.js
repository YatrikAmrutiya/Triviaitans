const { apihandler } = require("../helpers/apiHandler");

const autosuggestTeamName = async () => {
    return apihandler.get("/team/suggest-name");
}

const createTeam = async (teamId, teamName) => {
    return apihandler.post("/team/create-team", { teamId, teamName });
}

const removeMember = async (teamId, userId) => {
    return apihandler.post("/team/remove-member", { teamId, userId });
}

const promoteToAdmin = async (teamId, userId) => {
    return apihandler.post("/team/promote-to-admin", { teamId, userId });
}

const leaveTeam = async (teamId) => {
    return apihandler.post("/team/leave-team", { teamId });
}

const getTeams = async () => {
    return apihandler.get("/team/get-teams");
}

const getTeamMembers = async (teamId) => {
    return apihandler.get(`/team/get-team-members/${teamId}` );
}

const getUsers = async () => {
    return apihandler.get("/team/get-users");           
}

const inviteMember = async (teamId, userEmail) => {
    return apihandler.post("/team/invite", { teamId, email: userEmail });
}

const repondToInvite = async (teamId, response) => {
    return apihandler.post("/team/invite/respond", { teamId, invitiationResponse: response });
}

const getTeamStatistics = async (teamId) => {
    return apihandler.get(`/team/get-team-statistics/${teamId}` );
}

export {
    autosuggestTeamName,
    createTeam,
    removeMember,
    promoteToAdmin,
    leaveTeam,
    getTeams,
    getTeamMembers,
    getUsers,
    inviteMember,
    repondToInvite,
    getTeamStatistics
};
