import { Navigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { FirebaseAuthContext } from "../../components/auth-providers/firebase-auth-provider";

const VerifyEmail = () => {
    /**
     * @type {{user: import("firebase/auth").User}}
     */
    // @ts-ignore
    const { user } = useContext(FirebaseAuthContext);
    const [isEmailVerified, setIsEmailVerified] = useState(false)
    useEffect(() => {
        if (user) {
            user.getIdTokenResult()
                .then((idTokenResult) => {
                    setIsEmailVerified(user.emailVerified)
                })
        }
    }, [user])

    if (isEmailVerified) {
        return <Navigate to="/dashboard" />
    }
    else {
        return (

            <>
                <h1>Verify your email</h1>
                <p>Check your email for a link to verify your email address.</p>
            </>

        );
    }
};

export default VerifyEmail;
