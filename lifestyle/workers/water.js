const WEBHOOK = "https://discord.com/api/webhooks/1438499790173372457/Z3KZTTwPJPYCA5V6ClGOz4RvAd-nvNqGs2HR_haNelnnYL5X3F74PjhhkR4MOIIpy7TR";

function schedule(rem) {
  if (!rem.time) return;

  const now = new Date();
  const [h, m] = rem.time.split(":").map(Number);

  let target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  setTimeout(() => {
    fetch(WEBHOOK, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ content: `💧 **Water Reminder:** ${rem.text}` })
    });
    schedule(rem);
  }, target - now);
}

self.onmessage = (e) => {
  const { type, times, webhook } = e.data || {};
  if (type === 'test') {
    fetch(webhook || WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Water reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.water) {
    const reminders = [
      { time: times.water.wt_1, text: "Morning Water • 300–500ml" },
      { time: times.water.wt_2, text: "Hydration Break 💧" },
      { time: times.water.wt_3, text: "Water after lunch" },
      { time: times.water.wt_4, text: "Evening hydration" },
      { time: times.water.wt_5, text: "Pre-workout Water" }
    ];
    const send = (rem) => {
      const now = new Date();
      const [h, m] = rem.time.split(":").map(Number);
      let target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      setTimeout(() => {
        fetch(webhook || WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: `💧 **Water Reminder:** ${rem.text}` }) });
        send(rem);
      }, target - now);
    };
    reminders.forEach(send);
  }
};
