// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNkfbPvdwz-RqSbMtQBCJguL1b6pwACmE",
    authDomain: "trivia-titans-sdp-16.firebaseapp.com",
    projectId: "trivia-titans-sdp-16",
    storageBucket: "trivia-titans-sdp-16.appspot.com",
    messagingSenderId: "412362666356",
    appId: "1:412362666356:web:8243bd72b6f6bc070d7c21"
};

// Initialize Firebase
const firebaseClient = initializeApp(firebaseConfig);
export default firebaseClient;
