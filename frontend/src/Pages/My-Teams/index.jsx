import React, { useEffect, useState } from 'react';
import { getTeams, leaveTeam } from '../../apis/TeamsAPI';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import './My-Teams.css';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const MyTeams = () => {
    const [userTeams, setUserTeams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getTeams().then(
            (response) => {
                setUserTeams(response.data.userTeams);
            }
        ).catch((error) => {
            console.log(error);
        })
    }, [setUserTeams]);

    const getTeamMembers = (teamId) => {
        navigate(`/teams/${teamId}`);
    }

    // eslint-disable-next-line no-unused-vars
    const leaveFromTeam = (teamId) => {
        leaveTeam(teamId).then(
            (response) => {
                navigate('/dashboard');
            }
        ).catch((error) => {
            console.log(error);
        }
        )
    }

    return (
        <>
            <h1 className='text-align'>My Teams</h1>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">TEAM NAME</TableCell>
                            <TableCell align="left"></TableCell>
                            <TableCell align="left"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {userTeams.length !== 0 &&
                            userTeams.map((teams) => (
                                <TableRow
                                    key={teams.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell align="left">{teams.teamName}</TableCell>
                                    <TableCell align="left">
                                        <Button variant="outlined" type="button" onClick={() => getTeamMembers(teams.id)}>Get Team Members</Button>
                                    </TableCell>
                                    <TableCell align="left">
                                        <Button variant="outlined" type="button" onClick={() => leaveFromTeam(teams.id)}>Leave Team</Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                    </TableBody>
                </Table>
            </TableContainer>
            <Fab color="primary" aria-label="add" onClick={() => navigate('/teams')} sx={{
                margin: 0,
                transform: 'scale(1.3)',
                top: 'auto',
                right: 140,
                bottom: 150,
                left: 'auto',
                position: 'fixed',
            }}>
                <AddIcon />
            </Fab>
        </>
    );
}

export default MyTeams;
