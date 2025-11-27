import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, doc, getDoc }
from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ⭐ Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDs2053g6QCkdd04JQTZZjqqEgW2Ko7FeU",
    authDomain: "sonu-256ed.firebaseapp.com",
    projectId: "sonu-256ed",
    storageBucket: "sonu-256ed.firebasestorage.app",
    messagingSenderId: "925837320396",
    appId: "1:925837320396:web:8822654baaf0fee89ea269"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ⭐ Load Result
async function loadResult() {
    const docRef = doc(db, "starbazar", "result");
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        document.getElementById("result").innerText = snap.data().value;
    } else {
        document.getElementById("result").innerText = "No result found";
    }
}

loadResult();
