const WEBHOOK = "https://discord.com/api/webhooks/1438500068737945731/q5TQePGq-PMsqAUwQJe-zuCS3xs6nS8_fyViAwXom4GfsDwsZgRGuMPsLszoh09MWruW";

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
      body: JSON.stringify({ content: `🍽 **Food Reminder:** ${rem.text}` })
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
      body: JSON.stringify({ content: '🔔 Test: Food reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.food) {
    const norm = (v) => ({ t: (v && v.t) ? v.t : v, d: (v && v.d) ? v.d : [0,1,2,3,4,5,6] });
    const reminders = [
      { time: norm(times.food.fd_breakfast), text: "Breakfast 🍳 • Don't skip your first meal!" },
      { time: norm(times.food.fd_lunch), text: "Lunch 🥗 • 3–4 roti + dal + sabji" },
      { time: norm(times.food.fd_snack), text: "Evening Snack 🍎 • Fruit / Nuts / Coffee" },
      { time: norm(times.food.fd_dinner), text: "Dinner 🍽 • Light healthy meal" }
    ];
    const send = (rem) => {
      const now = new Date();
      const [h, m] = (rem.time.t||rem.time).split(":").map(Number);
      const days = rem.time.d || [0,1,2,3,4,5,6];
      let target = new Date();
      target.setHours(h, m, 0, 0);
      // advance to next allowed weekday
      for (let i=0; i<8 && (target <= now || !days.includes(target.getDay())); i++) {
        target.setDate(target.getDate()+1);
      }
      setTimeout(() => {
        fetch(webhook || WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: `🍽 **Food Reminder:** ${rem.text}` }) });
        send(rem);
      }, target - now);
    };
    reminders.forEach(send);
  }
};
