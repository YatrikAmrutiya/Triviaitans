const { ApiGatewayManagementApiClient } = require("@aws-sdk/client-apigatewaymanagementapi");
let CONNECTIONS = {};

const ENDPOINT = "ykg9vhx2ul.execute-api.us-east-1.amazonaws.com/production/";
const client = new ApiGatewayManagementApiClient({ endpoint: ENDPOINT });

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
  for (const connectionId in CONNECTIONS) {
    if (CONNECTIONS.hasOwnProperty(connectionId)) {
      if (
        CONNECTIONS[connectionId].gameId === gameId &&
        CONNECTIONS[connectionId].teamId === teamId
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
  console.log("Current CONNECTIONS:", CONNECTIONS);

  CONNECTIONS[connectionId] = {
    name: payload.name,
    gameId: payload.gameId,
    teamId: payload.teamId, // Save the teamId associated with the user
  };
  console.log("Updated CONNECTIONS:", CONNECTIONS);

  const teamMembers = getTeamMembers(payload.gameId, payload.teamId); // Pass the teamId to getTeamMembers
  console.log(
    `Team members for gameId ${payload.gameId} and teamId ${payload.teamId}:`,
    teamMembers
  );

  const senderIndex = teamMembers.indexOf(connectionId);
  if (senderIndex !== -1) {
    teamMembers.splice(senderIndex, 1); // Remove the sender's connectionId from the teamMembers
  }

  await sendToAll(Object.keys(CONNECTIONS), { members: Object.values(CONNECTIONS) });
  console.log("Sent updated members list to all clients");

  await sendToAll(teamMembers, {
    systemMessage: `${CONNECTIONS[connectionId].name} has joined the chat`,
  });
  console.log("Sent individual welcome messages to team members");

  return {};
};

const sendPublic = async (connectionId, payload, context) => {
  console.log("sendPublic called");
  console.log("Current CONNECTIONS:", CONNECTIONS);

  const senderName = CONNECTIONS[connectionId].name;
  const message = payload.message;

  const teamMembers = getTeamMembers(
    CONNECTIONS[connectionId].gameId,
    CONNECTIONS[connectionId].teamId
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
  console.log("Current CONNECTIONS:", CONNECTIONS);

  const senderName = CONNECTIONS[connectionId].name;
  const senderGameId = CONNECTIONS[connectionId].gameId;
  const senderTeamId = CONNECTIONS[connectionId].teamId;

  const to = Object.keys(CONNECTIONS).find(
    (key) =>
      CONNECTIONS[key].name === payload.to &&
      CONNECTIONS[key].gameId === senderGameId &&
      CONNECTIONS[key].teamId === senderTeamId
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
  console.log("Current CONNECTIONS:", CONNECTIONS);

  const teamMembers = getTeamMembers(CONNECTIONS[connectionId].gameId);

  await sendToAll(teamMembers, {
    systemMessage: `${CONNECTIONS[connectionId].name} has left the chat`,
  });
  console.log("Sent system message to team members about the user leaving");

  delete CONNECTIONS[connectionId];
  console.log("Removed disconnected user from CONNECTIONS");

  await sendToAll(Object.keys(CONNECTIONS), { members: Object.values(CONNECTIONS) });
  console.log("Sent updated members list to all clients");

  return {};
};
