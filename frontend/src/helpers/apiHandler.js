import axios from "axios";
import { BASEURL } from "../utils/consts";
import { getAuth } from "firebase/auth";
import firebaseClient from "../services/firebase";


const apihandler = axios.create({
    baseURL: BASEURL
});

apihandler.interceptors.request.use(
    async (config) => {
        let token;
        const currentUser = getAuth(firebaseClient).currentUser;
        if (currentUser) {
            token = await currentUser.getIdToken(true)
            localStorage.setItem("firebaseToken", token);
        }
        else {
            token = localStorage.getItem("firebaseToken")
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);

export { apihandler };
