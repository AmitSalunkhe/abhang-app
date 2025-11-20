import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWLOsH9NVh035PZeH31EiHWWqRe8m1UII",
    authDomain: "janani-mata-bhajan-mandal.firebaseapp.com",
    projectId: "janani-mata-bhajan-mandal",
    storageBucket: "janani-mata-bhajan-mandal.appspot.com",
    messagingSenderId: "468091245396",
    appId: "1:468091245396:web:b82f7b490605a8cf11aec1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
