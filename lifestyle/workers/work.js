const WEBHOOK = "https://discord.com/api/webhooks/1438500870957436938/XQkTpSciuMBQGX8CW9g7co7KuAyecEJNaFpZVSZpRaSA2c8Sq9qgt5hlBXbzX35u7XuC";

function schedule(rem) {
  const now = new Date();
  const [h, m] = rem.time.split(":").map(Number);

  let target = new Date();
  target.setHours(h, m, 0, 0);

  if (target <= now) target.setDate(target.getDate() + 1);

  setTimeout(() => {
    fetch(WEBHOOK, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ content: `💻 **Work Reminder:** ${rem.text}` })
    });
    schedule(rem); // Repeat daily
  }, target - now);
}

self.onmessage = (e) => {
  const { type, times } = e.data || {};
  if (type === 'test') {
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Work reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.work) {
    const reminders = [
      { time: times.work.wk_start, text: "Start Work • Focus Mode On 💻" },
      { time: times.work.wk_break, text: "Stretch Break • 5 mins 🧘" },
      { time: times.work.wk_focus, text: "Refocus • Avoid distractions" },
      { time: times.work.wk_wrap, text: "Wrap Up • Review tasks" }
    ];
    reminders.forEach(schedule);
  }
};
