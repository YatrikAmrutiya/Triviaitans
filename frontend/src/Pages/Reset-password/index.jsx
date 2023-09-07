import { getAuth, sendPasswordResetEmail } from '@firebase/auth';
import react, { useState } from 'react';
import firebaseClient from '../../services/firebase';
import Button from '@mui/material/Button';

const Resetpassword = () => {
    const [email, setEmail] = useState('');
    const onsubmit = (e) => {
        if (!email) {
            alert("Please enter email")
            return;
        }
        e.preventDefault();
        // send reset password link to email using firebase
        sendPasswordResetEmail(getAuth(firebaseClient), email).then(() => {
            alert("Reset Password Link has been sent to your email")
        }).catch((error) => {
            console.log(error);
        }
        )
    }

    return (
        <>
            <main >
                <section>
                    <div>
                        <h1 className='text-align'> Reset Password</h1>
                        <form className="form-inline form-inline-column">
                            <div>
                                <label htmlFor="email-address">
                                    Email
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
                                <Button variant="outlined"
                                    onClick={onsubmit}
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>

                    </div>
                </section>
            </main>
        </>
    )
}

export default Resetpassword;