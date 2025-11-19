async function callApi(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    return { ok: res.ok, text };
  }
  return { ok: res.ok, data };
}

function parseEmployeeIds(raw) {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
  const idsInput = document.getElementById("hrEmployeeIds");
  const seedButton = document.getElementById("hrSeedButton");
  const seedResult = document.getElementById("hrSeedResult");
  const snapshotButton = document.getElementById("hrSnapshotButton");
  const snapshotSummary = document.getElementById("hrSnapshotSummary");
  const snapshotTable = document.getElementById("hrSnapshotTable").querySelector("tbody");

  seedButton.addEventListener("click", async () => {
    const ids = parseEmployeeIds(idsInput.value || "");
    if (!ids.length) {
      seedResult.textContent = "Please enter at least one employee ID.";
      return;
    }
    seedResult.textContent = "Seeding demo data for all employees…";
    const results = [];
    for (const id of ids) {
      const res = await callApi(`/demo/seed/${encodeURIComponent(id)}`, {
        method: "POST",
        body: JSON.stringify({ days: 5 }),
      });
      results.push({ id, res });
    }
    const summary = results
      .map((r) =>
        r.res.ok
          ? `${r.id}: ${r.res.data.emotionEvents} emotion, ${r.res.data.productivityEvents} productivity events`
          : `${r.id}: error`,
      )
      .join("\n");
    seedResult.textContent = summary;
  });

  snapshotButton.addEventListener("click", async () => {
    const ids = parseEmployeeIds(idsInput.value || "");
    if (!ids.length) {
      snapshotSummary.textContent = "Please enter at least one employee ID.";
      return;
    }
    snapshotSummary.textContent = "Loading org snapshot…";
    snapshotTable.innerHTML = "";

    const metricsList = [];
    for (const id of ids) {
      const res = await callApi(`/employees/${encodeURIComponent(id)}/insights`);
      if (res.ok && res.data && res.data.metrics) {
        metricsList.push({ id, employee: res.data.employee, metrics: res.data.metrics });
      }
    }

    if (!metricsList.length) {
      snapshotSummary.textContent = "No insights available yet for these employees.";
      return;
    }

    let stressSum = 0;
    let stressCount = 0;
    let moodSum = 0;
    let moodCount = 0;
    let tasksSum = 0;
    let tasksCount = 0;
    let focusSum = 0;
    let focusCount = 0;
    let highStressCount = 0;

    metricsList.forEach(({ metrics }) => {
      if (typeof metrics.avgStress === "number") {
        stressSum += metrics.avgStress;
        stressCount += 1;
        if (metrics.avgStress >= 0.7) highStressCount += 1;
      }
      if (typeof metrics.avgMood === "number") {
        moodSum += metrics.avgMood;
        moodCount += 1;
      }
      if (typeof metrics.avgTasks === "number") {
        tasksSum += metrics.avgTasks;
        tasksCount += 1;
      }
      if (typeof metrics.avgFocus === "number") {
        focusSum += metrics.avgFocus;
        focusCount += 1;
      }
    });

    const avgStress = stressCount ? stressSum / stressCount : null;
    const avgMood = moodCount ? moodSum / moodCount : null;
    const avgTasks = tasksCount ? tasksSum / tasksCount : null;
    const avgFocus = focusCount ? focusSum / focusCount : null;

    const summaryItems = [
      { label: "Avg stress", value: formatNumber(avgStress) },
      { label: "Avg mood", value: formatNumber(avgMood) },
      { label: "Avg tasks / day", value: formatNumber(avgTasks) },
      { label: "Avg focus minutes", value: formatNumber(avgFocus) },
      {
        label: "High-stress employees",
        value: `${highStressCount} of ${metricsList.length}`,
      },
    ];

    snapshotSummary.innerHTML = summaryItems
      .map(
        (item) =>
          `<div class="summary-item"><div class="summary-label">${item.label}</div><div class="summary-value">${item.value}</div></div>`,
      )
      .join("");

    const rows = metricsList
      .map(({ id, metrics }) => {
        const insight = metrics.stressImpactDescription || "";
        return `<tr>
          <td>${id}</td>
          <td>${formatNumber(metrics.avgStress)}</td>
          <td>${formatNumber(metrics.avgMood)}</td>
          <td>${formatNumber(metrics.avgTasks)}</td>
          <td>${formatNumber(metrics.avgFocus)}</td>
          <td>${insight}</td>
        </tr>`;
      })
      .join("");

    snapshotTable.innerHTML = rows;
  });
});

