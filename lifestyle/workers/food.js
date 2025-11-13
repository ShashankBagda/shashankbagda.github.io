const WEBHOOK = "https://discord.com/api/webhooks/1438500068737945731/q5TQePGq-PMsqAUwQJe-zuCS3xs6nS8_fyViAwXom4GfsDwsZgRGuMPsLszoh09MWruW";

function loadTimes() {
  const d = JSON.parse(localStorage.getItem("reminderTimes"));
  if (!d) return null;

  return [
    { time: d.food.fd_breakfast, text: "Breakfast 🍳 • Don't skip your first meal!" },
    { time: d.food.fd_lunch, text: "Lunch 🥗 • 3–4 roti + dal + sabji" },
    { time: d.food.fd_snack, text: "Evening Snack 🍎 • Fruit / Nuts / Coffee" },
    { time: d.food.fd_dinner, text: "Dinner 🍽 • Light healthy meal" }
  ];
}

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

const reminders = loadTimes();
if (reminders) reminders.forEach(schedule);
