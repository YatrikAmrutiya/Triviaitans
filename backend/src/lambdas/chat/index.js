const AWS = require("aws-sdk");
let NAMES_DB = {};

const ENDPOINT = "ykg9vhx2ul.execute-api.us-east-1.amazonaws.com/production/";
const client = new AWS.ApiGatewayManagementApi({ endpoint: ENDPOINT });

const sendToOne = async (id, body) => {
  try {
    await client
      .postToConnection({
        ConnectionId: id,
        Data: Buffer.from(JSON.stringify(body)),
      })
      .promise();
  } catch (err) {
    console.error(err);
  }
};

const sendToAll = async (ids, body) => {
  const all = ids.map((i) => sendToOne(i, body));
  return Promise.all(all);
};

const getTeamMembers = (gameId, teamId) => {
  const teamMembers = [];
  for (const connectionId in NAMES_DB) {
    if (NAMES_DB.hasOwnProperty(connectionId)) {
      if (
        NAMES_DB[connectionId].gameId === gameId &&
        NAMES_DB[connectionId].teamId === teamId
      ) {
        teamMembers.push(connectionId);
      }
    }
  }
  console.log(
    `Team members for gameId ${gameId} and teamId ${teamId}:`,
    teamMembers
  );
  return teamMembers;
};

exports.handler = async (event, context) => {
  const connectionId = event.requestContext.connectionId;
  const routeKey = event.requestContext.routeKey;
  let body = {};

  try {
    if (event.body) {
      body = JSON.parse(event.body);
    }
  } catch (err) {
    console.error("Error parsing event body:", err);
  }

  console.log("Received event with routeKey:", routeKey);

  switch (routeKey) {
    case "$connect":
      await $connect(connectionId, body);
      break;
    case "$disconnect":
      await $disconnect(connectionId, body);
      break;
    case "setName":
      await setName(connectionId, body, context);
      break;
    case "sendPublic":
      await sendPublic(connectionId, body, context);
      break;
    case "sendPrivate":
      await sendPrivate(connectionId, body, context);
      break;
    default:
      console.warn("Unknown route:", routeKey);
  }
  const response = {
    statusCode: 200,
    body: JSON.stringify("Data sent successfully"),
  };
  return response;
};

const $connect = async (connectionId, payload) => {
  // Respond to the $connect request to establish the WebSocket connection.
  console.log("WebSocket connected with connectionId:", connectionId);
  const response = {
    statusCode: 200,
    body: JSON.stringify("Connected successfully"),
  };
  return response;
};

const setName = async (connectionId, payload, context) => {
  console.log("setName called");
  console.log("Current NAMES_DB:", NAMES_DB);

  NAMES_DB[connectionId] = {
    name: payload.name,
    gameId: payload.gameId,
    teamId: payload.teamId, // Save the teamId associated with the user
  };
  console.log("Updated NAMES_DB:", NAMES_DB);

  const teamMembers = getTeamMembers(payload.gameId, payload.teamId); // Pass the teamId to getTeamMembers
  console.log(
    `Team members for gameId ${payload.gameId} and teamId ${payload.teamId}:`,
    teamMembers
  );

  const senderIndex = teamMembers.indexOf(connectionId);
  if (senderIndex !== -1) {
    teamMembers.splice(senderIndex, 1); // Remove the sender's connectionId from the teamMembers
  }

  await sendToAll(Object.keys(NAMES_DB), { members: Object.values(NAMES_DB) });
  console.log("Sent updated members list to all clients");

  await sendToAll(teamMembers, {
    systemMessage: `${NAMES_DB[connectionId].name} has joined the chat`,
  });
  console.log("Sent individual welcome messages to team members");

  return {};
};

const sendPublic = async (connectionId, payload, context) => {
  console.log("sendPublic called");
  console.log("Current NAMES_DB:", NAMES_DB);

  const senderName = NAMES_DB[connectionId].name;
  const message = payload.message;

  const teamMembers = getTeamMembers(
    NAMES_DB[connectionId].gameId,
    NAMES_DB[connectionId].teamId
  );
  const senderIndex = teamMembers.indexOf(connectionId);
  if (senderIndex !== -1) {
    teamMembers.splice(senderIndex, 1); // Remove the sender's connectionId from the teamMembers
  }

  // Create an object with the sender's name as the key and the message as the value
  const messageObject = { [senderName]: message };

  await sendToAll(teamMembers, { publicMessage: messageObject });
  console.log("Sent public message to all team members");

  return {};
};

const sendPrivate = async (connectionId, payload, context) => {
  console.log("sendPrivate called");
  console.log("Current NAMES_DB:", NAMES_DB);

  const senderName = NAMES_DB[connectionId].name;
  const senderGameId = NAMES_DB[connectionId].gameId;
  const senderTeamId = NAMES_DB[connectionId].teamId;

  const to = Object.keys(NAMES_DB).find(
    (key) =>
      NAMES_DB[key].name === payload.to &&
      NAMES_DB[key].gameId === senderGameId &&
      NAMES_DB[key].teamId === senderTeamId
  );

  if (to) {
    const message = `${payload.message}`;
    const messageObject = { [senderName]: message };

    await sendToOne(to, { privateMessage: messageObject });
    console.log("Sent private message to recipient:", payload.to);
  }

  return {};
};

const $disconnect = async (connectionId, payload, context) => {
  console.log("disconnect called");
  console.log("Current NAMES_DB:", NAMES_DB);

  const teamMembers = getTeamMembers(NAMES_DB[connectionId].gameId);

  await sendToAll(teamMembers, {
    systemMessage: `${NAMES_DB[connectionId].name} has left the chat`,
  });
  console.log("Sent system message to team members about the user leaving");

  delete NAMES_DB[connectionId];
  console.log("Removed disconnected user from NAMES_DB");

  await sendToAll(Object.keys(NAMES_DB), { members: Object.values(NAMES_DB) });
  console.log("Sent updated members list to all clients");

  return {};
};
