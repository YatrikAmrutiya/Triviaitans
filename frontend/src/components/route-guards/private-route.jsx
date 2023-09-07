import React, { useContext, useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { FirebaseAuthContext } from "../auth-providers/firebase-auth-provider";

export const PrivateRoute = (props) => {
    const { children } = props
    const location = useLocation()
    /**
     * @type {{user: import("firebase/auth").User}}
     */
    // @ts-ignore
    const { user } = useContext(FirebaseAuthContext);
    const [isEmailVerified, setIsEmailVerified] = useState(null)
    const [is2FaVerified, setIs2FaVerified] = useState(null)
    useEffect(() => {
        if (user) {
            user.getIdTokenResult(true)
                .then((idTokenResult) => {
                    // @ts-ignore
                    setIsEmailVerified(idTokenResult.claims.email_verified)
                    // @ts-ignore
                    setIs2FaVerified(idTokenResult.claims.is2faVerified)
                })
        }
    }, [user])


    if (user === undefined) {
        return <>Loading</>
    }
    else if (user===null) {
        return <Navigate
            replace={true}
            to="/login"
            state={{ from: `${location.pathname}${location.search}` }}
        />
    }
    else if(isEmailVerified === null || is2FaVerified === null){
        return <>Loading</>
    }
    else if (!isEmailVerified) {
        return <Navigate
            replace={true}
            to="/verify-email"
            state={{ from: `${location.pathname}${location.search}` }}
        />
    }
    else if (!is2FaVerified) {
        return <Navigate
            replace={true}
            to="/verify-2fa"
            state={{ from: `${location.pathname}${location.search}` }}
        />
    }
    else {
        return <>{children}</>
    }
}
