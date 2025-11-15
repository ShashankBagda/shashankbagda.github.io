const WEBHOOK = "https://discord.com/api/webhooks/1438499790173372457/Z3KZTTwPJPYCA5V6ClGOz4RvAd-nvNqGs2HR_haNelnnYL5X3F74PjhhkR4MOIIpy7TR";

let MOD = 'water';

function parseRange(obj) {
  // Expect { s:"HH:MM", e:"HH:MM", i: minutes, d:[0..6] }
  if (!obj || typeof obj !== 'object') return null;
  const s = obj.s || '';
  const e = obj.e || '';
  const i = Number.isFinite(obj.i) ? obj.i : 30;
  const d = Array.isArray(obj.d) ? obj.d : [0,1,2,3,4,5,6];
  if (!/^[0-2]\d:[0-5]\d$/.test(s) || !/^[0-2]\d:[0-5]\d$/.test(e)) return null;
  return { s, e, i: Math.max(1, i), d };
}

function minutesOfDay(hhmm){ const [h,m]=hhmm.split(':').map(Number); return h*60+m; }

function nextOccurrence(range, now) {
  // returns a Date for the next tick within allowed weekdays and [s..e] at interval i
  const startM = minutesOfDay(range.s);
  const endM = minutesOfDay(range.e);
  if (endM <= startM) {
    // invalid range in same day -> push to next allowed day at start
    let d = new Date(now);
    for (let k=0;k<14;k++) {
      d.setDate(d.getDate()+ (k?1:0)); d.setHours(0,0,0,0);
      if (range.d.includes(d.getDay())) { d.setMinutes(startM); return d; }
    }
    return null;
  }
  for (let k=0;k<14;k++) {
    const d = new Date(now);
    if (k) d.setDate(d.getDate()+k);
    d.setHours(0,0,0,0);
    if (!range.d.includes(d.getDay())) continue;
    const todayM = (k===0) ? (now.getHours()*60 + now.getMinutes()) : -1; // -1 ensures start used for future days
    let nextM = startM;
    if (k===0) {
      if (todayM <= startM) {
        nextM = startM;
      } else if (todayM > endM) {
        continue; // today passed, try next day
      } else {
        const offset = todayM - startM;
        const steps = Math.floor(offset / range.i) + 1;
        nextM = startM + steps * range.i;
      }
    }
    if (nextM <= endM) {
      const candidate = new Date(d);
      candidate.setMinutes(nextM);
      return candidate;
    }
  }
  return null;
}

function scheduleRange(range, text, webhook) {
  const loop = () => {
    const now = new Date();
    const target = nextOccurrence(range, now);
    if (!target) return; // give up silently if misconfigured
    setTimeout(() => {
      fetch(webhook || WEBHOOK, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: `💧 **Water Reminder:** ${text}` })
      }).catch(()=>{});
      try { self.postMessage({ type: 'fired', module: MOD }); } catch(_){}
      loop();
    }, Math.max(0, target - now));
  };
  loop();
}

self.onmessage = (e) => {
  const { type, times, webhook, module } = e.data || {};
  if (module) MOD = module;
  if (type === 'test') {
    fetch(webhook || WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '🔔 Test: Water reminder webhook working.' })
    }).catch(()=>{});
    return;
  }
  if (type === 'init' && times && times.water) {
    // New single-window config takes precedence
    const single = times.water.wt_range || times.water.range;
    const pr = parseRange(single);
    if (pr) {
      scheduleRange(pr, 'Hydration reminder', webhook);
      return;
    }

    // Backward compatibility: legacy per-slot or single-time entries
    const items = [
      ['wt_1','Hydration reminder'],
      ['wt_2','Hydration reminder'],
      ['wt_3','Hydration reminder'],
      ['wt_4','Hydration reminder'],
      ['wt_5','Hydration reminder']
    ];

    const parseSingle = (val) => {
      if (!val) return null;
      if (typeof val === 'string') return { t: val, d:[0,1,2,3,4,5,6] };
      if (typeof val === 'object' && val.t) return { t: val.t, d: Array.isArray(val.d)?val.d:[0,1,2,3,4,5,6] };
      return null;
    };
    const scheduleSingle = (rem, text) => {
      const loop = () => {
        const now = new Date();
        const [h,m] = rem.t.split(':').map(Number);
        const days = rem.d || [0,1,2,3,4,5,6];
        let target = new Date();
        target.setHours(h, m, 0, 0);
        for (let i=0; i<8 && (target <= now || !days.includes(target.getDay())); i++) target.setDate(target.getDate()+1);
        setTimeout(() => {
          fetch(webhook || WEBHOOK, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: `💧 **Water Reminder:** ${text}` }) }).catch(()=>{});
          try { self.postMessage({ type: 'fired', module: MOD }); } catch(_){}
          loop();
        }, Math.max(0, target - now));
      };
      loop();
    };

    for (const [key, label] of items) {
      const val = times.water[key];
      const r = parseRange(val);
      if (r) { scheduleRange(r, label, webhook); continue; }
      const s = parseSingle(val);
      if (s) scheduleSingle(s, label);
    }
  }
};
