/* eslint-env jest */
import { buildShareMessage } from '@/utils/shareRecipe';
import { makeRecipe } from '../../test-utils/fixtures';

describe('buildShareMessage', () => {
  const recipe = makeRecipe();
  const message = buildShareMessage(recipe);

  it('starts with the recipe name', () => {
    expect(message.split('\n')[0]).toBe('🍳 Margherita Pizza');
  });

  it('includes the key facts', () => {
    expect(message).toContain('Italian · Easy · 35 min · 4 servings · ⭐ 4.6');
  });

  it('lists every ingredient as a bullet', () => {
    expect(message).toContain('• Dough');
    expect(message).toContain('• Tomato');
    expect(message).toContain('• Mozzarella');
  });

  it('numbers the instructions from 1', () => {
    expect(message).toContain('1. Roll the dough');
    expect(message).toContain('2. Bake');
  });

  it('ends with the app credit', () => {
    expect(message.endsWith('Shared from Cookbook')).toBe(true);
  });
});
