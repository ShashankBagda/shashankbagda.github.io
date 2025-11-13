/* --------------------------------------------
   charts.js — Graphs for Dashboard Analytics
--------------------------------------------- */

let donutWater, donutSleep, donutExercise;
let weeklyChart;

function loadCharts() {
  const logs = JSON.parse(localStorage.getItem("lifestyle_logs")) || [];

  // Use last 7 entries
  const last7 = logs.slice(-7);

  const labels = last7.map(l => l.date.slice(0, 10));
  const water = last7.map(l => l.water);
  const sleep = last7.map(l => l.sleepHours);
  const exercise = last7.map(l => l.exercise);

  /* -------------------------
      Donut Chart — Water
  ------------------------- */
  donutWater = new Chart(document.getElementById("chartWater"), {
    type: 'doughnut',
    data: {
      labels: ["Cups", "Remaining"],
      datasets: [{
        data: [water[water.length - 1] || 0, 8 - (water[water.length - 1] || 0)],
        backgroundColor: ["#38bdf8", "#e5e7eb"]
      }]
    },
    options: {
      cutout: "70%",
      plugins: { legend: { display: false } }
    }
  });

  /* -------------------------
      Donut Chart — Sleep
  ------------------------- */
  donutSleep = new Chart(document.getElementById("chartSleep"), {
    type: 'doughnut',
    data: {
      labels: ["Hours", "Remaining"],
      datasets: [{
        data: [sleep[sleep.length - 1] || 0, 7 - (sleep[sleep.length - 1] || 0)],
        backgroundColor: ["#34d399", "#e5e7eb"]
      }]
    },
    options: {
      cutout: "70%",
      plugins: { legend: { display: false } }
    }
  });

  /* -------------------------
      Donut Chart — Exercise
  ------------------------- */
  donutExercise = new Chart(document.getElementById("chartExercise"), {
    type: 'doughnut',
    data: {
      labels: ["Sessions", "Remaining"],
      datasets: [{
        data: [exercise[exercise.length - 1] || 0, 1 - (exercise[exercise.length - 1] || 0)],
        backgroundColor: ["#f59e0b", "#e5e7eb"]
      }]
    },
    options: {
      cutout: "70%",
      plugins: { legend: { display: false } }
    }
  });

  /* -------------------------
      Weekly Line Chart
  ------------------------- */
  weeklyChart = new Chart(document.getElementById("chartWeekly"), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: "Water Cups",
          data: water,
          borderColor: "#38bdf8",
          tension: 0.4
        },
        {
          label: "Sleep Hours",
          data: sleep,
          borderColor: "#34d399",
          tension: 0.4
        },
        {
          label: "Exercise Sessions",
          data: exercise,
          borderColor: "#f59e0b",
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } }
    }
  });
}

window.addEventListener("load", loadCharts);
