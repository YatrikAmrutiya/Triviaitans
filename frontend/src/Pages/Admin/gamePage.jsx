import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    Typography,
    Container,
    Grid,
    Box,
    Link,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import DrawerComponent from './drawerComponent';
import { apihandler } from '../../helpers/apiHandler';

const GamesPage = () => {
    const [games, setGames] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [newGame, setNewGame] = useState({
        gameName: '',
        category: '',
        difficulty: '',
        numQuestions: 0,
        startTime: '',
        shortDescription: ''
    });
    const [editGame, setEditGame] = useState({
        gameId: '',
        gameName: '',
        category: '',
        difficulty: '',
        numQuestions: 0,
        startTime: '',
        shortDescription: ''
    });
    const [openGameDialog, setOpenGameDialog] = useState(false);
    const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
    const [selectedGameQuestions, setSelectedGameQuestions] = useState([]);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        fetchGames();
        fetchQuestions();
    }, []);

    const fetchGames = async () => {
        try {
            const response = await apihandler.get('/games');
            setGames(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    const fetchQuestions = async () => {
        try {
            const response = await apihandler.get('/questions');
            setQuestions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const createGame = async () => {
        const filteredQuestions = questions.filter(
            (question) => question.category === newGame.category && question.difficulty === newGame.difficulty
        );
        const newGameWithISOTime = {
            ...newGame,
            startTime: new Date(newGame.startTime).toISOString(),
        };


        if (newGameWithISOTime.numQuestions > filteredQuestions.length) {
            setSnackbarMessage(
                `There are not enough questions available for the selected category (${newGameWithISOTime.category}) and difficulty level (${newGameWithISOTime.difficulty}).`
            );
            setSnackbarOpen(true);
            return;
        }

        try {
            const response = await apihandler.post('/games', newGameWithISOTime);
            setGames([...games, response.data]);
            setNewGame({ gameName: '', category: '', difficulty: '', numQuestions: 0, startTime: '', shortDescription: '' });
            setSnackbarMessage('Game created successfully.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to create game.');
            setSnackbarOpen(true);
        }
    };

    const deleteGame = async (gameId) => {
        try {
            await apihandler.delete(`/games/${gameId}`);
            setGames(games.filter((game) => game.gameId !== gameId));
            setSnackbarMessage('Game deleted successfully.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to delete game.');
            setSnackbarOpen(true);
        }
    };

    const handleEditGameOpen = (game) => {
        setEditGame(game);
        setOpenGameDialog(true);
    };

    const handleEditGameClose = () => {
        setOpenGameDialog(false);
        setOpenQuestionDialog(false);
    };

    const handleViewQuestions = (game) => {
        setSelectedGameQuestions(game);
        setOpenQuestionDialog(true);
    };
    const handleEditGameSubmit = async () => {
        const filteredQuestions = questions.filter(
            (question) => question.category === editGame.category && question.difficulty === editGame.difficulty
        );
        const editGameWithISOTime = {
            ...editGame,
            startTime: new Date(editGame.startTime).toISOString(),
        };

        if (editGameWithISOTime.numQuestions > filteredQuestions.length) {
            setSnackbarMessage(
                `There are not enough questions available for the selected category (${editGameWithISOTime.category}) and difficulty level (${editGameWithISOTime.difficulty}).`
            );
            setSnackbarOpen(true);
            return;
        }

        try {
            await apihandler.put(`/games/${editGame.gameId}`, editGame);

            setOpenGameDialog(false);
            setEditGame({ gameName: '', category: '', difficulty: '', numQuestions: 0, startTime: '', shortDescription: '' });
            setEditSuccess(true);
            setSnackbarMessage('Game updated successfully.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error(error);
            setEditError(true);
            setSnackbarMessage('Failed to update game.');
            setSnackbarOpen(true);
        }
    };

    const handleEditGameInputChange = (e) => {
        setEditGame({ ...editGame, [e.target.name]: e.target.value });
    };

    const handleNumQuestionsChange = (e) => {
        setNewGame({ ...newGame, numQuestions: parseInt(e.target.value) });
    };

    return (
        <Container maxWidth="md">
            <DrawerComponent />
            <Box my={4}>
                <Typography variant="h3" component="h1" align="center" gutterBottom>
                    Games
                </Typography>

                <Box mt={4} mb={2}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Create Game
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Game Name"
                                value={newGame.gameName}
                                onChange={(e) => setNewGame({ ...newGame, gameName: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Category"
                                value={newGame.category}
                                onChange={(e) => setNewGame({ ...newGame, category: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Difficulty"
                                value={newGame.difficulty}
                                onChange={(e) => setNewGame({ ...newGame, difficulty: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Number of Questions"
                                type="number"
                                value={newGame.numQuestions}
                                onChange={handleNumQuestionsChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Short Description"
                                value={newGame.shortDescription}
                                onChange={(e) => setNewGame({ ...newGame, shortDescription: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="datetime-local"
                                value={newGame.startTime}
                                onChange={(e) => setNewGame({ ...newGame, startTime: e.target.value })}
                                fullWidth
                                inputProps={{ step: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" onClick={createGame}>
                                Create
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box mt={4} mb={2}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Games List
                    </Typography>

                    <List>
                        {games.map((game) => (
                            <ListItem key={game.gameId}>
                                <ListItemText primary={`Game Name: ${game.gameName}`} />
                                <ListItemText primary={`Category: ${game.category}`} />
                                <ListItemText primary={`Difficulty: ${game.difficulty}`} />
                                <Button color="primary" onClick={() => handleEditGameOpen(game)}>
                                    Edit
                                </Button>
                                <Button variant="outlined" color="primary" onClick={() => handleViewQuestions(game)}>
                                    View Questions
                                </Button>
                                <Button color="secondary" onClick={() => deleteGame(game.gameId)}>
                                    Delete
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Dialog fullWidth open={openQuestionDialog} onClose={handleEditGameClose}>
                    <DialogTitle>View Questions</DialogTitle>
                    <DialogContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Question</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Difficulty</TableCell>
                                    <TableCell>Options</TableCell>
                                    <TableCell>Correct Answer</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedGameQuestions?.questions?.map((question) => (
                                    <TableRow key={question.questionId}>
                                        <TableCell>{question.question}</TableCell>
                                        <TableCell>{question.category}</TableCell>
                                        <TableCell>{question.difficulty}</TableCell>
                                        <TableCell>{question.options.join(', ')}</TableCell>
                                        <TableCell>{question.correctAnswer}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditGameClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog fullWidth open={openGameDialog} onClose={handleEditGameClose}>
                    <DialogTitle>Edit Game</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Game Name"
                            name="gameName"
                            value={editGame.gameName}
                            onChange={handleEditGameInputChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            label="Category"
                            name="category"
                            value={editGame.category}
                            onChange={handleEditGameInputChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            label="Difficulty"
                            name="difficulty"
                            value={editGame.difficulty}
                            onChange={handleEditGameInputChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            label="Number of Questions"
                            name="numQuestions"
                            type="number"
                            value={editGame.numQuestions}
                            onChange={handleEditGameInputChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            label="Short Description"
                            name="shortDescription"
                            value={editGame.shortDescription}
                            onChange={handleEditGameInputChange}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            name="startTime"
                            type="datetime-local"
                            value={editGame.startTime}
                            onChange={handleEditGameInputChange}
                            fullWidth
                            inputProps={{ step: 1 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditGameClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleEditGameSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
                    <Alert onClose={() => setSnackbarOpen(false)}>{snackbarMessage}</Alert>
                </Snackbar>

                {editSuccess && (
                    <Alert severity="success" onClose={() => setEditSuccess(false)}>
                        Game updated successfully.
                    </Alert>
                )}

                {editError && (
                    <Alert severity="error" onClose={() => setEditError(false)}>
                        Failed to update game.
                    </Alert>
                )}
            </Box>
        </Container>
    );
};

export default GamesPage;
