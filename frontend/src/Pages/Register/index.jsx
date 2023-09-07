import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile } from 'firebase/auth';
import { registerUser } from '../../apis/AuthenticationAPI';
import firebaseClient from '../../services/firebase';
import Button from '@mui/material/Button';

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admin, setAdmin] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault()

    createUserWithEmailAndPassword(getAuth(firebaseClient), email, password)
      .then(async (userCredential) => {
        registerUser(firstName, lastName,admin).then((res) => {
          if (res.status === 201) {
            sendEmailVerification(userCredential.user).then(() => {
              updateProfile(userCredential.user, {
                displayName: `${firstName} ${lastName}`,
              }).then(() => {
                navigate("/login")
              });
            });
          }
        }).catch((error) => {
          console.log(error);
          userCredential.user.delete();
        });
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          alert('That email address is already in use!');
        }
        else {
          console.log(error);
        }
      });


  }

  return (
    <main >
      <section>
        <div>
          <h1 className='text-align'> Trivia Titans - Registration </h1>
          <form className="form-inline form-inline-column">
            <div>
              <label>
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First name"
              />
            </div>
            <div>
              <label>
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Last name"
              />
            </div>
            <div>
              <label htmlFor="email-address">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
              />
            </div>
            <div>
              <label htmlFor="admin">
                Admin
              </label>
              <input
                type="checkbox"
                value={admin}
                onChange={(e) => setAdmin(e.target.checked)}
                required
                placeholder="admin"
              />
            </div>

            <Button variant="outlined"
              type="submit"
              onClick={onSubmit}
            >
              Sign up
            </Button>

          </form>

          <p className='text-align'>
            Already have an account?{' '}
            <NavLink to="/login" >
              Sign in
            </NavLink>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Register
