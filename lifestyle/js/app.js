/* ---------------------------------------------
   app.js — Dashboard UI Controls & Behavior
---------------------------------------------- */

function renderToggleButton(btn, isOn) {
  // Global synced animation start
  const start = window.__hbStart || (window.__hbStart = Date.now());
  const period = 2000; // ms
  const elapsed = ((Date.now() - start) % period);
  const delay = -elapsed; // negative delay to sync phase
  btn.style.setProperty('--hb-delay', `${delay}ms`);
  btn.innerHTML = `
    <svg class="hb hb-left" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
      <path class="hb-flat" d="M0,10 L100,10"></path>
      <path class="hb-wave" d="M0,10 L15,10 L20,2 L25,18 L30,10 L45,10 L50,10 L55,4 L60,16 L65,10 L100,10"></path>
    </svg>
    <span class="label">${isOn ? 'Enabled' : 'Disabled'}</span>
    <svg class="hb hb-right" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
      <path class="hb-flat" d="M0,10 L100,10"></path>
      <path class="hb-wave" d="M0,10 L15,10 L20,2 L25,18 L30,10 L45,10 L50,10 L55,4 L60,16 L65,10 L100,10"></path>
    </svg>`;
}

function setupToggle(id, workerName) {
  const btn = document.getElementById(id);

  // Initialize from persisted state
  const enabled = new Set(JSON.parse(localStorage.getItem('enabledWorkers') || '[]'));
  if (enabled.has(workerName)) {
    btn.classList.remove("toggle-off");
    btn.classList.add("toggle-on");
    renderToggleButton(btn, true);
  } else {
    btn.classList.remove("toggle-on");
    btn.classList.add("toggle-off");
    renderToggleButton(btn, false);
  }

  btn.addEventListener("click", () => {
    const isOn = btn.classList.contains("toggle-on");

    if (isOn) {
      stopWorker(workerName);
      btn.classList.remove("toggle-on");
      btn.classList.add("toggle-off");
      renderToggleButton(btn, false);
    } else {
      startWorker(workerName);
      btn.classList.remove("toggle-off");
      btn.classList.add("toggle-on");
      renderToggleButton(btn, true);
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupToggle("toggle-exercise", "exercise");
  setupToggle("toggle-food", "food");
  setupToggle("toggle-water", "water");
  setupToggle("toggle-work", "work");
  setupToggle("toggle-sleep", "sleep");
});
