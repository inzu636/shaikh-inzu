
// ---------------------------------------
// Firebase Imports (Correct for your CDN)
// ---------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, onValue, set, update, get, child
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";


// ---------------------------------------
// YOUR CORRECT FIREBASE CONFIG
// ---------------------------------------
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
const db = getDatabase(app);


// ---------------------------------------
// ADMIN KEY
// ---------------------------------------
const ADMIN_KEY = "Sonu0786";


// ---------------------------------------
// MULTI BAZAR LIST
// ---------------------------------------
const BAZARS = [
  { id:'khaja_garib', name:'KHAJA GARIB', open:'09:30' },
  { id:'khaja_garib_nawaz', name:'KHAJA GARIB NAWAZ', open:'10:30' },
  { id:'dehli_baba', name:'DEHLI BABA', open:'11:45' },
  { id:'azmer_sharif', name:'AZMER SHARIF', open:'12:30' },
  { id:'baba_ka_gali', name:'BABA KA GALI', open:'01:30' },
  { id:'dehli_nor_yalai', name:'DEHLI NOR YALAI', open:'06:30' },
  { id:'noida_bazar', name:'NOIDA BAZAR', open:'04:30' },
  { id:'ahmedabad_city', name:'AHMEDABAD CITY', open:'12:30' },
  { id:'ram_mandir_5', name:'RAM MANDIR 5', open:'03:00' },
  { id:'east_dehli', name:'EAST DEHLI', open:'09:30' },
  { id:'faridabad_baba', name:'FARIDABAD BABA', open:'08:00' }
];


// ---------------------------------------
// DOM
// ---------------------------------------
const bazarsContainer = document.getElementById("bazars");
const adminPanel     = document.getElementById("admin-panel");
const adminEditor    = document.getElementById("adminEditor");
const adminFields    = document.getElementById("adminFields");
const adminNote      = document.getElementById("adminNote");
const unlockBtn      = document.getElementById("unlockBtn");
const saveBtn        = document.getElementById("saveBtn");
const unlockUrlBtn   = document.getElementById("unlockUrlBtn");


// ---------------------------------------
// CREATE BAZAR CARDS + REALTIME LISTENERS
// ---------------------------------------
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
        
        <div class="timer" id="timer-${bazar.id}"></div>
      </div>
    </div>

    <div class="result-wrap">
      <div class="result-title">Result</div>
      <div class="result-box" id="result-${bazar.id}" data-result="--">--</div>
    </div>
  `;

  bazarsContainer.appendChild(card);

  // REALTIME DATABASE LISTENER
  const rRef = ref(db, "results/" + bazar.id);
  onValue(rRef, snap => {
    const data = snap.val();
    const result = data?.result || "--";
    document.getElementById("result-" + bazar.id).textContent = result;
  });

  setupTimer(bazar);
});


// ---------------------------------------
// TIMER SYSTEM
// ---------------------------------------
function parseTime(t) {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

function nextTime(t) {
  const { h, m } = parseTime(t);
  const now = new Date();
  let x = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  if (x < now) x.setDate(x.getDate() + 1);
  return x;
}

function setupTimer(bazar) {
  const tEl = document.getElementById("timer-" + bazar.id);
  let target = nextTime(bazar.open);

  setInterval(() => {
    const d = target - new Date();
    if (d <= 0) {
      tEl.textContent = "00:00:00";
      target = nextTime(bazar.open);
      return;
    }
    const h = Math.floor(d / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    const s = Math.floor((d % 60000) / 1000);

    tEl.textContent = `${String(h).padStart(2,"0")}:``${String(m).padStart(2,"0")}:``${String(s).padStart(2,"0")};`
  }, 1000);
}


// ---------------------------------------
// ADMIN SECRET URL
// ---------------------------------------
(function () {
  const p = new URLSearchParams(location.search);
  if (p.get("admin") === ADMIN_KEY) {
    adminPanel.classList.remove("hidden");
    adminEditor.classList.remove("hidden");
    loadAdminFields();
  }
})();


// ---------------------------------------
// ADMIN UNLOCK (manual)
// ---------------------------------------
unlockBtn?.addEventListener("click", () => {
  const key = document.getElementById("adminKey").value;
  if (key === ADMIN_KEY) {
    adminEditor.classList.remove("hidden");
    loadAdminFields();
  } else {
    alert("Incorrect Admin Key");
  }
});


// ---------------------------------------
// LOAD ADMIN FIELDS
// ---------------------------------------
async function loadAdminFields() {
  const snap = await get(ref(db, "results"));
  const data = snap.val() || {};

  adminFields.innerHTML = "";

  BAZARS.forEach(b => {
    const v = data[b.id]?.result || "";

    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
      <label>${b.name}</label>
      <input id="edit-${b.id}" maxlength="3" value="${v}" placeholder="123">
    `;
    adminFields.appendChild(row);
  });
}


// ---------------------------------------
// SAVE RESULTS
// ---------------------------------------
saveBtn?.addEventListener("click", async () => {
  const updates = {};

  for (let b of BAZARS) {
    const v = document.getElementById("edit-" + b.id).value.trim();
    if (v !== "" && !/^\d{2}$/.test(v)) return alert("2 digits ONLY");

    updates["results/" + b.id] = {
      result: v || "--",
      updatedAt: new Date().toISOString()
    };
  }

  await update(ref(db), updates);
  alert("All Results Updated!");
});
