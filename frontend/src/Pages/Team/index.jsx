import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import './style.css';
import { autosuggestTeamName, createTeam } from '../../apis/TeamsAPI';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


function Team() {

  const [teamName, setTeamName] = useState('');
  const teamId = uuid();
  const navigate = useNavigate();

  useEffect(() => {
    autosuggestTeamName().then(
      (response) => {
        setTeamName(response.data.suggestedTeamName);
      }
    ).catch((error) => {
      console.log(error);
    })
  }, [setTeamName]);

  let handleSubmit = (event) => {
    event.preventDefault();
    createTeam(teamId, teamName);
    navigate(`/dashboard`);
  }


  return (
    <>
      <h1 className='text-align'>Let's Create Team</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-inline">
          <label>Team Name:</label>
          <input type="text" name="teamName" value={teamName} required onChange={e => setTeamName(e.target.value)} />

          <Button variant="outlined" type="submit">Submit</Button>
        </div>
      </form>
    </>
  )
}

export default Team;
