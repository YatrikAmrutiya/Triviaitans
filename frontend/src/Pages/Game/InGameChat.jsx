import React, { useContext, useEffect, useRef, useState } from "react";
import { FirebaseAuthContext } from "../../components/auth-providers/firebase-auth-provider";
import { Button, TextField } from "@mui/material";
import "../../styles/chat.css";

const Chat = ({ gameId, teamId, playerName }) => {
  const { user } = useContext(FirebaseAuthContext);
  const playerNameRef = useRef(null);
  const socketRef = useRef(null);
  const [name, setName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [message, setMessage] = useState("");
  const [responseMessages, setResponseMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const WEBSOCKET_ENDPOINT =
    "wss://ykg9vhx2ul.execute-api.us-east-1.amazonaws.com/production";

  useEffect(() => {
    const userName = user.displayName;
      playerNameRef.current = userName;
      setName(userName);

    // Create a WebSocket connection when the component mounts
    const newSocket = new WebSocket(WEBSOCKET_ENDPOINT);
    socketRef.current = newSocket;

    // Event handler for receiving messages from the WebSocket server
    newSocket.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      handleMessage(messageData);
    };

    // Event handler for successful connection
    newSocket.onopen = () => {
      console.log("trying to connect");
      if (playerNameRef.current && gameId && teamId) {
        // Send the setName request to the WebSocket server
        const data = {
          action: "setName",
          name: playerNameRef.current,
          gameId: gameId,
          teamId: teamId,
        };
        console.log("sending data for setName");
        newSocket.send(JSON.stringify(data));
        console.log(data);
        setIsConnected(true);
        setIsNameSet(true);
      } else {
        console.log("something is not set", name, gameId, teamId);
      }
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [gameId, teamId]);

  const handleMessage = (messageData) => {
    if (messageData) {
      if (messageData.publicMessage) {
        // Handle public message
        const sender = Object.keys(messageData.publicMessage)[0];
        const message = messageData.publicMessage[sender];
        const newMessage = { type: "public", sender: sender, text: message };
        setResponseMessages((prevMessages) => [...prevMessages, newMessage]);
      } else if (messageData.privateMessage) {
        // Handle private message
        const sender = Object.keys(messageData.privateMessage)[0];
        const message = messageData.privateMessage[sender];
        const newMessage = { type: "private", sender: sender, text: message };
        setResponseMessages((prevMessages) => [...prevMessages, newMessage]);
      } else if (messageData.systemMessage) {
        // Handle system message
        const message = messageData.systemMessage;
        const newMessage = { type: "system", text: message };
        setResponseMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    }
  };

  const handleSend = () => {
    // Check if the message starts with "@<name-of-the-receiver>"
    const recipientMatch = message.match(/@(\w+(\s*\w+)*)@/);
    if (recipientMatch) {
      const recipient = recipientMatch[1];
      handleSendPrivateMessage(recipient);
    } else {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    // Send the message to the WebSocket server
    if (socketRef.current && message) {
      const data = {
        action: "sendPublic",
        message: message,
      };
      socketRef.current.send(JSON.stringify(data));
      const newMessage = { type: "public", sender: name, text: message };
      setResponseMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");
    }
  };

  const handleSendPrivateMessage = (to) => {
    // Send a private message to the specified recipient (e.g., Alice)
    if (socketRef.current && message) {
      const recipientMatch = message.match(/@(\w+(\s*\w+)*)@/);
      let messageContent = message;

      if (recipientMatch) {
        // Remove the recipient part from the message content
        const recipient = recipientMatch[0];
        const recipientIndex = message.indexOf(recipient);
        messageContent = message
          .slice(recipientIndex + recipient.length)
          .trim();
      }

      // Send the private message to the WebSocket server
      const data = {
        action: "sendPrivate",
        to: to,
        message: messageContent,
      };
      socketRef.current.send(JSON.stringify(data));

      // Update the response messages
      const newMessage = {
        type: "private",
        sender: name,
        text: messageContent,
      };
      setResponseMessages((prevMessages) => [...prevMessages, newMessage]);

      // Clear the input message field
      setMessage("");
    }
  };

  return (
    <div>
      {isConnected ? (
        <div style={{ padding: "10px" }}>
          <h5 style={{ color: "greenyellow" }}>Connection Successful!</h5>
          <h5 style={{ color: "blue" }}>
            To send private message write @name@ followed by message.{" "}
          </h5>
          {!isNameSet ? (
            <div>
              <h2>Hi {user.displayName}, Click join to join the chat</h2>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsNameSet(true)}
              >
                Join
              </Button>
            </div>
          ) : (
            <div>
              <div className="message-container">
                {responseMessages.map((message, index) => (
                  <div
                    key={index}
                    style={
                      message.type === "private"
                        ? { color: "red" }
                        : message.type === "system"
                        ? { color: "blue", fontStyle: "italic" }
                        : {}
                    }
                  >
                    <strong>
                      {(message.type === "public" || message.type === "private") && message.sender !== name
                        ? `${message.sender}: `
                        : message.type === "system"
                        ? "System: "
                        : "Me: "}
                    </strong>
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="chat-controller">
                <TextField
                  label="Type your message"
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSend}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Connecting...</h2>
        </div>
      )}
    </div>
  );
};

export default Chat;
