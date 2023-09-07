import React, { useEffect, useState } from "react";
import { getGameStatistics } from "../apis/gameAPI";
import { Grid, Paper, List, ListItem, ListItemText } from "@mui/material";


function GameDashboard(props) {

    const [inGameTeamPerformance, setInGameTeamPerformance] = useState([]);
    const [inGamePlayerPerformance, setInGamePlayerPerformance] = useState([]);

    useEffect(() => {
        getGameStatistics(props.gameId).then((response) => {
            if (response.data) {
                setInGameTeamPerformance(response.data.inGameTeamPerformance);
                setInGamePlayerPerformance(response.data.inGamePlayerPerformance);
            }
        }
        ).catch((error) => {
            console.log(error);
        }
        );
    }, [props.gameId]);

    return (
        <div>
            <h1>The game has already finished! Here's the leaderboard</h1>
            <Grid container spacing={2}>
                <Grid xs={6}>
                    <Paper elevation={3} style={{ padding: "20px", margin: "20px" }}>
                        <h2>Team</h2>
                        <List>
                            {inGameTeamPerformance && inGameTeamPerformance.map((team) => {
                                return (
                                    <ListItem key={team.teamId}>
                                        <ListItemText primary={team.teamName} />
                                        <ListItemText primary={team.points} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>
                <Grid xs={6}>
                    <Paper elevation={3} style={{ padding: "20px", margin: "20px" }}>
                        <h2>Players</h2>
                        <List>
                            {inGamePlayerPerformance && inGamePlayerPerformance.map((player) => {
                                return (
                                    <ListItem key={player.userId}>
                                        <ListItemText primary={player.userName} />
                                        <ListItemText primary={player.points} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

        </div>
    )

}

export default GameDashboard;
