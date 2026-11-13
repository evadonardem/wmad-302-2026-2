/**
 * Builds the plain-text message that is sent through the phone's share sheet.
 * Pure function (no React), so it is easy to test.
 */
import type { Recipe } from '@/types/recipe';

export function buildShareMessage(recipe: Recipe): string {
  const totalMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  const lines = [
    `🍳 ${recipe.name}`,
    `${recipe.cuisine} · ${recipe.difficulty} · ${totalMinutes} min · ${recipe.servings} servings · ⭐ ${recipe.rating.toFixed(1)}`,
    '',
    'Ingredients:',
    ...recipe.ingredients.map((ingredient) => `• ${ingredient}`),
    '',
    'Instructions:',
    ...recipe.instructions.map((step, index) => `${index + 1}. ${step}`),
    '',
    'Shared from Cookbook',
  ];

  return lines.join('\n');
}
