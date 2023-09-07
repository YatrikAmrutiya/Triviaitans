import { getAuth } from "firebase/auth";
import { createContext, useState, useEffect } from "react";
import React from "react";
import firebaseClient from "../../services/firebase";

export const FirebaseAuthContext =
    createContext(undefined);

export const FirebaseAuthProvider = ({ children }) => {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        const unsubscribe = getAuth(firebaseClient).onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                // @ts-ignore
                setUser(firebaseUser);
                firebaseUser.getIdToken().then((idToken) => {
                    localStorage.setItem("firebaseToken", idToken)
                })
            }
            else {
                // @ts-ignore
                setUser(null);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <FirebaseAuthContext.Provider
            // @ts-ignore
            value={{ user }}>
            {children}
        </FirebaseAuthContext.Provider>
    );
};
