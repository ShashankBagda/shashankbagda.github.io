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

self.onmessage = (e) => {
  const { type, times } = e.data || {};
  if (type === 'test') {
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Exercise reminder webhook working.' })
    });
    return;
  }
  if (type === 'init' && times && times.exercise) {
    const reminders = [
      { time: times.exercise.ex_morning, text: "Morning mobility + 500ml water" },
      { time: times.exercise.ex_gym, text: "Gym / Swimming time 💪" },
      { time: times.exercise.ex_shake, text: "Post-workout Protein Shake" }
    ];
    reminders.forEach(schedule);
  }
};
