export const MINUTES_PER_DAY = 1440;

export function absolute(t) {
  assertPoint(t);
  return t.dayOffset * MINUTES_PER_DAY + t.minuteOfDay;
}

export function fromAbsolute(value) {
  if (!Number.isInteger(value)) throw new TypeError('Time must use integer minutes');
  return {
    minuteOfDay: ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY,
    dayOffset: Math.floor(value / MINUTES_PER_DAY),
  };
}

export function assertPoint(t) {
  if (!t || !Number.isInteger(t.minuteOfDay) || t.minuteOfDay < 0 || t.minuteOfDay >= MINUTES_PER_DAY || !Number.isInteger(t.dayOffset)) {
    throw new TypeError('Invalid TimePoint');
  }
}

export const addMinutes = (t, minutes) => fromAbsolute(absolute(t) + minutes);
export const subtractMinutes = (t, minutes) => addMinutes(t, -minutes);
export const findDuration = (start, end) => absolute(end) - absolute(start);
export const equalTime = (a, b) => absolute(a) === absolute(b);

export function formatTime(t, notation24 = false, includeDay = true) {
  assertPoint(t);
  const hour = Math.floor(t.minuteOfDay / 60);
  const minute = String(t.minuteOfDay % 60).padStart(2, '0');
  const time = notation24
    ? `${String(hour).padStart(2, '0')}:${minute}`
    : `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
  if (!includeDay || t.dayOffset === 0) return time;
  const day = t.dayOffset === 1 ? 'next day' : t.dayOffset === -1 ? 'previous day' : `${Math.abs(t.dayOffset)} days ${t.dayOffset > 0 ? 'later' : 'earlier'}`;
  return `${time} · ${day}`;
}

export function parseTime(text, dayOffset = 0) {
  const match = String(text).trim().match(/^(\d{1,2})\s*:\s*(\d{1,2})\s*(a\.?m\.?|p\.?m\.?)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59) return null;
  if (match[3]) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12 + (match[3][0].toLowerCase() === 'p' ? 12 : 0);
  } else if (hour > 23) return null;
  return fromAbsolute(dayOffset * MINUTES_PER_DAY + hour * 60 + minute);
}

export function elapsedText(minutes) {
  const amount = Math.abs(minutes);
  const h = Math.floor(amount / 60);
  const m = amount % 60;
  return [h ? `${h} hour${h === 1 ? '' : 's'}` : '', m ? `${m} minute${m === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ') || '0 minutes';
}

export function timeWords(t) {
  const hour = Math.floor(t.minuteOfDay / 60) % 12 || 12;
  const minute = t.minuteOfDay % 60;
  if (minute === 15) return `quarter past ${hour}`;
  if (minute === 30) return `half past ${hour}`;
  if (minute === 45) return `quarter to ${hour % 12 + 1}`;
  return formatTime(t, false, false);
}

export function boundaryFlags(problem) {
  const a = absolute(problem.start);
  const b = a + problem.duration;
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const flags = [];
  if (Math.floor(low / 60) !== Math.floor(high / 60)) flags.push('hour');
  for (let marker = Math.floor(low / 720) * 720 + 720; marker <= high; marker += 720) flags.push(marker % 1440 === 0 ? 'midnight' : 'noon');
  if (Math.floor(low / 1440) !== Math.floor(high / 1440)) flags.push('day');
  return [...new Set(flags)];
}

export function landmarkHops(problem) {
  let left = Math.abs(problem.duration);
  let now = absolute(problem.start);
  const sign = Math.sign(problem.duration) || 1;
  const result = [];
  const fullHours = Math.floor(left / 60) * 60;
  if (fullHours) {
    result.push(sign * fullHours);
    now += sign * fullHours;
    left -= fullHours;
  }
  while (left) {
    const minute = ((now % 60) + 60) % 60;
    const toHour = sign > 0 ? 60 - minute : minute || 60;
    const hop = Math.min(left, toHour, 15);
    result.push(sign * hop);
    now += sign * hop;
    left -= hop;
  }
  return result;
}

export function diagnose(problem, answer, rawMinute) {
  if (Number.isFinite(rawMinute) && rawMinute >= 60) return 'base-ten-minutes';
  if (!answer) return 'invalid-entry';
  const expected = addMinutes(problem.start, problem.duration);
  if (answer.minuteOfDay === expected.minuteOfDay && answer.dayOffset !== expected.dayOffset) return 'day';
  if (Math.abs(answer.minuteOfDay - expected.minuteOfDay) === 720) return 'period';
  if (equalTime(answer, addMinutes(problem.start, -problem.duration))) return 'direction';
  if (problem.duration % 60 && equalTime(answer, addMinutes(problem.start, Math.trunc(problem.duration / 60) * 60))) return 'missing-minutes';
  if (problem.start.minuteOfDay % 60 === 45 && answer.minuteOfDay % 60 === 15) return 'quarter-to';
  if (problem.duration % 60 && answer.minuteOfDay % 60 === Math.abs(problem.duration) % 60) return 'dropped-remainder';
  return 'other';
}

export function hintFor(problem, error) {
  const hints = {
    'base-ten-minutes': 'A clock has 60 minutes in each hour, not 100. Move to the next hour, then use the minutes left over.',
    period: 'Check AM and PM. Crossing noon changes AM to PM; crossing midnight changes PM to AM.',
    direction: problem.duration<0?'This machine moves backward in time. Travel left on the timeline.':'This machine moves forward in time. Travel right on the timeline.',
    'missing-minutes': 'The hours moved, but some minutes are still waiting.',
    'dropped-remainder': 'Use some minutes to reach the hour. Then move the minutes that remain.',
    'quarter-to': 'Quarter to means 15 minutes before the named hour.',
    day: 'Crossing midnight also changes the day.',
    'invalid-entry': 'Use a real clock time. Minutes go from 00 to 59.',
    other: Math.abs(problem.duration) % 60 === 0 ? 'Move the hour hand. The minutes stay the same.' : 'Move the hours first. Then move the minutes toward a useful hour mark.',
  };
  return hints[error];
}

export function generateProblem(seed, band = 'story', representation = 'clock') {
  let state = seed >>> 0;
  const random = (n) => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state % n; };
  let start = 6 * 60 + random(12) * 60 + [0, 15, 25, 30, 45][random(5)];
  let duration = (1 + random(3)) * 60 + (representation === 'timeline' ? 30 : 0);
  let skill = 'whole hours';
  let notation24 = false;
  if (band === 'backward') {
    duration = -(60 + random(3) * 30);
    start = [20, 380, 745, 860][random(4)];
    skill = 'backward time';
  } else if (band === 'quarters') {
    start = random(24) * 60 + [15, 30, 45][random(3)];
    duration = [15, 30, 45, 75][random(4)];
    skill = 'quarter hours';
  } else if (band === '24hour') {
    start = random(24) * 60 + random(12) * 5;
    duration = [45, 90, 120, 180][random(4)];
    skill = '24-hour time';
    notation24 = true;
  }
  const startPoint = fromAbsolute(start);
  const shown = band === 'quarters' ? `${timeWords(startPoint)} ${startPoint.minuteOfDay<720?'in the morning':'in the afternoon or evening'}` : formatTime(startPoint, notation24);
  return { id: `${band}-${seed}-${representation}`, start: startPoint, duration, representation, skill, notation24, hideStart:band==='quarters',context: `The machine clock shows ${shown}. Move ${elapsedText(duration)} ${duration < 0 ? 'earlier' : 'later'}. What time will it show?`, effect: 'Clockwork synchronized' };
}

