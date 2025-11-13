const WEBHOOK = "https://discord.com/api/webhooks/1438500994408255559/AWKVoW-pkqS-YlDe9phSl43STT0bDE7FgLdhjKEI0v0kGGUf8TpIQxggV8_8r6Yoqv1L";

function schedule(rem) {
  const now = new Date();
  const [h, m] = rem.time.split(":").map(Number);

  let target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  setTimeout(() => {
    fetch(WEBHOOK, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ content:`😴 **Sleep Reminder:** ${rem.text}` })
    });
    schedule(rem);
  }, target - now);
}

self.onmessage = (e) => {
  const { type, times } = e.data || {};
  if (type === 'test') {
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Sleep reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.sleep) {
    const reminders = [
      { time: times.sleep.sl_wind, text: "Wind Down 🌙 • Reduce screen" },
      { time: times.sleep.sl_brush, text: "Brush Teeth 🦷 • Prepare for bed" },
      { time: times.sleep.sl_sleep, text: "Sleep Time 😴 • Aim for 7 hours" }
    ];
    reminders.forEach(schedule);
  }
};
