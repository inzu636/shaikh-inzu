// result.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, onValue, set, update, get, child
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ---------- Paste your Firebase config here ---------- */
const firebaseConfig = {
 apiKey: "AIzaSyDs2053g6QCkdd04JQTZZjqqEgW2Ko7FeU",
    authDomain: "sonu-256ed.firebaseapp.com",
    databaseURL: "https://inzu-aed4e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "sonu-256ed",
    storageBucket: "sonu-256ed.firebasestorage.app",
    messagingSenderId: "925837320396",
    appId: "1:925837320396:web:8822654baaf0fee89ea269"
  // Optional: add databaseURL: "https://<your-db>.firebaseio.com"
  databaseURL:"https://inzu-dae68-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
/* ---------------------------------------------------- */

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Admin key & secret
const ADMIN_KEY = "Sonu0786";

// Multi-bazar list (I used the list you gave)
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

// DOM references
const bazarsContainer = document.getElementById('bazars');
const adminPanel = document.getElementById('admin-panel');
const adminEditor = document.getElementById('adminEditor');
const adminFields = document.getElementById('adminFields');
const adminNote = document.getElementById('adminNote');
const unlockBtn = document.getElementById('unlockBtn');
const saveBtn = document.getElementById('saveBtn');
const unlockUrlBtn = document.getElementById('unlockUrlBtn');

// Build cards and attach DB listeners + timers
BAZARS.forEach(bazar => {
  const card = document.createElement('article');
  card.className = 'bazar-card';
  card.id = 'card-' + bazar.id;
  card.innerHTML = `
    <div class="bazar-info">
      <div class="bazar-name">${bazar.name}</div>
      <div class="bazar-times">Opens: ${formatTime(bazar.open)}</div>
    </div>
    <div style="text-align:right">
      <div class="label">Opens In</div>
      <div class="timer" id="timer-${bazar.id}">--:--:--</div>
      <div class="result-box" id="result-${bazar.id}" data-result="--">--</div>
    </div>
  `;
  bazarsContainer.appendChild(card);

  // DB listener
  const rRef = ref(db, 'results/' + bazar.id);
  onValue(rRef, snapshot => {
    const data = snapshot.val();
    const resultEl = document.getElementById('result-' + bazar.id);
    const saved = data && data.result ? data.result : '--';
    if (resultEl) {
      resultEl.setAttribute('data-result', saved);
      resultEl.textContent = saved;
    }
  });

  // setup timer for open time
  setupTimer(bazar);
});

// Timer helpers
function parseTimeHM(hm){
  const [hh, mm] = hm.split(':').map(Number);
  return { hh, mm };
}
function formatTime(hm){ // display like 09:30 AM/PM
  const { hh, mm } = parseTimeHM(hm);
  const d = new Date(); d.setHours(hh); d.setMinutes(mm); d.setSeconds(0);
  return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
}
function setupTimer(bazar){
  const timerEl = document.getElementById('timer-'+bazar.id);
  const resultEl = document.getElementById('result-'+bazar.id);
  let target = getNextOccurrence(bazar.open);

  function tick(){
    const now = new Date();
    let diff = target.getTime() - now.getTime();
    if (diff <= 0){
      // Live now
      if (timerEl) timerEl.textContent = '00:00:00';
      if (resultEl) resultEl.classList.add('live');
      // After showing, schedule next day
      target.setDate(target.getDate() + 1);
    } else {
      if (resultEl) resultEl.classList.remove('live');
      const hrs = Math.floor(diff/3600000);
      diff -= hrs*3600000;
      const mins = Math.floor(diff/60000);
      diff -= mins*60000;
      const secs = Math.floor(diff/1000);
      timerEl.textContent = ${pad(hrs)}:${pad(mins)}:${pad(secs)};
    }
  }
  tick();
  setInterval(tick,1000);
}
function getNextOccurrence(hm){
  const { hh, mm } = parseTimeHM(hm);
  const now = new Date();
  let candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
  if (candidate.getTime() <= now.getTime() - 1000) candidate.setDate(candidate.getDate()+1);
  return candidate;
}
function pad(n){ return String(n).padStart(2,'0'); }

// --- ADMIN: secret URL or key ---
(function checkSecret(){
  try {
    const params = new URLSearchParams(location.search);
    const s = params.get('admin');
    if (s && s === ADMIN_KEY) {
      adminPanel.classList.remove('hidden');
      adminEditor.classList.remove('hidden');
      adminNote.textContent = 'Unlocked via secret URL. DB lock cleared for you.';
      // clear lock flag in DB so admin can save
      set(ref(db, 'meta/locked'), false).catch(()=>{});
      loadAdminFields();
    }
  } catch(e){ console.warn(e) }
})();

unlockBtn?.addEventListener('click', () => {
  const key = document.getElementById('adminKey').value.trim();
  if (key === ADMIN_KEY) {
    adminPanel.classList.remove('hidden');
    adminEditor.classList.remove('hidden');
    adminNote.textContent = 'Unlocked with key. Use Save to update results.';
    loadAdminFields();
  } else alert('Incorrect admin key');
});

unlockUrlBtn?.addEventListener('click', async () => {
  // Requires admin key
  const key = document.getElementById('adminKey').value.trim();
  if (key !== ADMIN_KEY) return alert('Enter admin key to clear lock.');
  try {
    await set(ref(db, 'meta/locked'), false);
    adminNote.textContent = 'DB lock cleared.';
    alert('DB unlocked.');
  } catch(e){ alert('Failed to clear lock'); console.error(e) }
});

// load admin fields with inputs (3-digit enforced)
async function loadAdminFields(){
  adminFields.innerHTML = 'Loading...';
  try {
    // read current results once
    const snap = await get(ref(db, 'results'));
    const current = snap.exists() ? snap.val() : {};
    adminFields.innerHTML = '';
    BAZARS.forEach(b => {
      const existing = current && current[b.id] && current[b.id].result ? current[b.id].result : '';
      const row = document.createElement('div');
      row.className = 'admin-row';
      row.innerHTML = `
        <label style="min-width:150px;color:#cbd5e1">${b.name}</label>
        <input id="edit-${b.id}" maxlength="3" placeholder="e.g. 123" value="${existing}">
        <button data-id="${b.id}" class="refresh-btn">Refresh</button>
      `;
      adminFields.appendChild(row);
      row.querySelector('.refresh-btn').addEventListener('click', async (ev) => {
        const id = ev.target.dataset.id;
        const s = await get(child(ref(db), 'results/' + id));
        if (s.exists() && s.val().result) document.getElementById('edit-'+id).value = s.val().result;
        alert('Field refreshed from DB');
      });
    });
    adminNote.textContent = 'Edit values (3 digits) and click Save Results.';
  } catch(e) {
    adminFields.innerHTML = 'Failed to load fields';
    console.error(e);
  }
}

// Save button -> validate and write; then set lock = true
saveBtn?.addEventListener('click', async () => {
  try {
    // check DB lock
    const lockSnap = await get(ref(db, 'meta/locked'));
    const locked = lockSnap.exists() ? !!lockSnap.val() : false;
    if (locked) return alert('Results are locked. Use secret URL to unlock.');

    // read inputs, validate 3 digits
    const updates = {};
    let bad = false;
    BAZARS.forEach(b => {
      const v = (document.getElementById('edit-'+b.id)?.value || '').trim();
      if (v !== '' && !/^\d{3}$/.test(v)) {
        bad = true;
      }
      updates['results/' + b.id] = { result: v || '--', updatedAt: new Date().toISOString() };
    });
    if (bad) return alert('Har ek result exactly 3 digits hona chahiye (e.g. 123).');

    // atomic update
    await update(ref(db), updates);
    // set lock true
    await set(ref(db, 'meta/locked'), true);
    adminNote.textContent = 'Results saved and locked.';
    alert('Results updated and DB locked.');
  } catch(e){
    console.error(e);
    alert('Save failed');
  }
});

// Optional: show lock status live to admin
onValue(ref(db, 'meta/locked'), snap => {
  const locked = snap.exists() ? !!snap.val() : false;
  if (adminNote) adminNote.textContent = locked ? 'DB is LOCKED.' : 'DB is UNLOCKED.';
});

