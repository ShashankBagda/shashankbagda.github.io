const express = require("express");
const cors = require("cors");
const dayjs = require("dayjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory "event store" for demo purposes.
const events = {
  emotions: [],
  productivity: [],
};

// Simple employee registry for demo.
const employees = {
  "e-001": { id: "e-001", name: "Aisha", role: "Developer", team: "Platform" },
  "e-002": { id: "e-002", name: "Rahul", role: "Designer", team: "Product" },
};

function toDate(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function mean(numbers) {
  if (!numbers.length) return null;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

// Very lightweight correlation-style pairing:
// For each emotion event, find a productivity event for same employee
// that happens within a 4-hour window after the emotion event.
function buildStressProductivityPairs(employeeId) {
  const emo = events.emotions
    .filter((e) => e.employeeId === employeeId)
    .sort((a, b) => a.timestamp - b.timestamp);
  const prod = events.productivity
    .filter((e) => e.employeeId === employeeId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const pairs = [];
  let j = 0;

  for (let i = 0; i < emo.length; i += 1) {
    const e = emo[i];
    const windowEnd = dayjs(e.timestamp).add(4, "hour").toDate();

    while (j < prod.length && prod[j].timestamp < e.timestamp) {
      j += 1;
    }

    if (j >= prod.length) break;

    const p = prod[j];
    if (p.timestamp <= windowEnd) {
      pairs.push({ stressLevel: e.stressLevel, tasksCompleted: p.tasksCompleted });
    }
  }

  return pairs;
}

function computeEmployeeMetrics(employeeId) {
  const emo = events.emotions.filter((e) => e.employeeId === employeeId);
  const prod = events.productivity.filter((e) => e.employeeId === employeeId);

  const avgStress = mean(emo.map((e) => e.stressLevel));
  const avgMood = mean(emo.map((e) => e.moodScore));
  const avgTasks = mean(prod.map((e) => e.tasksCompleted));
  const avgFocus = mean(prod.map((e) => e.focusMinutes));

  const pairs = buildStressProductivityPairs(employeeId);

  let stressImpactDescription = "Not enough data to determine impact.";
  if (pairs.length >= 3) {
    const highStress = pairs.filter((p) => p.stressLevel >= 0.7);
    const lowStress = pairs.filter((p) => p.stressLevel < 0.7);
    const highTasks = mean(highStress.map((p) => p.tasksCompleted));
    const lowTasks = mean(lowStress.map((p) => p.tasksCompleted));

    if (highTasks != null && lowTasks != null) {
      if (highTasks < lowTasks) {
        stressImpactDescription =
          "Higher stress periods are followed by lower task completion.";
      } else if (highTasks > lowTasks) {
        stressImpactDescription =
          "Higher stress periods are followed by more task completion (possible overdrive mode).";
      } else {
        stressImpactDescription =
          "Task completion looks similar across stress levels.";
      }
    }
  }

  return {
    avgStress,
    avgMood,
    avgTasks,
    avgFocus,
    stressImpactDescription,
    sampleCounts: {
      emotionEvents: emo.length,
      productivityEvents: prod.length,
      pairedSamples: pairs.length,
    },
  };
}

function recommendIncentives(metrics) {
  if (!metrics || metrics.sampleCounts.emotionEvents === 0) {
    return [
      "Encourage the employee to start daily 1-minute check-ins so the system can personalize incentives.",
    ];
  }

  const { avgStress, avgTasks, avgFocus } = metrics;
  const ideas = [];

  if (avgStress != null && avgStress >= 0.7 && avgTasks != null && avgTasks > 5) {
    ideas.push(
      "Offer a recovery day or flexible hours after intense sprints.",
      "Publicly recognize recent contributions in team channels.",
    );
  }

  if (avgStress != null && avgStress <= 0.3 && avgTasks != null && avgTasks < 3) {
    ideas.push(
      "Align on clearer goals and OKRs; schedule a focused planning session.",
      "Provide access to a mentor or coach to unlock performance.",
    );
  }

  if (avgFocus != null && avgFocus >= 120) {
    ideas.push("Consider deep-work blocks with no meetings as a formal incentive.");
  }

  if (!ideas.length) {
    ideas.push(
      "Use small, frequent recognition (kudos, shout-outs) tied to specific behaviors.",
      "Offer choice-based rewards (learning budget, time-off, or bonuses) and see which options the employee picks.",
    );
  }

  return ideas;
}

function buildReviewSummary(employee, metrics) {
  if (!metrics || metrics.sampleCounts.emotionEvents === 0) {
    return `For ${employee.name}, we do not yet have enough data for a continuous review. Start with daily emotion and productivity check-ins.`;
  }

  const stressText =
    metrics.avgStress == null
      ? "stress trends are still unclear"
      : metrics.avgStress >= 0.7
        ? "stress tends to run high"
        : metrics.avgStress <= 0.3
          ? "stress is generally well-managed"
          : "stress is moderate and fluctuates with workload";

  const productivityText =
    metrics.avgTasks == null
      ? "task completion isn’t consistently tracked yet"
      : metrics.avgTasks >= 6
        ? "consistently closes a high volume of tasks"
        : metrics.avgTasks <= 2
          ? "may benefit from clearer priorities and support to increase throughput"
          : "maintains a steady, sustainable level of task completion";

  const focusText =
    metrics.avgFocus == null
      ? "focus time data is missing"
      : metrics.avgFocus >= 180
        ? "has strong deep-work habits with long focus blocks"
        : metrics.avgFocus <= 60
          ? "may be experiencing frequent context switching or interruptions"
          : "balances focus time with collaboration reasonably well";

  return [
    `${employee.name} (${employee.role}, ${employee.team}) – Continuous Review Snapshot`,
    "",
    `• Emotional signal: ${stressText}.`,
    `• Output: ${productivityText}.`,
    `• Work style: ${focusText}.`,
    "",
    `Micro-insight: ${metrics.stressImpactDescription}`,
    "",
    "Suggested next manager nudges:",
    "- Check in on workload vs. stress in your next 1:1.",
    "- Agree on 1–2 experiments: change meeting load, adjust priorities, or tweak incentives.",
  ].join("\n");
}

app.get("/", (_req, res) => {
  res.json({
    name: "Unified 360 Human Capital OS – Demo API",
    uiEmployee: "/ui",
    uiHr: "/hr.html",
    endpoints: {
      emotionEvent: { method: "POST", path: "/events/emotion" },
      productivityEvent: { method: "POST", path: "/events/productivity" },
      employeeInsights: { method: "GET", path: "/employees/:id/insights" },
      employeeIncentives: { method: "GET", path: "/employees/:id/incentives" },
      employeeReview: { method: "GET", path: "/employees/:id/review" },
      seedDemoData: { method: "POST", path: "/demo/seed/:id" },
    },
  });
});

app.get("/ui", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/events/emotion", (req, res) => {
  const { employeeId, stressLevel, moodScore, timestamp } = req.body || {};

  if (!employeeId || typeof stressLevel !== "number") {
    return res.status(400).json({
      error: "employeeId and numeric stressLevel are required.",
    });
  }

  events.emotions.push({
    employeeId,
    stressLevel: Math.min(Math.max(stressLevel, 0), 1),
    moodScore:
      typeof moodScore === "number" ? Math.min(Math.max(moodScore, 0), 1) : 0.5,
    timestamp: toDate(timestamp),
  });

  return res.status(201).json({ status: "ok" });
});

app.post("/events/productivity", (req, res) => {
  const { employeeId, tasksCompleted, focusMinutes, timestamp } = req.body || {};

  if (!employeeId || typeof tasksCompleted !== "number") {
    return res.status(400).json({
      error: "employeeId and numeric tasksCompleted are required.",
    });
  }

  events.productivity.push({
    employeeId,
    tasksCompleted: Math.max(tasksCompleted, 0),
    focusMinutes: typeof focusMinutes === "number" ? Math.max(focusMinutes, 0) : 0,
    timestamp: toDate(timestamp),
  });

  return res.status(201).json({ status: "ok" });
});

app.get("/employees/:id/insights", (req, res) => {
  const { id } = req.params;
  const employee = employees[id] || { id, name: `Employee ${id}` };
  const metrics = computeEmployeeMetrics(id);
  res.json({ employee, metrics });
});

app.get("/employees/:id/emotions", (req, res) => {
  const { id } = req.params;
  const limit = Number.parseInt(req.query.limit, 10) || 100;
  const employeeEvents = events.emotions
    .filter((e) => e.employeeId === id)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-limit)
    .map((e) => ({
      timestamp: e.timestamp,
      stressLevel: e.stressLevel,
      moodScore: e.moodScore,
    }));

  res.json({
    employeeId: id,
    count: employeeEvents.length,
    events: employeeEvents,
  });
});

app.get("/employees/:id/incentives", (req, res) => {
  const { id } = req.params;
  const employee = employees[id] || { id, name: `Employee ${id}` };
  const metrics = computeEmployeeMetrics(id);
  const recommendations = recommendIncentives(metrics);
  res.json({ employee, recommendations, basedOn: metrics });
});

app.get("/employees/:id/review", (req, res) => {
  const { id } = req.params;
  const employee =
    employees[id] || { id, name: `Employee ${id}`, role: "Unknown", team: "Unknown" };
  const metrics = computeEmployeeMetrics(id);
  const summary = buildReviewSummary(employee, metrics);
  res.type("text/plain").send(summary);
});

// Seed endpoint to quickly generate sample data for demos.
app.post("/demo/seed/:id", (req, res) => {
  const { id } = req.params;
  const days = req.body?.days || 5;

  const now = dayjs();

  for (let d = 0; d < days; d += 1) {
    const baseDay = now.subtract(d, "day").hour(9).minute(0).second(0);

    const emotionSlots = [0, 3, 6].map((offsetHours) =>
      baseDay.add(offsetHours, "hour"),
    );
    const productivitySlots = [2, 5, 8].map((offsetHours) =>
      baseDay.add(offsetHours, "hour"),
    );

    emotionSlots.forEach((slot, index) => {
      const stressLevel = index === 1 ? 0.75 : 0.4;
      const moodScore = index === 1 ? 0.4 : 0.7;
      events.emotions.push({
        employeeId: id,
        stressLevel,
        moodScore,
        timestamp: slot.toDate(),
      });
    });

    productivitySlots.forEach((slot, index) => {
      const tasksCompleted = index === 1 ? 3 : 6;
      const focusMinutes = index === 1 ? 60 : 120;
      events.productivity.push({
        employeeId: id,
        tasksCompleted,
        focusMinutes,
        timestamp: slot.toDate(),
      });
    });
  }

  res.json({
    status: "seeded",
    employeeId: id,
    emotionEvents: events.emotions.filter((e) => e.employeeId === id).length,
    productivityEvents: events.productivity.filter((e) => e.employeeId === id).length,
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Demo API running on http://localhost:${PORT}`);
});
