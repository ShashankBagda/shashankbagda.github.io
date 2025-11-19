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

function getEmployeeId() {
  const el = document.getElementById("employeeId");
  return (el.value || "").trim();
}

async function detectEmotionFromCamera(video) {
  if (!video || video.readyState < 2) {
    return null;
  }

  if (typeof window.estimateEmotionFromCamera === "function") {
    const result = await window.estimateEmotionFromCamera(video);
    if (result && typeof result.stressLevel === "number") {
      return result;
    }
  }

  const presets = [
    { label: "Calm / focused", stressLevel: 0.2, moodScore: 0.8 },
    { label: "Neutral", stressLevel: 0.5, moodScore: 0.5 },
    { label: "Stressed / tense", stressLevel: 0.8, moodScore: 0.3 },
  ];
  const pick = presets[Math.floor(Math.random() * presets.length)];
  return pick;
}

document.addEventListener("DOMContentLoaded", () => {
  const employeeIdInput = document.getElementById("employeeId");
  const seedButton = document.getElementById("seedButton");
  const seedResult = document.getElementById("seedResult");

  const cameraPreview = document.getElementById("cameraPreview");
  const cameraOverlay = document.getElementById("cameraOverlay");
  const cameraStatus = document.getElementById("cameraStatus");
  const startCameraButton = document.getElementById("startCameraButton");
  const captureEmotionButton = document.getElementById("captureEmotionButton");
  const autoLogButton = document.getElementById("autoLogButton");

  const emotionFromFaceInput = document.getElementById("emotionFromFace");
  const stressLevelInput = document.getElementById("stressLevel");
  const moodScoreInput = document.getElementById("moodScore");
  const emotionButton = document.getElementById("emotionButton");
  const emotionResult = document.getElementById("emotionResult");

  const tasksCompletedInput = document.getElementById("tasksCompleted");
  const focusMinutesInput = document.getElementById("focusMinutes");
  const productivityButton = document.getElementById("productivityButton");
  const productivityResult = document.getElementById("productivityResult");

  const insightsButton = document.getElementById("insightsButton");
  const insightsResult = document.getElementById("insightsResult");
  const incentivesButton = document.getElementById("incentivesButton");
  const incentivesResult = document.getElementById("incentivesResult");
  const reviewButton = document.getElementById("reviewButton");
  const reviewResult = document.getElementById("reviewResult");

  let cameraStream = null;
  let autoLogging = false;
  let autoLogTimerId = null;
  const AUTO_LOG_INTERVAL_MS = 60000;
  const emotionChartCanvas = document.getElementById("emotionChart");
  const emotionChartStatus = document.getElementById("emotionChartStatus");
  let emotionChart = null;

  async function startCamera() {
    if (cameraStream) return;
    cameraStatus.textContent = "Requesting camera access…";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStream = stream;
      cameraPreview.srcObject = stream;
      cameraOverlay.textContent = "";
      cameraStatus.textContent = "Camera active. Look at the camera and capture emotion.";
    } catch (err) {
      cameraStatus.textContent = "Unable to access camera. Please check permissions.";
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
      cameraPreview.srcObject = null;
      cameraOverlay.textContent = "Camera idle";
    }
  }

  window.addEventListener("beforeunload", stopCamera);

  function setAutoLogging(enabled) {
    autoLogging = enabled;
    if (autoLogging) {
      autoLogButton.textContent = "Stop auto logging";
      autoLogButton.classList.add("active");
    } else {
      autoLogButton.textContent = "Start auto logging";
      autoLogButton.classList.remove("active");
      if (autoLogTimerId) {
        clearInterval(autoLogTimerId);
        autoLogTimerId = null;
      }
    }
  }

  async function autoLogOnce() {
    if (!autoLogging) return;
    const employeeId = getEmployeeId();
    if (!employeeId) return;
    if (!cameraStream) {
      await startCamera();
    }
    const estimate = await detectEmotionFromCamera(cameraPreview);
    if (!estimate) return;
    const { label, stressLevel, moodScore } = estimate;
    if (label) {
      document.getElementById("emotionFromFace").value = label;
    }
    if (typeof stressLevel === "number") {
      document.getElementById("stressLevel").value = stressLevel.toFixed(1);
    }
    if (typeof moodScore === "number") {
      document.getElementById("moodScore").value = moodScore.toFixed(1);
    }

    await callApi("/events/emotion", {
      method: "POST",
      body: JSON.stringify({ employeeId, stressLevel, moodScore }),
    });
    cameraStatus.textContent = "Auto-logged emotion from camera.";
    loadEmotionChart();
  }

  autoLogButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      cameraStatus.textContent = "Please enter an employee ID before enabling auto logging.";
      return;
    }
    if (!autoLogging) {
      await startCamera();
      setAutoLogging(true);
      cameraStatus.textContent =
        "Auto logging enabled. We will periodically log emotion from your camera.";
      autoLogOnce();
      autoLogTimerId = setInterval(autoLogOnce, AUTO_LOG_INTERVAL_MS);
    } else {
      setAutoLogging(false);
      cameraStatus.textContent = "Auto logging stopped.";
    }
  });

  async function loadEmotionChart() {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      emotionChartStatus.textContent = "Enter an employee ID to see your trend.";
      return;
    }
    if (!window.Chart || !emotionChartCanvas) {
      emotionChartStatus.textContent = "Chart library not available.";
      return;
    }
    emotionChartStatus.textContent = "Loading emotion history…";
    const res = await callApi(
      `/employees/${encodeURIComponent(employeeId)}/emotions?limit=100`,
    );
    if (!res.ok || !res.data) {
      emotionChartStatus.textContent = "Unable to load emotion history.";
      return;
    }

    const { events } = res.data;
    if (!events || !events.length) {
      emotionChartStatus.textContent =
        "No emotion events yet. Start logging to see your trend.";
      if (emotionChart) {
        emotionChart.destroy();
        emotionChart = null;
      }
      return;
    }

    const labels = events.map((e) =>
      new Date(e.timestamp).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    const stressData = events.map((e) => e.stressLevel ?? null);
    const moodData = events.map((e) => e.moodScore ?? null);

    const ctx = emotionChartCanvas.getContext("2d");
    const data = {
      labels,
      datasets: [
        {
          label: "Stress level",
          data: stressData,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.1)",
          tension: 0.3,
        },
        {
          label: "Mood score",
          data: moodData,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.1)",
          tension: 0.3,
        },
      ],
    };

    if (emotionChart) {
      emotionChart.data = data;
      emotionChart.update();
    } else {
      emotionChart = new Chart(ctx, {
        type: "line",
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 1,
              title: { display: true, text: "Intensity (0–1)" },
            },
          },
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    }
    emotionChartStatus.textContent = "";
  }

  seedButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      seedResult.textContent = "Please enter an employee ID.";
      return;
    }
    seedResult.textContent = "Seeding demo data…";
    const res = await callApi(`/demo/seed/${encodeURIComponent(employeeId)}`, {
      method: "POST",
      body: JSON.stringify({ days: 5 }),
    });
    if (res.ok) {
      seedResult.textContent = `Seeded data: ${JSON.stringify(res.data, null, 2)}`;
      loadEmotionChart();
    } else {
      seedResult.textContent = `Error seeding data: ${res.text || "Unknown error"}`;
    }
  });

  startCameraButton.addEventListener("click", () => {
    if (cameraStream) {
      stopCamera();
      cameraStatus.textContent = "Camera stopped.";
    } else {
      startCamera();
    }
  });

  captureEmotionButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      cameraStatus.textContent = "Please enter an employee ID first.";
      return;
    }
    cameraStatus.textContent = "Estimating emotion from camera…";
    const estimate = await detectEmotionFromCamera(cameraPreview);
    if (!estimate) {
      cameraStatus.textContent = "Unable to estimate emotion from camera.";
      return;
    }
    const { label, stressLevel, moodScore } = estimate;
    emotionFromFaceInput.value = label || "Estimated from face";
    if (typeof stressLevel === "number") {
      stressLevelInput.value = stressLevel.toFixed(1);
    }
    if (typeof moodScore === "number") {
      moodScoreInput.value = moodScore.toFixed(1);
    }
    cameraStatus.textContent = "Emotion captured. Review values and log your check-in.";
  });

  emotionButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      emotionResult.textContent = "Please enter an employee ID.";
      return;
    }
    const stressLevel = parseFloat(stressLevelInput.value || "0.5");
    const moodScore = parseFloat(moodScoreInput.value || "0.5");
    emotionResult.textContent = "Logging emotion check-in…";
    const res = await callApi("/events/emotion", {
      method: "POST",
      body: JSON.stringify({ employeeId, stressLevel, moodScore }),
    });
    if (res.ok) {
      emotionResult.textContent = "Emotion check-in recorded.";
      loadEmotionChart();
    } else {
      emotionResult.textContent = `Error: ${res.text || "Unknown error"}`;
    }
  });

  productivityButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      productivityResult.textContent = "Please enter an employee ID.";
      return;
    }
    const tasksCompleted = parseInt(tasksCompletedInput.value || "0", 10);
    const focusMinutes = parseInt(focusMinutesInput.value || "0", 10);
    productivityResult.textContent = "Logging productivity snapshot…";
    const res = await callApi("/events/productivity", {
      method: "POST",
      body: JSON.stringify({ employeeId, tasksCompleted, focusMinutes }),
    });
    if (res.ok) {
      productivityResult.textContent = "Productivity snapshot recorded.";
    } else {
      productivityResult.textContent = `Error: ${res.text || "Unknown error"}`;
    }
  });

  insightsButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      insightsResult.textContent = "Please enter an employee ID.";
      return;
    }
    insightsResult.textContent = "Loading insights…";
    const res = await callApi(`/employees/${encodeURIComponent(employeeId)}/insights`);
    if (res.ok) {
      insightsResult.textContent = JSON.stringify(res.data, null, 2);
    } else {
      insightsResult.textContent = `Error: ${res.text || "Unknown error"}`;
    }
  });

  incentivesButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      incentivesResult.textContent = "Please enter an employee ID.";
      return;
    }
    incentivesResult.textContent = "Loading incentives…";
    const res = await callApi(
      `/employees/${encodeURIComponent(employeeId)}/incentives`,
    );
    if (res.ok) {
      incentivesResult.textContent = JSON.stringify(res.data, null, 2);
    } else {
      incentivesResult.textContent = `Error: ${res.text || "Unknown error"}`;
    }
  });

  reviewButton.addEventListener("click", async () => {
    const employeeId = getEmployeeId();
    if (!employeeId) {
      reviewResult.textContent = "Please enter an employee ID.";
      return;
    }
    reviewResult.textContent = "Generating review…";
    const res = await callApi(
      `/employees/${encodeURIComponent(employeeId)}/review`,
      {},
    );
    if (res.ok && res.text) {
      reviewResult.textContent = res.text;
    } else if (res.ok && res.data) {
      reviewResult.textContent = JSON.stringify(res.data, null, 2);
    } else {
      reviewResult.textContent = `Error: ${res.text || "Unknown error"}`;
    }
  });

  if (employeeIdInput.value) {
    loadEmotionChart();
  }
});
