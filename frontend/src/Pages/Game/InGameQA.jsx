import React, { useContext, useEffect, useRef, useState } from "react";
import Paper from '@mui/material/Paper';
import { answerQuestion, getCurrentQuestion, getCurrentQuestionAnswer, getGameStatistics } from "../../apis/gameAPI";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, Grid, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LinearProgress from "@mui/material/LinearProgress";
import Chat from "./InGameChat";
import { FirebaseAuthContext } from "../../components/auth-providers/firebase-auth-provider";

function InGameQA(props) {
  const { user } = useContext(FirebaseAuthContext);

  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(null);
  const [options, setOptions] = useState([]);
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [remainingAnswerSeconds, setRemainingAnswerSeconds] = useState(10);
  const [inGameTeamPerformance, setInGameTeamPerformance] = useState([]);
  const [inGamePlayerPerformance, setInGamePlayerPerformance] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const isLastQuestionRef = useRef(false);
  const intervalRef = useRef(null);
  const answerIntervalRef = useRef(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const fetchQuestion = async (gameId) => {
    setHasAnswered(false);

    setCorrectAnswer("");
    setExplanation("");
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    if (answerIntervalRef.current !== null) {
      clearInterval(answerIntervalRef.current);
    }

    if (isLastQuestionRef.current) {
      navigate(`/lobby/${gameId}`);
    }
    getCurrentQuestion(gameId).then((response) => {
      if (response.data) {
        setQuestion(response.data.question.question);
        setOptions(response.data.question.options);
        setQuestionNumber(response.data.questionNumber);
        const questionEndTime = new Date(response.data.questionEndTime);
        const correctAnswerEndTime = new Date(response.data.answerEndTime);
        isLastQuestionRef.current = response.data.isLastQuestion;

        const millisecondsToTriggerAnswerIn = questionEndTime.getTime() - new Date().getTime();
        const millisecondToTriggerNextQuestionIn = correctAnswerEndTime.getTime() - new Date().getTime();

        setTimeout(
          () => {
            getCurrentQuestionAnswer(gameId).then((response) => {
              if (response.data) {
                setCorrectAnswer(response.data.answer);
                setExplanation(response.data.explanation);
                const answerEndTime = new Date(response.data.answerEndTime);
                answerIntervalRef.current = setInterval(() => {
                  const remaining = Math.floor((answerEndTime.getTime() - new Date().getTime()) / 1000);
                  setRemainingAnswerSeconds(remaining < 0 ? 0 : remaining);
                }
                  , 1000);

              }
            }
            ).catch((error) => {
              console.log(error);
            }
            );
          }
          , millisecondsToTriggerAnswerIn
        );

        setTimeout(
          () => {
            fetchQuestion(gameId);
          }
          , millisecondToTriggerNextQuestionIn
        );
        intervalRef.current = setInterval(() => {
          const remaining = Math.floor((questionEndTime.getTime() - new Date().getTime()) / 1000);
          setRemainingSeconds(remaining < 0 ? 0 : remaining);
        }
          , 1000);
      }
    }).catch((error) => {
      console.log(error);
    }
    );

    getGameStatistics(gameId).then((response) => {
      if (response.data) {
        setInGameTeamPerformance(response.data.inGameTeamPerformance);
        setInGamePlayerPerformance(response.data.inGamePlayerPerformance);
      }
    }
    ).catch((error) => {
      console.log(error);
    }
    );
  }

  useEffect(() => {
    fetchQuestion(props.gameId);
  }, [props.gameId]);


  const submitAnswer = () => {
    setHasAnswered(true);
    answerQuestion(props.gameId, questionNumber, answer, props.teamId).then(() => {
    }
    ).catch((error) => {
      console.log(error);
    }
    );
  }

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  return (
    <div>
      <Grid container spacing={2}>
        {/* chat box */}
        {user && (
          <Grid xs={4}>
            <Paper>
              <h1>Chat box</h1>
              <Chat
                playerName={user.displayName}
                gameId={props.gameId}
                teamId={props.teamId}
              />
            </Paper>
          </Grid>
        )}
        <Grid xs={8}>
          <Paper elevation={3} style={{ padding: "20px", margin: "20px" }}>
            <LinearProgress variant="determinate" value={100 * remainingSeconds / 30} />
            <h1>Time remaining: {remainingSeconds}</h1>
            <h1>Question {questionNumber}</h1>
            <h2>{question}</h2>
            <FormControl>
              <FormLabel>Select your answer</FormLabel>
              <RadioGroup
                name="radio-buttons-group"
                onChange={handleAnswerChange}
              >
                {options && options.map((option) => {
                  return (
                    <FormControlLabel disabled={hasAnswered} key={option} value={option} control={<Radio />} label={option} />
                  );
                })}
              </RadioGroup>
            </FormControl>
          </Paper>

          <Button variant="contained" color="primary" disabled={hasAnswered} onClick={submitAnswer}>submit</Button>

          {correctAnswer && (
            <Paper elevation={3} style={{ padding: "20px", margin: "20px" }}>
              <LinearProgress variant="determinate" value={100 * remainingAnswerSeconds / 10} />
              <h1>{correctAnswer === answer ? "You got it right! 🎉" : "You got it wrong 😢"}</h1>
              <h2>The correct answer is</h2>
              <h3>{correctAnswer}</h3>
              <h2>Explanation</h2>
              <h3>{explanation}</h3>
            </Paper>
          )}

        </Grid>
        <Grid xs={4}>
          <Paper>
            <h1>Leaderboard</h1>
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
            <h2>Players</h2>

            <List>
              {inGamePlayerPerformance &&
                inGamePlayerPerformance.map((player) => {
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
  );

}

export default InGameQA;
