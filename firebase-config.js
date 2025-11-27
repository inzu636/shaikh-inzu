// Firebase Config + Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDs2053g6QCkdd04JQTZZjqqEgW2Ko7FeU",
    authDomain: "sonu-256ed.firebaseapp.com",
    projectId: "sonu-256ed",
    storageBucket: "sonu-256ed.firebasestorage.app",
    messagingSenderId: "925837320396",
    appId: "1:925837320396:web:8822654baaf0fee89ea269"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);