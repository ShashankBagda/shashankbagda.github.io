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

function startWorker(name, opts = {}) {
  if (workers[name]) return;
  // Workers are resolved relative to the page URL
  workers[name] = new Worker(`workers/${name}.js`);
  console.log(name + " worker started");
  if (!opts.silent && window.showToast) window.showToast(`${name.charAt(0).toUpperCase()+name.slice(1)} enabled`, 'success');

  // Pass current reminder times into the worker (web workers can't access localStorage)
  try {
    const times = JSON.parse(localStorage.getItem("reminderTimes")) || null;
    const hooks = JSON.parse(localStorage.getItem('webhookLinks')||'{}');
    const webhook = hooks && hooks[name] ? hooks[name] : null;
    workers[name].postMessage({ type: "init", times, webhook });
  } catch (e) {
    console.warn("Failed to send times to worker", e);
  }

  // Persist enabled state
  const enabled = new Set(JSON.parse(localStorage.getItem('enabledWorkers') || '[]'));
  enabled.add(name);
  localStorage.setItem('enabledWorkers', JSON.stringify([...enabled]));
}

function stopWorker(name, opts = {}) {
  if (workers[name]) {
    workers[name].terminate();
    workers[name] = null;
    console.log(name + " worker stopped");
  }
  if (!opts.silent && window.showToast) window.showToast(`${name.charAt(0).toUpperCase()+name.slice(1)} disabled`, 'info');
  // Update enabled state
  const enabled = new Set(JSON.parse(localStorage.getItem('enabledWorkers') || '[]'));
  enabled.delete(name);
  localStorage.setItem('enabledWorkers', JSON.stringify([...enabled]));
}

// Auto-start any previously enabled workers on page load
window.addEventListener('DOMContentLoaded', () => {
  const enabled = JSON.parse(localStorage.getItem('enabledWorkers') || '[]');
  enabled.forEach(name => {
    if (name in workers) startWorker(name, { silent: true });
  });
});

// Trigger an immediate webhook ping via the worker
function testWebhook(name) {
  if (!(name in workers)) return;
  if (!workers[name]) {
    startWorker(name, { silent: true });
  }
  try {
    workers[name].postMessage({ type: 'test' });
    if (window.showToast) window.showToast('Test sent to '+name, 'success');
  } catch (e) {
    console.warn('Failed to send test message to worker', name, e);
    if (window.showToast) window.showToast('Failed to test '+name, 'error');
  }
}

// Expose for UI
window.testWebhook = testWebhook;
