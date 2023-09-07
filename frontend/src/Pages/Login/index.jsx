import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithEmailAndPassword, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router-dom'
import firebaseClient from '../../services/firebase';
import { registerUser } from '../../apis/AuthenticationAPI';
import Button from '@mui/material/Button';
import './login.css'

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(getAuth(firebaseClient), email, password)
      .then(async () => {
        navigate("/dashboard")
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const additionalInfo = getAdditionalUserInfo(result);
        if (additionalInfo.isNewUser) {
          registerUser(result.user.displayName.split(" ")[0], result.user.displayName.split(" ")[1])
        }
        navigate("/dashboard")

      }).catch((error) => {
        console.log(error);
      });
  }

  const signInWithFacebook = () => {
    const provider = new FacebookAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const additionalInfo = getAdditionalUserInfo(result);
        if (additionalInfo.isNewUser) {
          registerUser(result.user.displayName.split(" ")[0], result.user.displayName.split(" ")[1])
        }
        navigate("/dashboard")

      }).catch((error) => {
        console.log(error);
      });
  }


  return (
    <>
      <main >
        <section>
          <div>
            <h1 className='text-align'> Trivia Titans </h1>

            <form className="form-inline form-inline-column">
              <div>
                <label htmlFor="email-address">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <br/>
              <div>
                <Button variant="outlined"
                  onClick={onLogin}
                >
                  Login
                </Button>
              </div>
            </form>
            <br/>
            <div className='text-align'>
              <Button variant="outlined"
                onClick={signInWithGoogle}
              >
                Login with Google
              </Button>
            
            <br/>
            <br/>
            
              <Button variant="outlined"
                onClick={signInWithFacebook}
              >
                Login with Facebook
              </Button>
            

            <p className="text-sm text-white text-center">
              Forgot your password? {' '}
              <NavLink to="/reset-password">
                Reset Password
              </NavLink>
            </p>

            <p className="text-sm text-white text-center">
              No account yet? {' '}
              <NavLink to="/register">
                Sign up
              </NavLink>
            </p>
            </div>

          </div>
        </section>
      </main>
    </>
  )
}

export default Login
