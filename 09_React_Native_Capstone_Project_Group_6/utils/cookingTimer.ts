/**
 * Helpers for the cooking timer.
 * parseStepDuration reads a recipe step such as "Simmer for 30 minutes." and
 * returns how long the timer should run. No React code, so it is easy to test.
 */

export interface StepDuration {
  /** Timer length in seconds (for a range like "8-10 minutes" we use the longer time) */
  seconds: number;
  /** The words found in the step, e.g. "8-10 minutes" */
  label: string;
}

const MAX_SECONDS = 24 * 60 * 60;

const NUMBER = '(\\d+(?:\\.\\d+)?)';
const UNIT = '(hours?|hrs?|minutes?|mins?|seconds?|secs?)';
// "30 minutes", "8-10 minutes", "10 to 12 mins", "1.5 hours"
const DURATION = new RegExp(`${NUMBER}(?:\\s*(?:-|–|to)\\s*${NUMBER})?\\s*${UNIT}\\b`, 'i');
// Directly after "1 hour": "and 30 minutes" / "30 minutes"
const EXTRA_MINUTES = new RegExp(`^\\s*(?:and\\s+)?${NUMBER}\\s*(?:minutes?|mins?)\\b`, 'i');

function secondsPerUnit(unit: string): number {
  const first = unit.charAt(0).toLowerCase();
  if (first === 'h') return 3600;
  if (first === 'm') return 60;
  return 1;
}

/** Find the first time in a recipe step, or null when the step has none. */
export function parseStepDuration(text: string): StepDuration | null {
  const match = DURATION.exec(text);
  if (!match) return null;

  const amount = parseFloat(match[2] ?? match[1]);
  const unit = match[3];
  let seconds = Math.round(amount * secondsPerUnit(unit));
  let label = match[0];

  // "1 hour and 30 minutes" counts as one timer
  if (secondsPerUnit(unit) === 3600) {
    const extra = EXTRA_MINUTES.exec(text.slice((match.index ?? 0) + match[0].length));
    if (extra) {
      seconds += Math.round(parseFloat(extra[1]) * 60);
      label = `${match[0]}${extra[0]}`;
    }
  }

  if (seconds <= 0 || seconds > MAX_SECONDS) return null;
  return { seconds, label: label.trim() };
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** 1800 -> "30:00", 3725 -> "1:02:05" */
export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** 1800 -> "30 min", 5400 -> "1 hr 30 min", 45 -> "45 sec" */
export function describeDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  if (minutes > 0) return seconds > 0 ? `${minutes} min ${seconds} sec` : `${minutes} min`;
  return `${seconds} sec`;
}
