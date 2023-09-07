import React, { useState, useEffect, useContext } from 'react';
import { getUserByEmail, getUserStatisticsByUserName } from '../../apis/ProfileAPI';
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';
import Avatar from '@mui/material/Avatar';
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// Displays the profile, achievements & statistics of other user(s)

function UserStatistics() {
    // State variables to store user data and statistics
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [totalPoints, setTotalPoints] = useState('');
    const [pointsByCategory, setPointsByCategories] = useState('');
    const [totalGames, setTotalGames] = useState('');
    const [firstQuestionAnswered, setFirstQuestionAnswered] = useState(false);
    const [firstQuestionAnsweredCorrectly, setFirstQuestionAnsweredCorrectly] = useState(false);

    // Access the user object from the Firebase authentication context
    const { user } = useContext(FirebaseAuthContext);

    // Get the userId from the URL params
    let { userId } = useParams();

    useEffect(() => {
        console.log(userId);
        // Fetch user data and statistics when userId is available and user object changes
        if (userId != null) {
            getUserByEmail(userId).then((res) => {
                if (res.status === 200) {
                    // Set user data from the API response
                    setFirstName(res.data.firstName);
                    setLastName(res.data.lastName);
                    setEmail(res.data.email);
                    setPhotoURL(res.data.displayUrl);
                    setFirstQuestionAnswered(res.data.firstQuestionAnswered);
                    setFirstQuestionAnsweredCorrectly(res.data.firstQuestionAnsweredCorrectly);
                    const userName = res.data.firstName + ' ' + res.data.lastName;

                    // Fetch user statistics based on the userName
                    getUserStatisticsByUserName(userName).then((res) => {
                        if (res.status === 200) {
                            console.log("User Statistics Fetched Successfully: ");
                            // Set user statistics from the API response
                            setTotalPoints(res.data.totalPoints);
                            setTotalGames(res.data.totalGames);
                            const pointsByCategory = res.data.pointsByCategory;
                            setPointsByCategories(pointsByCategory);
                        }
                    }).catch((error) => {
                        console.log(error);
                    });
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [user]);

    // Styles for the components
    const FieldWrapper = styled('div')`
        display: flex;
        align-items: center;
        margin-bottom: 15px;
    `;

    const FieldLabel = styled(Typography)`
        flex-basis: 25%;
    `;

    const FieldContent = styled('div')`
        flex-basis: 20%;
    `;

    // Prepare data for the bar chart
    const chartData = Object.keys(pointsByCategory).map((category) => ({
        category,
        points: pointsByCategory[category],
    }));

    return (
        <main>
            <section>
                <div>
                    <div>
                        <br></br><br></br>
                        <Typography variant="h4" gutterBottom>
                            Profile
                        </Typography>
                        <br></br>
                        <div style={{ border: "2px solid black", padding: "20px", display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <form>
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                First name:{' '}
                                            </FieldLabel>
                                            <FieldContent>
                                                <Typography variant="body1">
                                                    {firstName}
                                                </Typography>
                                            </FieldContent>
                                        </FieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                Last name:{' '}
                                            </FieldLabel>
                                            <FieldContent>
                                                <Typography variant="body1">
                                                    {lastName}
                                                </Typography>
                                            </FieldContent>
                                        </FieldWrapper>
                                    </div><br></br>
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                Email:{' '}
                                            </FieldLabel>
                                            <FieldContent>
                                                <Typography variant="body1">
                                                    {email}
                                                </Typography>
                                            </FieldContent>
                                        </FieldWrapper>
                                    </div>
                                </form>
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                <Avatar
                                    alt={firstName + lastName}
                                    src={photoURL || "/static/images/avatar/2.jpg"}
                                    style={{ width: '200px', height: '200px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <br></br><br></br>
                    <div style={{ border: '2px solid black', paddingLeft: '15px' }}>
                        <h3 style={{ color: '#1976d2' }}>Their Achievements are as follows:</h3>
                        {firstQuestionAnswered && (
                            <p style={{ fontWeight: 'bold' }}>🎖️ First Question Answered!!!!!</p>
                        )}
                        {firstQuestionAnsweredCorrectly && (
                            <p style={{ fontWeight: 'bold' }}>🏅 First Question Answered Correctly!!!!</p>
                        )}
                    </div>

                    <div>
                        <br></br><br></br>
                        <Typography variant="h4" gutterBottom>
                            Statistics
                        </Typography>
                        <br />
                    </div>
                    <div style={{ display: 'flex', height: '600px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ border: '2px solid black', paddingLeft: '15px' }}>
                                <h3 style={{ color: '#1976d2' }}>Their Statistics are as follows:</h3>
                                <p>
                                    <span style={{ fontWeight: 'bold' }}>Total Games Played :</span> {totalGames}
                                </p>
                                <p>
                                    <span style={{ fontWeight: 'bold' }}>Total Points Earned :</span> {totalPoints}
                                </p>
                                <p style={{ fontWeight: 'bold' }}>Points by Category :</p>
                                <ul>
                                    {Object.keys(pointsByCategory).map((category, index) => (
                                        <li key={index} style={{ marginBottom: '15px' }}>
                                            <strong>{category}:</strong> {pointsByCategory[category]}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div style={{ flex: 1, height: '300px' }}>
                            <BarChart width={600} height={300} data={chartData}>
                                <XAxis dataKey="category" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="points" fill="#1976d2" barSize={40} />
                            </BarChart>
                        </div>
                    </div>
                </div>
            </section>
            <ToastContainer position="top-center" />
        </main>
    );
};

export default UserStatistics;
