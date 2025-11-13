/* ---------------------------------------------
   app.js — Dashboard UI Controls & Behavior
---------------------------------------------- */

function setupToggle(id, workerName) {
  const btn = document.getElementById(id);

  btn.addEventListener("click", () => {
    const isOn = btn.classList.contains("toggle-on");

    if (isOn) {
      stopWorker(workerName);
      btn.classList.remove("toggle-on");
      btn.classList.add("toggle-off");
      btn.textContent = "Enable";
    } else {
      startWorker(workerName);
      btn.classList.remove("toggle-off");
      btn.classList.add("toggle-on");
      btn.textContent = "Disable";
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
