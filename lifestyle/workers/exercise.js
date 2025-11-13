const WEBHOOK = "https://discord.com/api/webhooks/1438499804471758900/h3gwoXH7YJURIbVLVjtE6lY4v_XqkWnVwdrKL1FqzSApDTKpC4zIflEpEnNZtFAztrEn";

function schedule(rem) {
  if (!rem.time) return;

  const now = new Date();
  const [h, m] = rem.time.split(":").map(Number);

  let target = new Date();
  target.setHours(h, m, 0, 0);

  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target - now;

  setTimeout(() => {
    fetch(WEBHOOK, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ content: `🏋️ **Exercise Reminder:** ${rem.text}` })
    });
    schedule(rem); // reschedule tomorrow
  }, delay);
}

let MOD = 'exercise';
self.onmessage = (e) => {
  const { type, times, webhook, module } = e.data || {};
  if (module) MOD = module;
  if (type === 'test') {
    fetch(webhook || WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Exercise reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.exercise) {
    const norm = (v) => ({ t: (v && v.t) ? v.t : v, d: (v && v.d) ? v.d : [0,1,2,3,4,5,6] });
    const reminders = [
      { time: norm(times.exercise.ex_morning), text: "Morning mobility + 500ml water" },
      { time: norm(times.exercise.ex_gym), text: "Gym / Swimming time 💪" },
      { time: norm(times.exercise.ex_shake), text: "Post-workout Protein Shake" }
    ];
    const send = (rem) => {
      const now = new Date();
      const [h, m] = (rem.time.t||rem.time).split(":").map(Number);
      const days = rem.time.d || [0,1,2,3,4,5,6];
      let target = new Date();
      target.setHours(h, m, 0, 0);
      for (let i=0; i<8 && (target <= now || !days.includes(target.getDay())); i++) {
        target.setDate(target.getDate()+1);
      }
      setTimeout(() => {
        fetch(webhook || WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: `🏋️ **Exercise Reminder:** ${rem.text}` }) });
        try { self.postMessage({ type: 'fired', module: MOD }); } catch (_) {}
        send(rem);
      }, target - now);
    };
    reminders.forEach(send);
  }
};
