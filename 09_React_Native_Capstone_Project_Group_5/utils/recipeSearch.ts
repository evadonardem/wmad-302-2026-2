import type { Recipe } from '@/types/recipe';

type SearchableRecipe = Pick<Recipe, 'name' | 'cuisine' | 'tags' | 'ingredients'>;

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

export function recipeMatchesSearch(recipe: SearchableRecipe, query: string): boolean {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchableText = normalize([
    recipe.name,
    recipe.cuisine,
    ...recipe.tags,
    ...recipe.ingredients,
  ].join(' '));

  return terms.every((term) => searchableText.includes(term));
}
