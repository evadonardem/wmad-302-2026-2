/* eslint-env jest */
import { describeDuration, formatTimer, parseStepDuration } from '@/utils/cookingTimer';

describe('parseStepDuration', () => {
  it('reads minutes', () => {
    expect(parseStepDuration('Simmer the beef for 30 minutes.')).toEqual({
      seconds: 1800,
      label: '30 minutes',
    });
  });

  it('reads hours, including decimals', () => {
    expect(parseStepDuration('Slow cook for 2 hours.')?.seconds).toBe(7200);
    expect(parseStepDuration('Roast for 1.5 hours')?.seconds).toBe(5400);
  });

  it('reads seconds and short units', () => {
    expect(parseStepDuration('Sear 45 seconds per side')?.seconds).toBe(45);
    expect(parseStepDuration('Boil for 10 mins')?.seconds).toBe(600);
  });

  it('uses the longer time of a range', () => {
    expect(parseStepDuration('Bake for 8-10 minutes.')?.seconds).toBe(600);
    expect(parseStepDuration('Cook 10 to 12 minutes')).toEqual({ seconds: 720, label: '10 to 12 minutes' });
  });

  it('combines "1 hour and 30 minutes"', () => {
    expect(parseStepDuration('Bake for 1 hour and 30 minutes')).toEqual({
      seconds: 5400,
      label: '1 hour and 30 minutes',
    });
  });

  it('uses only the first time in a step', () => {
    expect(parseStepDuration('Bake 20 minutes, then rest 5 minutes')?.seconds).toBe(1200);
  });

  it('returns null when there is no time', () => {
    expect(parseStepDuration('Chop the onions finely.')).toBeNull();
    expect(parseStepDuration('Preheat the oven to 350°F.')).toBeNull();
    expect(parseStepDuration('Add 2 cloves of garlic')).toBeNull();
  });

  it('ignores zero and absurdly long times', () => {
    expect(parseStepDuration('Wait 0 minutes')).toBeNull();
    expect(parseStepDuration('Ferment for 48 hours')).toBeNull();
  });
});

describe('formatTimer', () => {
  it('formats minutes and seconds', () => {
    expect(formatTimer(1800)).toBe('30:00');
    expect(formatTimer(59)).toBe('00:59');
  });

  it('adds hours when needed', () => {
    expect(formatTimer(3725)).toBe('1:02:05');
  });

  it('never goes below zero', () => {
    expect(formatTimer(-5)).toBe('00:00');
  });
});

describe('describeDuration', () => {
  it('describes seconds, minutes and hours', () => {
    expect(describeDuration(45)).toBe('45 sec');
    expect(describeDuration(1800)).toBe('30 min');
    expect(describeDuration(90)).toBe('1 min 30 sec');
    expect(describeDuration(7200)).toBe('2 hr');
    expect(describeDuration(5400)).toBe('1 hr 30 min');
  });
});
