/* --------------------------------------------------
   scheduler.js — Start/Stop Web Workers from UI
--------------------------------------------------- */

const workers = {
  exercise: null,
  food: null,
  water: null,
  work: null,
  sleep: null
};

function startWorker(name) {
  if (workers[name]) return;
  // Workers are resolved relative to the page URL
  workers[name] = new Worker(`workers/${name}.js`);
  console.log(name + " worker started");

  // Pass current reminder times into the worker (web workers can't access localStorage)
  try {
    const times = JSON.parse(localStorage.getItem("reminderTimes")) || null;
    workers[name].postMessage({ type: "init", times });
  } catch (e) {
    console.warn("Failed to send times to worker", e);
  }

  // Persist enabled state
  const enabled = new Set(JSON.parse(localStorage.getItem('enabledWorkers') || '[]'));
  enabled.add(name);
  localStorage.setItem('enabledWorkers', JSON.stringify([...enabled]));
}

function stopWorker(name) {
  if (workers[name]) {
    workers[name].terminate();
    workers[name] = null;
    console.log(name + " worker stopped");
  }
  // Update enabled state
  const enabled = new Set(JSON.parse(localStorage.getItem('enabledWorkers') || '[]'));
  enabled.delete(name);
  localStorage.setItem('enabledWorkers', JSON.stringify([...enabled]));
}

// Auto-start any previously enabled workers on page load
window.addEventListener('DOMContentLoaded', () => {
  const enabled = JSON.parse(localStorage.getItem('enabledWorkers') || '[]');
  enabled.forEach(name => {
    if (name in workers) startWorker(name);
  });
});
