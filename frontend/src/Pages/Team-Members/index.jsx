import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getTeamMembers, removeMember, promoteToAdmin, repondToInvite, inviteMember, getTeamStatistics } from "../../apis/TeamsAPI";
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import "../My-Teams/My-Teams.css";
import Modal from "./Modal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const TeamMembers = () => {
    /**
     * @type {{user: import("firebase/auth").User}}
     */
    // @ts-ignore
    const { user } = useContext(FirebaseAuthContext);
    let { teamId } = useParams();

    const [members, setMembers] = useState([]);
    const [totalPoints, setTotalPoints] = useState('');
    const [totalGames, setTotalGames] = useState('');
    const [pointsByCategory, setPointsByCategories] = useState('');
    const [accessLevel, setAccessLevel] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [teamStatisticsFound, setTeamStatisticsFound] = useState(false);

    useEffect(() => {
        getTeamMembers(teamId).then(
            (response) => {
                setMembers(response.data.members);
                setAccessLevel(response.data.accessLevel);
            }
        ).catch((error) => {
            console.log(error);
        })
    }, [setMembers, teamId]);

    useEffect(() => {
        getTeamStatistics(teamId).then(
            (response) => {
                console.log(response);
                if (response.status === 200) {
                    console.log("Team Statistics Fetched Successfully: ");
                    setTotalPoints(response.data.totalPoints);
                    setTotalGames(response.data.totalGames);
                    const pointsByCategory = response.data.pointsByCategory;
                    console.log(pointsByCategory);
                    setPointsByCategories(pointsByCategory);
                    setTeamStatisticsFound(true);
                } else {
                if (response.status === 404) {
                    console.log("No Team Statistics Found");
                    setTeamStatisticsFound(false);
                }
            }
        }
        ).catch((error) => {
            console.log(error);
        });
    }, [setTotalPoints, setTotalGames, setPointsByCategories, teamId]);

    const chartData = Object.keys(pointsByCategory).map((category) => ({
        category,
        points: pointsByCategory[category],
      }));

    const removeMemberFromTeam = (userId) => {
        removeMember(teamId, userId).then(
            (response) => {
                setMembers(response.data.members);
            }
        ).catch((error) => {
            console.log(error);
        }
        )
    }

    const promoteMemberToAdmin = (userId) => {
        promoteToAdmin(teamId, userId).then(
            (response) => {
                setMembers(response.data.members);
            }
        ).catch((error) => {
            console.log(error);
        }
        )
    }

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleAddMember = async (email) => {
        // Call the function to add member to DynamoDB table
        inviteMember(teamId, email).then(
            (response) => {
                setMembers(response.data.members);
            }
        ).catch((error) => {
            console.log(error);
        }
        )
    };

    const acceptInvitation = (userId) => {
        repondToInvite(teamId, 'accepted').then(
            (response) => {
                setMembers(response.data.members);
            }
        ).catch((error) => {
            console.log(error);
        }
        )
    }

    const rejectInvitation = (userId) => {
        repondToInvite(teamId, 'rejected').then(
            (response) => {
                setMembers(response.data.members);
            }
        ).catch((error) => {
            console.log(error);
        }
        )
    }

    return (
        <>
            <h1 className='text-align'>Team Members</h1>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>MEMBER ID</TableCell>
                            <TableCell align="left">MEMBER EMAIL</TableCell>
                            <TableCell align="left">ROLE</TableCell>
                            <TableCell align="left">STATUS</TableCell>
                            <TableCell align="left"></TableCell>
                            <TableCell align="left"></TableCell>
                            <TableCell align="left"></TableCell>
                            <TableCell align="left"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.length !== 0 &&
                            members.map((member) => (
                                <TableRow
                                    key={member.userId}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {member.userId}
                                    </TableCell>
                                    <TableCell align="left">{member.userEmail}</TableCell>
                                    <TableCell align="left">{member.role}</TableCell>
                                    <TableCell align="left">{member.status}</TableCell>
                                    <TableCell align="left">
                                        {accessLevel === 'admin' && member.role !== 'admin' &&
                                            <Button variant="outlined" type="button" onClick={() => removeMemberFromTeam(member.userId)}>Remove Member</Button>
                                        }
                                    </TableCell>
                                    <TableCell align="left">
                                        {member.role === 'member' && accessLevel === 'admin' &&
                                            <Button variant="outlined" type="button" onClick={() => promoteMemberToAdmin(member.userId)}>Promote to Admin</Button>
                                        }
                                    </TableCell>
                                    <TableCell align="left">
                                        {member.status === 'pending' && member.userId === user.uid &&
                                            <Button variant="outlined" type="button" onClick={() => acceptInvitation(member.userId)}>Accept Invitation</Button>
                                        }
                                    </TableCell>
                                    <TableCell align="left">
                                        {member.status === 'pending' && member.userId === user.uid &&
                                            <Button variant="outlined" type="button" onClick={() => rejectInvitation(member.userId)}>Reject Invitation</Button>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <br/>
            <div className='text-align'>
            {accessLevel === 'admin' &&
            <Button variant="outlined" type="button" onClick={handleModalOpen}>Add Member</Button>
            }
            <Modal isOpen={isModalOpen} onClose={handleModalClose} onSubmit={handleAddMember} />
            </div>
            <br/>
            <h1 className='text-align'>Team Statistics</h1>
            {teamStatisticsFound && 
            <div style={{ display: 'flex', height: '600px' }}>
                <div style={{ flex: 1 }}>
                <br></br>
                    <div style={{border: '2px solid black', paddingLeft: '15px'}}>
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
            }
            {!teamStatisticsFound &&
                <div style={{border: '2px solid black', paddingLeft: '15px'}}>
                    <p>
                    <span style={{ fontWeight: 'bold' }}>No Team Statistics Available</span>
                    </p>
                </div>
            }

        </>

    );
}

export default TeamMembers;
