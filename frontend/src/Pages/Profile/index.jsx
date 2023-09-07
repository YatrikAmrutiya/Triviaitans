import React, { useState, useEffect, useContext } from 'react';
import { updateProfile, updateEmail } from 'firebase/auth';
import { editProfile, getPresignedUrl, uploadImageToS3, saveNotificationSettings, getUser } from '../../apis/ProfileAPI';
import { Button, Input, Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';
import Avatar from '@mui/material/Avatar';

// Displays the profile & notification settings of the user

function Profile() {
    // State variables to manage user data and edit modes
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [editFirstName, setEditFirstName] = useState(false);
    const [editLastName, setEditLastName] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureUploaded, setProfilePictureUploaded] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [displayUrl, setDisplayUrl] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [photoURL, setPhotoURL] = useState('');

    // State variables to manage notification settings
    const [teamInvite, setTeamInvite] = useState(false);
    const [newGame, setNewGame] = useState(false);
    const [gameJoining, setGameJoining] = useState(false);
    const [achievementUnlocked, setAchievementUnlocked] = useState(false);
    const [teamUpdates, setTeamUpdates] = useState(false);
    const [newTriviaGameAvailability, setNewTriviaGameAvailability] = useState(false);
    const [leaderboard, setLeaderboard] = useState(false);

    // Access the user object from the Firebase authentication context
    const { user } = useContext(FirebaseAuthContext);

    useEffect(() => {
        // Fetch user data and notification settings when the user object changes
        if (user != null) {
            const email = user.email;
            const name = user.displayName;
            setEmail(email);
            if (name) {
                const [firstName, lastName] = name.split(' ');
                setFirstName(firstName);
                setLastName(lastName);
            }
            setPhotoURL(user.photoURL);

            // Fetch user's notification settings
            getUser().then((res) => {
                if (res.status === 200) {
                    setTeamInvite(res.data.teamInviteCheckbox);
                    setNewGame(res.data.newGameCheckbox);
                    setGameJoining(res.data.gameJoiningCheckbox);
                    setAchievementUnlocked(res.data.achievementUnlockedCheckbox);
                    setTeamUpdates(res.data.teamUpdatesCheckbox);
                    setNewTriviaGameAvailability(res.data.newTriviaGameAvailabilityCheckbox);
                    setLeaderboard(res.data.leaderboardCheckbox);
                }
            }).catch((error) => {
                console.log(error);
                toast.error("Failed to fetch notification choice");
            });

        }
    }, [user]);

    // Styled components
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

    const FieldActions = styled('div')`
    flex-basis: 20%;
    display: flex;
    justify-content: flex-end;
  `;

    const NotificationFieldWrapper = styled('div')`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  `;

    const NotificationFieldLabel = styled(Typography)`
    flex-basis: 20%;
  `;

    const NotificationFieldContent = styled('div')`
    flex-basis: 25%;
  `;

    const FileUploaderButton = styled(Button)`
  flex-basis: 20%; /* Adjust the width of the file uploader button column */
`;

    // Function to handle profile picture upload
    const handleUploadImage = async () => {
        if (profilePicture) {
            const fileName = profilePicture.name;
            const file = profilePicture;
            const formData = new FormData();
            formData.append('profilePicture', file);

            try {
                const response = await getPresignedUrl(formData, fileName);
                if (response.status === 200) {
                    const uploadUrl = response.data.uploadUrl;
                    const displayUrl = response.data.displayUrl;
                    const uploadResponse = await uploadImageToS3(uploadUrl, file);
                    if (uploadResponse.status === 200) {
                        setProfilePictureUploaded(true);
                        setUploadedImageUrl(uploadUrl);
                        setDisplayUrl(displayUrl);
                        setPhotoURL(displayUrl);
                        updateProfile(user, { photoURL: displayUrl })
                            .then(() => {
                                toast.success("Profile Picture Uploaded Successfully!");
                                window.location.reload();
                            })
                            .catch((error) => {
                                console.log("Failed to update user profile photoURL:", error);
                            });
                    } else {
                        toast.success("Profile Picture Uploaded Successfully!");
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    // Function to handle form submission for profile update
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (user) {
                let updatedName = '';
                if (newFirstName && newLastName) {
                    updatedName = `${newFirstName} ${newLastName}`;
                } else if (!newFirstName && newLastName) {
                    updatedName = `${firstName} ${newLastName}`;
                } else if (newFirstName && !newLastName) {
                    updatedName = `${newFirstName} ${lastName}`;
                } else {
                    updatedName = `${firstName} ${lastName}`;
                }

                let updatedEmail = '';

                if (!newEmail) {
                    updatedEmail = `${email}`
                }
                else {
                    updatedEmail = `${newEmail}`
                }

                await updateProfile(user, {
                    displayName: updatedName,
                }).then(() => {
                    updateEmail(user, updatedEmail);
                });

                editProfile(newFirstName, newLastName, newEmail).then((res) => {
                    if (res.status === 200) {
                        toast.success("Profile Updated Successfully!");
                    }
                    else if (res.status === 204) {
                        toast.warn("No changes were done");
                    }
                }).catch((error) => {
                    console.log(error);
                    toast.error("Failed to update the profile");
                });

                setFirstName(newFirstName || firstName);
                setLastName(newLastName || lastName);
                setEmail(newEmail || email);

                setNewFirstName('');
                setNewLastName('');
                setNewEmail('');
                setProfilePicture(null);

                setEditFirstName(false);
                setEditLastName(false);
                setEditEmail(false);
                setProfilePictureUploaded(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Function to handle notification settings form submission
    const handleNotifications = async (e) => {
        e.preventDefault();

        const checkboxes = e.target.querySelectorAll('input[type="checkbox"]');
        const selectedValues = Array.from(checkboxes)
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.name);

        setTeamInvite(selectedValues.includes('teamInviteCheckbox'));
        setNewGame(selectedValues.includes('newGameCheckbox'));
        setGameJoining(selectedValues.includes('gameJoiningCheckbox'));
        setAchievementUnlocked(selectedValues.includes('achievementUnlockedCheckbox'));
        setTeamUpdates(selectedValues.includes('teamUpdatesCheckbox'));
        setNewTriviaGameAvailability(selectedValues.includes('newTriviaGameAvailabilityCheckbox'));
        setLeaderboard(selectedValues.includes('leaderboardCheckbox'));

        try {
            saveNotificationSettings(selectedValues).then((res) => {
                if (res.status === 200) {
                    toast.success("Notification Settings Updated Successfully!");
                }
                else if (res.status === 204) {
                    toast.warn("No changes were done");
                }
            }).catch((error) => {
                console.log(error);
                toast.error("Failed to update the profile");
            });
        }
        catch (error) {
            console.log(error);
        }
    };

    // Function to handle edit name button click
    const handleEditName = (type) => {
        if (type === 'firstName') {
            setEditFirstName(true);
        } else if (type === 'lastName') {
            setEditLastName(true);
        }
    };

    // Function to handle edit email button click
    const handleEditEmail = () => {
        setEditEmail(true);
    };

    // Function to save edited name
    const handleSaveName = (type) => {
        if (type === 'firstName') {
            setFirstName(newFirstName || firstName);
            setEditFirstName(false);
        } else if (type === 'lastName') {
            setLastName(newLastName || lastName);
            setEditLastName(false);
        }
    };

    // Function to save edited email
    const handleSaveEmail = () => {
        setEmail(newEmail || email);
        setEditEmail(false);
    };

    // Function to handle profile picture change
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        setSelectedFileName(file ? file.name : '');
        if (file) {
            URL.createObjectURL(file);
        }
    };

    return (
        <main>
            <section>
                <div>
                    <div>
                        <br></br><br></br>
                        <Typography variant="h4" gutterBottom>
                            My Profile
                        </Typography>
                        <br />
                        <div style={{ border: "2px solid black", padding: "20px", display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <form onSubmit={handleSubmit}>
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                First name:{' '}
                                            </FieldLabel>
                                            <FieldContent>
                                                {editFirstName ? (
                                                    <div>
                                                        <input
                                                            style={{ marginLeft: '10px' }}
                                                            type="text"
                                                            autoFocus="autoFocus"
                                                            value={newFirstName}
                                                            onChange={(e) => setNewFirstName(e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {firstName}
                                                    </Typography>
                                                )}
                                            </FieldContent>
                                            <FieldActions>
                                                {editFirstName ? (
                                                    <Button variant="outlined" type="button" style={{ marginLeft: "150px" }} onClick={() => handleSaveName('firstName')}>
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <Button variant="outlined" type="button" style={{ marginLeft: "150px" }} onClick={() => handleEditName('firstName')}>
                                                        Edit
                                                    </Button>
                                                )}
                                            </FieldActions>
                                        </FieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                Last name:{' '}
                                            </FieldLabel>
                                            <FieldContent>
                                                {editLastName ? (
                                                    <div>
                                                        <input
                                                            style={{ marginLeft: '10px' }}
                                                            type="text"
                                                            value={newLastName}
                                                            autoFocus="autoFocus"
                                                            onChange={(e) => setNewLastName(e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {lastName}
                                                    </Typography>
                                                )}
                                            </FieldContent>
                                            <FieldActions>
                                                {editLastName ? (
                                                    <Button variant="outlined" type="button" style={{ marginLeft: "150px" }} onClick={() => handleSaveName('lastName')}>
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <Button variant="outlined" type="button" style={{ marginLeft: "150px" }} onClick={() => handleEditName('lastName')}>
                                                        Edit
                                                    </Button>
                                                )}
                                            </FieldActions>
                                        </FieldWrapper>
                                    </div><br></br>
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                Email:{' '}
                                            </FieldLabel>
                                            <FieldContent>
                                                {editEmail ? (
                                                    <div>
                                                        <input
                                                            style={{ marginLeft: '10px' }}
                                                            type="text"
                                                            value={newEmail}
                                                            autoFocus="autoFocus"
                                                            onChange={(e) => setNewEmail(e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant="body1">
                                                        {email}
                                                    </Typography>
                                                )}
                                            </FieldContent>
                                            <FieldActions>
                                                {editEmail ? (
                                                    <Button variant="outlined" type="button" onClick={() => handleSaveEmail('email')}>
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <Button variant="outlined" type="button" onClick={() => handleEditEmail('email')}>
                                                        Edit
                                                    </Button>
                                                )}
                                            </FieldActions>
                                        </FieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <FieldWrapper>
                                            <FieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                Profile picture:
                                            </FieldLabel>
                                            <FieldContent>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProfilePictureChange}
                                                    style={{ display: 'none' }}
                                                    id="fileInput"
                                                />
                                                <label htmlFor="fileInput">
                                                    <Button variant="outlined" type="button" style={{ width: "160px" }} component="span">
                                                        Select Picture
                                                    </Button>
                                                </label>
                                                {selectedFileName && <Typography variant="body1" style={{ marginTop: "5px", color: "green" }}>{selectedFileName}</Typography>}
                                            </FieldContent>
                                            <FieldActions>
                                                <Button variant="outlined" type="button" onClick={handleUploadImage} style={{ width: "170px", marginLeft: "100px", }}>
                                                    Upload Image
                                                </Button>
                                            </FieldActions>
                                        </FieldWrapper>
                                    </div>
                                    <br />
                                    <br />
                                    <Button type="submit" variant="contained" color="primary">
                                        Update
                                    </Button>

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
                </div>

                <div>
                    <div>
                        <br></br><br></br>
                        <Typography variant="h5" gutterBottom>
                            Notification Settings
                        </Typography>
                        <br />
                        <div style={{ border: "2px solid black", padding: "20px", display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <form onSubmit={handleNotifications}>
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox
                                                    name="teamInviteCheckbox"
                                                    checked={teamInvite}
                                                    onChange={() => setTeamInvite(!teamInvite)} />
                                            </NotificationFieldLabel>
                                            <FieldContent style={{ fontWeight: "bold" }}>
                                                Team Invite
                                            </FieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox name="newGameCheckbox"
                                                    checked={newGame}
                                                    onChange={() => setNewGame(!newGame)} />
                                            </NotificationFieldLabel>
                                            <NotificationFieldContent style={{ fontWeight: "bold" }}>
                                                New Game
                                            </NotificationFieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox name="gameJoiningCheckbox"
                                                    checked={gameJoining}
                                                    onChange={() => setGameJoining(!gameJoining)} />
                                            </NotificationFieldLabel>
                                            <NotificationFieldContent style={{ fontWeight: "bold" }}>
                                                Game Joining
                                            </NotificationFieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox name="achievementUnlockedCheckbox"
                                                    checked={achievementUnlocked}
                                                    onChange={() => setAchievementUnlocked(!achievementUnlocked)} />
                                            </NotificationFieldLabel>
                                            <NotificationFieldContent style={{ fontWeight: "bold" }}>
                                                Achievement Unlocked
                                            </NotificationFieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox name="teamUpdatesCheckbox"
                                                    checked={teamUpdates}
                                                    onChange={() => setTeamUpdates(!teamUpdates)} />
                                            </NotificationFieldLabel>
                                            <NotificationFieldContent style={{ fontWeight: "bold" }}>
                                                Team Updates
                                            </NotificationFieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox name="newTriviaGameAvailabilityCheckbox"
                                                    checked={newTriviaGameAvailability}
                                                    onChange={() => setNewTriviaGameAvailability(!newTriviaGameAvailability)} />
                                            </NotificationFieldLabel>
                                            <NotificationFieldContent style={{ fontWeight: "bold" }}>
                                                New Trivia Game Availability
                                            </NotificationFieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <div>
                                        <NotificationFieldWrapper>
                                            <NotificationFieldLabel variant="body1" style={{ fontWeight: "bold" }}>
                                                <Checkbox name="leaderboardCheckbox"
                                                    checked={leaderboard}
                                                    onChange={() => setLeaderboard(!leaderboard)} />
                                            </NotificationFieldLabel>
                                            <NotificationFieldContent style={{ fontWeight: "bold" }}>
                                                Leaderboard & Rank Changes
                                            </NotificationFieldContent>
                                        </NotificationFieldWrapper>
                                    </div>
                                    <br />
                                    <Button type="submit" variant="contained" color="primary">
                                        Save
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <ToastContainer position="top-center" />
        </main>
    );
};

export default Profile;
