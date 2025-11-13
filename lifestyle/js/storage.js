/* -----------------------------------------------
   storage.js — LocalStorage Habit Tracking System
------------------------------------------------- */

const STORAGE_KEY = "lifestyle_logs";

// Default structure for each day
function defaultDayLogs() {
  return {
    date: new Date().toDateString(),
    water: 0,
    exercise: 0,
    foodHealthy: 0,
    sleepHours: 0,
    workSessions: 0
  };
}

// Get full log history
function getLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Save logs
function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// Get today's log entry (auto-create if missing)
function getToday() {
  const logs = getLogs();
  const todayDate = new Date().toDateString();

  let today = logs.find(l => l.date === todayDate);

  if (!today) {
    today = defaultDayLogs();
    logs.push(today);
    saveLogs(logs);
  }

  return today;
}

// Increment values
function addWater() {
  const logs = getLogs();
  const today = getToday();

  today.water += 1;
  saveLogs(logs);
}

function addExerciseSession() {
  const logs = getLogs();
  const today = getToday();

  today.exercise += 1;
  saveLogs(logs);
}

function addHealthyFood() {
  const logs = getLogs();
  const today = getToday();

  today.foodHealthy += 1;
  saveLogs(logs);
}

function setSleepHours(hours) {
  const logs = getLogs();
  const today = getToday();

  today.sleepHours = hours;
  saveLogs(logs);
}

function addWorkSession() {
  const logs = getLogs();
  const today = getToday();

  today.workSessions += 1;
  saveLogs(logs);
}
