import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import { getGames, joinGame } from "../../apis/LobbyAPI";
import { getTeams } from '../../apis/TeamsAPI';
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';
import GameDashboard from '../../components/GameDashboard';

function GameDetails() {
  /**
   * @type {{user: import("firebase/auth").User}}
   */
  // @ts-ignore
  const { user } = useContext(FirebaseAuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  /**
   * @typedef {Object} Game
   * @property {string} gameId
   * @property {string} gameName
   * @property {string} category
   * @property {string} shortDescription
   * @property {string} difficulty
   * @property {Array<string>} teams
   */

  /**
   * The game state is used to store the game object
   * @type {[Game, Function]} game
   */
  // @ts-ignore
  const [game, setGame] = useState(null);
  const [teamId, setTeamId] = useState("");

  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  /**
   * @typedef {Object} Member
   * @property {string} userId
   * @property {string} userEmail
   * @property {string} role
   * @property {string} status
   */

  /**
   * @typedef {Object} Team
   * @property {string} id
   * @property {string} teamName
   * @property {Array<Member>} members
   */

  const [availableTeams, setAvailableTeams] = useState([]);
  const [isGameFinished, setIsGameFinished] = useState(false);

  useEffect(() => {
    getGames()
      .then((response) => {
        if (response.data) {
          const currentGame = response.data.find((game) => game.gameId === id);
          if (!currentGame.teams) {
            currentGame.teams = [];
          }
          setGame(currentGame)

          if (currentGame.endTime < new Date().toISOString()) {
            setIsGameFinished(true);
          }

          getTeams().then((teamResp) => {
            if (teamResp.data) {

              let usableTeams = teamResp.data.userTeams;
              usableTeams = usableTeams.filter((team) => {
                const members = team.members;
                if (currentGame.teams.includes(team.id)) {
                  setTeamId(team.id);
                  setIsAlreadyJoined(true);
                  return false;
                }
                return (
                  members.findIndex((member) => member.userId === user.uid && member.status === "accepted") !== -1
                  &&
                  currentGame.teams.findIndex((gameTeam) => gameTeam === team.id) === -1
                );
              });
              setAvailableTeams(usableTeams);
            }
          })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id, user.uid]);

  const handleJoinGame = (teamId, gameId) => {
    // Call the joinGame function with teamId and gameId
    joinGame(teamId, gameId)
      .then((response) => {
        navigate(`/game/${gameId}?teamId=${teamId}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (isGameFinished) {
    return <GameDashboard gameId={id} />
  }

  if (isAlreadyJoined) {
    navigate(`/game/${game.gameId}?teamId=${teamId}`)
  }


  if (!game) {
    // Handle the case when the game is not found
    return <div>Loading ...</div>;
  }

  function handleTeamIdChange(event) {
    setTeamId(event.target.value);
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3}>
        <h1>{game.gameName}</h1>
        <p>Number of Teams: {game.teams.length}</p>
        <p>Category: {game.category}</p>
        <p>Short Description: {game.shortDescription}</p>
        <p>Description : {game.difficulty}</p>
        <p>Start Time: {game.startTime}</p>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Join as team</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={teamId}
            label="Age"
            onChange={handleTeamIdChange}
          >
            {availableTeams.map(
              (
                /**
                 * @type {Team}
                 */
                team
              ) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.teamName}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
        <button
          onClick={() => {
            handleJoinGame(teamId, game.gameId);
          }}
        >
          Join the Game
        </button>
      </Paper>
    </Container>
  );
}

export default GameDetails;
