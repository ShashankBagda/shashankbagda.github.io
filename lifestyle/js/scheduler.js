/* --------------------------------------------------
   scheduler.js — Start/Stop Web Workers from UI
--------------------------------------------------- */

const workers = {
  exercise: null,
  food: null,
  water: null,
  work: null,
  sleep: null
};

function startWorker(name) {
  if (!workers[name]) {
    workers[name] = new Worker(`../workers/${name}.js`);
    console.log(name + " worker started");
  }
}

function stopWorker(name) {
  if (workers[name]) {
    workers[name].terminate();
    workers[name] = null;
    console.log(name + " worker stopped");
  }
}
