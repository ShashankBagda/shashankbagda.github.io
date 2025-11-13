const WEBHOOK = "https://discord.com/api/webhooks/1438500870957436938/XQkTpSciuMBQGX8CW9g7co7KuAyecEJNaFpZVSZpRaSA2c8Sq9qgt5hlBXbzX35u7XuC";

function loadTimes() {
  const d = JSON.parse(localStorage.getItem("reminderTimes"));
  if (!d) return null;

  return [
    { time: d.work.wk_start, text: "Start Work • Focus Mode On 💻" },
    { time: d.work.wk_break, text: "Stretch Break • 5 mins 🧘" },
    { time: d.work.wk_focus, text: "Refocus • Avoid distractions" },
    { time: d.work.wk_wrap, text: "Wrap Up • Review tasks" }
  ];
}

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

const reminders = loadTimes();
if (reminders) reminders.forEach(schedule);
