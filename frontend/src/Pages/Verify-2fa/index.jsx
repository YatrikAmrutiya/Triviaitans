import { Navigate, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { get2fa, verify2fa } from "../../apis/AuthenticationAPI";
import { FirebaseAuthContext } from '../../components/auth-providers/firebase-auth-provider';

const Verify2fa = () => {
    /**
 * @type {{user: import("firebase/auth").User}}
 */
    // @ts-ignore
    const { user } = useContext(FirebaseAuthContext);
    const navigate = useNavigate();
    const [securityQuestion, setSecurityQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    useEffect(() => {
        get2fa().then(
            (response) => {
                setSecurityQuestion(response.data.question)
            }
        ).catch(
            (error) => {
                if (error.response.status === 404) {
                    console.log("2fa question not set")
                    // @ts-ignore
                    setSecurityQuestion(null)
                }
                else {
                    console.log(error)
                }
            }
        )
    }, [setSecurityQuestion])

    if (securityQuestion === null) {
        console.log("security questions not set");
        return <Navigate to="/set-2fa" />
    } else if (securityQuestion === "") {
        return <div>loading security question</div>
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        verify2fa(securityQuestion, answer).then(
            (response) => {
                if (response.status === 200) {
                    if (user) {
                        user.getIdTokenResult(true).then(
                            (idTokenResult) => {
                                navigate("/dashboard")
                            }
                        )
                    }
                }
            }
        ).catch(
            (error) => {
                if (error.response.status === 400) {
                    console.log("2fa not enabled")
                }
                else {
                    console.log(error)
                }
            }
        )
    }

    return (
        <main >
            <section>
                <div>
                    <div>
                        <h1> Please answer the security question: </h1>
                        <form>

                            <div>
                                <label htmlFor="password">
                                    {securityQuestion}
                                </label>
                                <input
                                    type="password"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    required
                                    placeholder="your answer"
                                />
                            </div>

                            <button
                                type="submit"
                                onClick={onSubmit}
                            >
                                Sign in
                            </button>

                        </form>
                    </div>
                </div>
            </section>
        </main>

    );

};

export default Verify2fa;
