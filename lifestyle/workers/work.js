const WEBHOOK = "https://discord.com/api/webhooks/1438500870957436938/XQkTpSciuMBQGX8CW9g7co7KuAyecEJNaFpZVSZpRaSA2c8Sq9qgt5hlBXbzX35u7XuC";

function schedule(rem, webhook) {
  const now = new Date();
  const [h, m] = (rem.time.t||rem.time).split(":").map(Number);
  const days = rem.time.d || [0,1,2,3,4,5,6];
  let target = new Date();
  target.setHours(h, m, 0, 0);
  for (let i=0;i<8 && (target<=now || !days.includes(target.getDay())); i++) target.setDate(target.getDate()+1);
  setTimeout(() => {
    fetch(webhook || WEBHOOK, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ content: `💻 **Work Reminder:** ${rem.text}` }) });
    try { self.postMessage({ type: 'fired', module: 'work' }); } catch (_) {}
    schedule(rem, webhook);
  }, target - now);
}

self.onmessage = (e) => {
  const { type, times, webhook, module } = e.data || {};
  if (type === 'test') {
    fetch(webhook || WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Work reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.work) {
    const norm = (v) => ({ t: (v && v.t) ? v.t : v, d: (v && v.d) ? v.d : [0,1,2,3,4,5,6] });
    const reminders = [
      { time: norm(times.work.wk_start), text: "Start Work • Focus Mode On 💻" },
      { time: norm(times.work.wk_break), text: "Stretch Break • 5 mins 🧘" },
      { time: norm(times.work.wk_focus), text: "Refocus • Avoid distractions" },
      { time: norm(times.work.wk_wrap), text: "Wrap Up • Review tasks" }
    ];
    reminders.forEach(r => schedule(r, webhook));
  }
};
