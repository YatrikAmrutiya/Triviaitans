import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { set2fa } from "../../apis/AuthenticationAPI";
import Select from 'react-select';

const questions = [
    "What is your favorite color?",
    "What is your favorite food?",
    "What is your favorite animal?",
    "What is your favorite movie?",
    "What is your favorite book?",
    "What is your favorite song?",
    "What is your favorite sport?",
    "What is your favorite TV ",
    "What is your favorite place?",
    "What is your favorite game?"
]

const Set2fa = () => {
    const navigate = useNavigate();

    const [question1, setQuestion1] = useState("")
    const [answer1, setAnswer1] = useState("")
    const [question2, setQuestion2] = useState("")
    const [answer2, setAnswer2] = useState("")
    const [question3, setQuestion3] = useState("")
    const [answer3, setAnswer3] = useState("")

    const onSubmit = async (e) => {
        e.preventDefault();
        // @ts-ignore
        set2fa(question1, answer1, question2, answer2, question3, answer3).then((res) => {
            navigate("/login")
        }
        ).catch(
            (error) => {
                console.log(error)
            }
        )
    }

    return (
        <main >
            <section>
                <div>
                    <div>
                        <h1> Please set the security questions: </h1>
                        <form>
                            <div>
                                <label htmlFor="question1">Question 1</label>
                                <Select
                                    placeholder="Select Option"
                                    value={{label: question1}}
                                    options={questions.map((d) => {
                                        return {
                                            value: d,
                                            label: d
                                        }
                                    })}
                                    // @ts-ignore
                                    onChange={(e) => setQuestion1(e.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="answer1">Answer 1</label>
                                <input
                                    type="password"
                                    id="answer1"
                                    name="answer1"
                                    value={answer1}
                                    onChange={(e) => setAnswer1(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="question2">Question 2</label>
                                <Select
                                    placeholder="Select Option"
                                    value={{label: question2}}
                                    options={questions.map((d) => {
                                        return {
                                            value: d,
                                            label: d
                                        }
                                    })}
                                    // @ts-ignore
                                    onChange={(e) => setQuestion2(e.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="answer2">Answer 2</label>
                                <input
                                    type="password"
                                    id="answer2"
                                    name="answer2"
                                    value={answer2}
                                    onChange={(e) => setAnswer2(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="question3">Question 3</label>
                                <Select
                                    placeholder="Select Option"
                                    value={{label: question3}}
                                    options={questions.map((d) => {
                                        return {
                                            value: d,
                                            label: d
                                        }
                                    })}
                                    // @ts-ignore
                                    onChange={(e) => setQuestion3(e.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="answer3">Answer 3</label>
                                <input
                                    type="password"
                                    id="answer3"
                                    name="answer3"
                                    value={answer3}
                                    onChange={(e) => setAnswer3(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                onClick={onSubmit}
                            >
                                Continue
                            </button>

                        </form>
                    </div>
                </div>
            </section>
        </main>

    );

};

export default Set2fa;
