import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const GameCard = ({
  gameName,
  shortDescription,
  startTime,
  endTime,
  gameId,
  difficulty,
  category,
}) => {
  // Convert to ISO locale format
  const isoLocaleOptions = {
    dateStyle: "full",
    timeStyle: "short",
  };
  const formattedStartTime = new Date(startTime).toLocaleString(
    "en-US",
    isoLocaleOptions
  );
  const formattedEndTime = new Date(endTime).toLocaleString(
    "en-US",
    isoLocaleOptions
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{gameName}</Typography>
        <Typography variant="body2">Level: {difficulty}</Typography>
        <Typography variant="body2">Category: {category}</Typography>
        <Typography variant="body2">Description: {shortDescription}</Typography>
        <Typography variant="body2">Starts: {formattedStartTime}</Typography>
        <Typography variant="body2">Ends: {formattedEndTime}</Typography>
        <Typography variant="body2">
          Duration: {(new Date(endTime) - new Date(startTime)) / (1000 * 60)}{" "}
          Minutes
        </Typography>
        <Link to={`${gameId}`}>See More</Link>
      </CardContent>
    </Card>
  );
};

export default GameCard;