export function answerChoices(problem) {
  const correct = addMinutes(problem.start, problem.duration);
  const values = [addMinutes(correct, -60), correct, addMinutes(correct, 30)];
  const unique=values.filter((value, index) => !values.slice(0, index).some((candidate) => equalTime(candidate, value)));
  let seed=[...problem.id].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7);
  for(let i=unique.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[unique[i],unique[j]]=[unique[j],unique[i]];}
  return unique;
}

export const STORY_PROBLEMS = [
  { id: 'lift', start: fromAbsolute(505), duration: 120, representation: 'clock', skill: 'whole hours', context: 'The shift lift leaves at 8:25 AM. It arrives 2 hours later. Set its arrival time.', effect: 'Shift lift synchronized' },
  { id: 'bridge', start: fromAbsolute(705), duration: 120, representation: 'platforms', skill: 'crossing noon', context: 'The bridge starts at 11:45 AM. It locks 2 hours later. Choose the lock time.', effect: 'Arrival bridge locked' },
  { id: 'route', start: fromAbsolute(645), duration: 210, representation: 'timeline', skill: 'mixed time', context: 'The rail engine starts at 10:45 AM. Its route takes 3 hours 30 minutes. Build the arrival time.', effect: 'Time rails restored' },
];

export const QUESTION_SEEDS = [17,29,41,53,67,79,83,97,103,113,127,139,149,157,163,179,191,199,211,223,227,239,251,263,269,281,293,307,311,331,347,353,367,379,389,397,409,419,431,443,457,467,479,487,499,509,521,541,557,569,577,587,599,607,619,631,641,653,661,673,683,691,701,719];
