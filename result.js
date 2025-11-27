// ==============================
// result.js  (FINAL WORKING FILE)
// ==============================

// Firebase CDN imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, onValue, set, update, get, child
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";


// -------------------------------
// YOUR FIREBASE CONFIG (UPDATED)
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBwqwNFAlRGPRRSPxLLSpryyDmpuCB6asc",
  authDomain: "inzu-dae68.firebaseapp.com",
  databaseURL: "https://inzu-dae68-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inzu-dae68",
  storageBucket: "inzu-dae68.firebasestorage.app",
  messagingSenderId: "68573381004",
  appId: "1:68573381004:web:935dc049c5b362141816a9"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);


// -------------------------------
// ADMIN SETTINGS
// -------------------------------
const ADMIN_KEY = "Sonu0786";


// -------------------------------
// MULTI BAZAR LIST
// -------------------------------
const BAZARS = [
  { id:'khaja_garib', name:'KHAJA GARIB', open:'09:30' },
  { id:'khaja_garib_nawaz', name:'KHAJA GARIB NAWAZ', open:'10:30' },
  { id:'dehli_baba', name:'DEHLI BABA', open:'11:45' },
  { id:'azmer_sharif', name:'AZMER SHARIF', open:'12:30' },
  { id:'baba_ka_gali', name:'BABA KA GALI', open:'13:30' },
  { id:'dehli_nor_yalai', name:'DEHLI NOR YALAI', open:'18:30' },
  { id:'noida_bazar', name:'NOIDA BAZAR', open:'16:30' },
  { id:'ahmedabad_city', name:'AHMEDABAD CITY', open:'12:30' },
  { id:'ram_mandir_5', name:'RAM MANDIR 5', open:'15:00' },
  { id:'east_dehli', name:'EAST DEHLI', open:'09:30' },
  { id:'faridabad_baba', name:'FARIDABAD BABA', open:'11:00' }
];


// -------------------------------
// DOM ELEMENTS
// -------------------------------
const bazarsContainer = document.getElementById("bazars");
const adminPanel      = document.getElementById("admin-panel");
const adminEditor     = document.getElementById("adminEditor");
const adminFields     = document.getElementById("adminFields");
const adminNote       = document.getElementById("adminNote");
const unlockBtn       = document.getElementById("unlockBtn");
const saveBtn         = document.getElementById("saveBtn");
const unlockUrlBtn    = document.getElementById("unlockUrlBtn");


// -------------------------------
// CREATE BAZAR CARDS + FIREBASE
// -------------------------------
BAZARS.forEach(bazar => {
  const card = document.createElement("article");
  card.className = "bazar-card";
  card.id = "card-" + bazar.id;

  card.innerHTML = `
    <div class="bazar-row">
      <div>
        <div class="bazar-name">${bazar.name}</div>
        <div class="bazar-times">Open: ${bazar.open}</div>
      </div>
      <div class="meta">
        <div class="label">Opens In</div>
        <div class="timer" id="timer-${bazar.id}">--:--:--</div>
      </div>
    </div>

    <div class="result-wrap">
      <div class="result-title">Result</div>
      <div class="result-box" id="result-${bazar.id}" data-result="--">--</div>
    </div>
  `;

  bazarsContainer.appendChild(card);

  // REALTIME LISTENER
  const dbRef = ref(db, "results/" + bazar.id);
  onValue(dbRef, snapshot => {
    const data = snapshot.val();
    const resultEl = document.getElementById("result-" + bazar.id);
    const saved = data?.result || "--";

    resultEl.textContent = saved;
    resultEl.setAttribute("data-result", saved);
  });

  setupTimer(bazar);
});


// -------------------------------
// TIMER FUNCTIONS
// -------------------------------
function parseTime(t) {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}
function getNextTime(timeStr) {
  const { h, m } = parseTime(timeStr);
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  if (next < now) next.setDate(next.getDate() + 1);
  return next;
}
function setupTimer(bazar) {
  const timerEl = document.getElementById("timer-" + bazar.id);
  const resultEl = document.getElementById("result-" + bazar.id);
  let target = getNextTime(bazar.open);

  setInterval(() => {
    const now = new Date();
    let diff = target - now;

    if (diff <= 0) {
      timerEl.textContent = "00:00:00";
      resultEl.classList.add("live");
      target = getNextTime(bazar.open);
    } else {
      resultEl.classList.remove("live");
      const hr = Math.floor(diff / 3600000); diff %= 3600000;
      const mn = Math.floor(diff / 60000);   diff %= 60000;
      const sc = Math.floor(diff / 1000);

      timerEl.textContent = ${pad(hr)}:${pad(mn)}:${pad(sc)};
    }
  }, 1000);
}
function pad(n) { return String(n).padStart(2, "0"); }


// -------------------------------
// ADMIN SECRET URL CHECK
// -------------------------------
(function () {
  const p = new URLSearchParams(location.search);
  if (p.get("admin") === ADMIN_KEY) {
    adminPanel.classList.remove("hidden");
    adminEditor.classList.remove("hidden");
    adminNote.textContent = "Admin unlocked via secret URL.";
    set(ref(db, "meta/locked"), false);
    loadAdminFields();
  }
})();


// -------------------------------
// MANUAL UNLOCK BUTTON
// -------------------------------
unlockBtn?.addEventListener("click", () => {
  const key = document.getElementById("adminKey").value.trim();
  if (key === ADMIN_KEY) {
    adminPanel.classList.remove("hidden");
    adminEditor.classList.remove("hidden");
    loadAdminFields();
  } else alert("Incorrect Admin Key");
});


// -------------------------------
// LOAD ADMIN FIELDS
// -------------------------------
async function loadAdminFields() {
  adminFields.innerHTML = "Loading...";

  const snap = await get(ref(db, "results"));
  const data = snap.exists() ? snap.val() : {};

  adminFields.innerHTML = "";

  BAZARS.forEach(b => {
    const val = data[b.id]?.result || "";
    adminFields.innerHTML += `
      <div class="admin-row">
        <label>${b.name}</label>
        <input id="edit-${b.id}" maxlength="3" value="${val}" placeholder="123">
      </div>
    `;
  });
}


// -------------------------------
// SAVE BUTTON (FINAL)
// -------------------------------
saveBtn?.addEventListener("click", async () => {
  const updates = {};
  let invalid = false;

  BAZARS.forEach(b => {
    const v = document.getElementById("edit-" + b.id).value.trim();
    if (v !== "" && !/^\d{3}$/.test(v)) invalid = true;

    updates["results/" + b.id] = {
      result: v || "--",
      updatedAt: new Date().toISOString()
    };
  });

  if (invalid) return alert("Har result 3 digits ka hona chahiye (e.g. 123)");

  await update(ref(db), updates);
  await set(ref(db, "meta/locked"), true);

  alert("Results Updated Successfully!");
});
