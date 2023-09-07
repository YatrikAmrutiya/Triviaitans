import React, { useState, useEffect } from 'react';
import { getUsers } from '../../apis/TeamsAPI';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import './Modal.css';


const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(
      (response) => {
        setUsers(response.data.users);
      }
    ).catch((error) => {
      console.log(error);
    })
  }, [setUsers]);

  const handleEmailChange = (e) => {
    setEmail(e?.currentTarget?.innerText || "");
  };

  const handleSubmit = async () => {
    await onSubmit(email);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Member</h2>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={users}
              onChange={handleEmailChange}
              getOptionLabel={(user) => user.email}
              renderInput={(params) => <div ref={params.InputProps.ref}>
                <input type="text" {...params.inputProps} />
              </div>}
            />
            <br />
        <Button variant="outlined" type="button" onClick={handleSubmit}>Submit</Button>
        <Button variant="outlined" type="button" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default Modal;
