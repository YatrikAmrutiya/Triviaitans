import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  Select,
} from "@mui/material";
// import games from "./data";
import GameCard from "./components/GameCard";
import { getGames } from "../../apis/LobbyAPI";

function Lobby() {
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    getGames()
      .then((response) => {
        if (response.data) {
          setGames(response.data);
          console.group(games);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Function to calculate game duration based on startTime and endTime
  const getGameDuration = (startTime, endTime) => {
    const durationInMillis = Date.parse(endTime) - Date.parse(startTime);
    const minutes = Math.floor(durationInMillis / 60000); // Convert milliseconds to minutes
    return minutes;
  };

  // Filter games based on search query, difficulty, and duration
  const filteredGames = games.filter((game) => {
    const titleMatchesSearch = game.gameName.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatchesSearch = game.category.toLowerCase().includes(searchQuery.toLowerCase());
    const gameMatchesSearch = titleMatchesSearch || categoryMatchesSearch;

    const gameDuration = getGameDuration(game.startTime, game.endTime);

    const difficultyMatchesFilter = difficultyFilter === "all" || game.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    const durationMatchesFilter = timeFilter === "all" ||
      (timeFilter === "lessThan5" && gameDuration < 5) ||
      (timeFilter === "lessThan10" && gameDuration < 10) ||
      (timeFilter === "lessThan50" && gameDuration < 50) ||
      (timeFilter === "greaterThan60" && gameDuration >= 60);

    return gameMatchesSearch && difficultyMatchesFilter && durationMatchesFilter;
  });

  const handleDifficultyChange = (e) => {
    setDifficultyFilter(e.target.value);
  };

  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  return (
    <Container>
      <TextField
        label="Search Games by title or category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
      />
      <FormControl component="fieldset">
        <RadioGroup
          aria-label="Difficulty"
          name="difficulty"
          value={difficultyFilter}
          onChange={handleDifficultyChange}
          row
        >
          <FormControlLabel key="all" value="all" control={<Radio />} label="All" />
          <FormControlLabel key="easy" value="easy" control={<Radio />} label="Easy" />
          <FormControlLabel key="medium" value="medium" control={<Radio />} label="Medium" />
          <FormControlLabel key="hard" value="hard" control={<Radio />} label="Hard" />
        </RadioGroup>
      </FormControl>
      <FormControl fullWidth>
        <Select
          labelId="time-filter-label"
          id="time-filter"
          value={timeFilter}
          onChange={handleTimeFilterChange}
        >
          <MenuItem value="all">All Durations</MenuItem>
          <MenuItem value="lessThan5">Less than 5 mins</MenuItem>
          <MenuItem value="lessThan10">Less than 10 mins</MenuItem>
          <MenuItem value="lessThan50">Less than 50 mins</MenuItem>
          <MenuItem value="greaterThan60">Greater than 1 hour</MenuItem>
        </Select>
      </FormControl>
      <Grid container spacing={2}>
        {filteredGames.map((game, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <GameCard {...game} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Lobby;
