import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Paper,
    Container,
    Divider,
    Grid,
} from '@mui/material';
import DrawerComponent from './drawerComponent';
import { apihandler } from '../../helpers/apiHandler';

const QuestionsPage = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        category: '',
        difficulty: '',
        options: [],
        correctAnswer: '',
        explaination: '',
    });
    const [editQuestion, setEditQuestion] = useState({
        id: '',
        question: '',
        category: '',
        difficulty: '',
        options: [],
        correctAnswer: '',
        explaination: ''
    });
    const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);
    const [editError, setEditError] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await apihandler.get('/questions');
            setQuestions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const createQuestion = async () => {
        try {
            let tags = [];
            let tagResponse;

            try {
                tagResponse = await axios.post(
                    'https://us-central1-assignment-2-391222.cloudfunctions.net/serverless/serverless',
                    { question: newQuestion.question }
                );

                if (tagResponse.status === 200) {
                    tags = tagResponse.data.categories;
                }
            } catch (tagError) {
                console.error(tagError);
                setSnackbarMessage('Failed to fetch tags for the question.');
                setSnackbarOpen(true);
            }

            const response = await apihandler.post('/questions', {
                ...newQuestion,
                tags: tags,
            });

            setQuestions([...questions, response.data]);
            setNewQuestion({
                question: '',
                category: '',
                difficulty: '',
                options: [],
                correctAnswer: '',
                explaination: ''
            });
            setSnackbarMessage('Question created successfully.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to create question.');
            setSnackbarOpen(true);
        }
    };


    const deleteQuestion = async (id) => {
        try {
            await apihandler.delete(`/questions/${id}`);
            setQuestions(questions.filter((question) => question.id !== id));
            setSnackbarMessage('Question deleted successfully.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Failed to delete question.');
            setSnackbarOpen(true);
        }
    };

    const handleEditQuestionOpen = async (question) => {
        setEditQuestion(question);
        setOpenQuestionDialog(true);
    };

    const handleEditQuestionClose = () => {
        setOpenQuestionDialog(false);
    };

    const handleEditQuestionSubmit = async () => {
        try {
            let tags = null;
            try {
                const tagResponse = await axios.post('https://us-central1-assignment-2-391222.cloudfunctions.net/serverless/serverless', { question: editQuestion.question });
                tags = tagResponse.data.categories;
            }
            catch (tagError) {
                console.error(tagError);
                setSnackbarMessage('Failed to fetch tags for the question.');
                setSnackbarOpen(true);
            }
            console.log("+++++", tags);
            await apihandler.put(`/questions/${editQuestion.id}`, { ...editQuestion, tags: tags ? tags : "" });
            setOpenQuestionDialog(false);
            setEditSuccess(true);
            setSnackbarMessage('Question updated successfully.');
            setSnackbarOpen(true);

        } catch (error) {
            console.error(error);
            setEditError(true);
            setSnackbarMessage('Failed to update question.');
            setSnackbarOpen(true);
        }
    };

    const handleEditQuestionInputChange = (e) => {
        setEditQuestion({ ...editQuestion, [e.target.name]: e.target.value });
    };

    return (
        <>
            <DrawerComponent />
            <Container sx={{ width: '80% !important' }}>
                <Typography variant="h4">Questions</Typography>

                <div>
                    <Typography variant="h6">Create Question</Typography>
                    <TextField
                        label="Question"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Category"
                        value={newQuestion.category}
                        onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Difficulty"
                        value={newQuestion.difficulty}
                        onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Options (comma-separated)"
                        value={newQuestion.options.join(',')}
                        onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value.split(',') })}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Correct Answer"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="explaination"
                        value={newQuestion.explaination}
                        onChange={(e) => setNewQuestion({ ...newQuestion, explaination: e.target.value })}
                        variant="outlined"
                        margin="normal"
                        fullWidth
                    />
                    <Button variant="contained" onClick={createQuestion} color="primary">
                        Create
                    </Button>
                </div>

                <div>
                    <Typography variant="h6">Questions List</Typography>
                    <List>
                        {questions?.map((question) => (
                            <ListItem
                                key={question.id}
                                component={Paper}
                                sx={{
                                    my: 2,
                                    p: 2,
                                }}
                            >
                                <Grid container alignItems="center">
                                    <Grid item xs={12} >
                                        <ListItemText primary={`Question: ${question.question}`} />
                                    </Grid>

                                    <Grid item xs={12} >
                                        <ListItemText primary={`Category: ${question.category}`} />
                                    </Grid>

                                    <Grid item xs={12} >
                                        <ListItemText primary={`Difficulty: ${question.difficulty}`} />
                                    </Grid>

                                    <Grid item xs={12} >
                                        <ListItemText primary={`Options: ${question?.options?.join(', ')}`} />
                                    </Grid>

                                    <Grid item xs={12} >
                                        <ListItemText primary={`Correct Answer: ${question.correctAnswer}`} />
                                    </Grid>
                                    <Grid item xs={12} >
                                        <ListItemText primary={`Correct Answer: ${question.explaination}`} />
                                    </Grid>
                                    <Grid item xs={12} >
                                        <ListItemText primary={`Tags: ${question.tags}`} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button color="primary" onClick={() => handleEditQuestionOpen(question)}>
                                            Edit
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button color="secondary" onClick={() => deleteQuestion(question.id)}>
                                            Delete
                                        </Button>
                                    </Grid>
                                </Grid>
                            </ListItem>





                        ))}
                    </List>
                </div>

                <Dialog open={openQuestionDialog} onClose={handleEditQuestionClose}>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Question"
                            name="question"
                            value={editQuestion.question}
                            onChange={handleEditQuestionInputChange}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Category"
                            name="category"
                            value={editQuestion.category}
                            onChange={handleEditQuestionInputChange}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Difficulty"
                            name="difficulty"
                            value={editQuestion.difficulty}
                            onChange={handleEditQuestionInputChange}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Options (comma-separated)"
                            name="options"
                            value={editQuestion.options.join(',')}
                            onChange={(e) =>
                                setEditQuestion({ ...editQuestion, options: e.target.value.split(',') })
                            }
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Correct Answer"
                            name="correctAnswer"
                            value={editQuestion.correctAnswer}
                            onChange={handleEditQuestionInputChange}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label="Correct Answer"
                            name="correctAnswer"
                            value={editQuestion.explaination}
                            onChange={handleEditQuestionInputChange}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditQuestionClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleEditQuestionSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                />

                {editSuccess && (
                    <Alert severity="success" onClose={() => setEditSuccess(false)}>
                        Question updated successfully.
                    </Alert>
                )}

                {editError && (
                    <Alert severity="error" onClose={() => setEditError(false)}>
                        Failed to update question.
                    </Alert>
                )}
            </Container>
        </>
    );
};

export default QuestionsPage;
