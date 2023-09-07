import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getGames } from '../../apis/LobbyAPI';
import InGameQA from './InGameQA';
import Chat from './InGameChat';
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';
import { Alert } from '@mui/material';

function Game() {
  const { user } = useContext(FirebaseAuthContext);

  const { gameId } = useParams();

  const search = useLocation().search;
  const teamId = new URLSearchParams(search).get("teamId");

  const [game, setGame] = useState(null);
  const currentTime = new Date();

  useEffect(() => {
    getGames().then((res) => {
      const currentGame = res.data.find((game) => game.gameId === gameId);
      setGame(currentGame);
    });
  }, [gameId]);

  if (game === null) {
    return <div>Loading...</div>;
  }

  if (game.startTime > currentTime.toISOString()) {
    const startTime = new Date(game.startTime);
    const timeToStartGame = startTime.getTime() - currentTime.getTime();
    console.log(timeToStartGame);
    setTimeout(() => {
      window.location.reload();
    }, timeToStartGame);
    return (
      <div>
        Game has not started yet, it will start at {new Date(game.startTime).toLocaleTimeString()}
        <Alert severity="info">You will auto-join when the game starts if you stay on this screen!</Alert>
        <Chat gameId={gameId} teamId={teamId} playerId={user.displayName}/>
      </div>);
  }
  else if (game.endTime < currentTime) {
    return <div>Game has ended, it ended at {game.endTime}</div>;
  }
  else {
    return <InGameQA gameId={game.gameId} teamId={teamId} />;
  }

}

export default Game;
