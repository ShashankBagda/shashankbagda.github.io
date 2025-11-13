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
  const { type, times } = e.data || {};
  if (type !== 'init' || !times || !times.food) return;
  const reminders = [
    { time: times.food.fd_breakfast, text: "Breakfast 🍳 • Don't skip your first meal!" },
    { time: times.food.fd_lunch, text: "Lunch 🥗 • 3–4 roti + dal + sabji" },
    { time: times.food.fd_snack, text: "Evening Snack 🍎 • Fruit / Nuts / Coffee" },
    { time: times.food.fd_dinner, text: "Dinner 🍽 • Light healthy meal" }
  ];
  reminders.forEach(schedule);
};
