/* eslint-env jest */
import { clampStep, stepLabel, stepProgress } from '@/utils/cookingMode';

describe('cookingMode helpers', () => {
  it('clampStep keeps the index inside the step list', () => {
    expect(clampStep(-3, 5)).toBe(0);
    expect(clampStep(2, 5)).toBe(2);
    expect(clampStep(9, 5)).toBe(4);
  });

  it('clampStep returns 0 when there are no steps', () => {
    expect(clampStep(3, 0)).toBe(0);
  });

  it('stepLabel is one-based', () => {
    expect(stepLabel(0, 8)).toBe('Step 1 of 8');
    expect(stepLabel(7, 8)).toBe('Step 8 of 8');
  });

  it('stepLabel never goes past the last step', () => {
    expect(stepLabel(20, 8)).toBe('Step 8 of 8');
  });

  it('stepProgress goes from first step to 1', () => {
    expect(stepProgress(0, 4)).toBe(0.25);
    expect(stepProgress(3, 4)).toBe(1);
  });

  it('stepProgress is 0 for an empty list', () => {
    expect(stepProgress(0, 0)).toBe(0);
  });
});
