import type { Recipe } from '@/types/recipe';

export const RECIPE_CATEGORIES = [
  'Beef',
  'Chicken',
  'Dessert',
  'Lamb',
  'Pasta',
  'Pork',
  'Seafood',
  'Vegetarian',
  'Breakfast',
  'Appetizer',
  'Side Dish',
  'Main Course',
  'Soup',
  'Salad',
  'Drink',
] as const;

const categoryTerms: Record<(typeof RECIPE_CATEGORIES)[number], string[]> = {
  Beef: ['beef'],
  Chicken: ['chicken'],
  Dessert: ['dessert', 'cake', 'cookie', 'ice cream', 'chocolate', 'brownie', 'tiramisu', 'pudding'],
  Lamb: ['lamb', 'mutton'],
  Pasta: ['pasta', 'noodle', 'spaghetti', 'macaroni', 'lasagna'],
  Pork: ['pork', 'bacon', 'ham'],
  Seafood: ['seafood', 'shrimp', 'fish', 'salmon', 'tuna', 'crab', 'lobster', 'prawn', 'cod', 'mussel', 'anchovy', 'squid'],
  Vegetarian: ['vegetarian', 'vegan'],
  Breakfast: ['breakfast'],
  Appetizer: ['appetizer', 'starter'],
  'Side Dish': ['side dish', 'side'],
  'Main Course': ['main course', 'dinner', 'lunch'],
  Soup: ['soup'],
  Salad: ['salad'],
  Drink: ['drink', 'beverage', 'smoothie', 'juice', 'cocktail', 'tea', 'coffee', 'mojito', 'lassi'],
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function recipeMatchesCategory(
  recipe: Pick<Recipe, 'name' | 'cuisine' | 'tags' | 'ingredients' | 'mealType'>,
  category: string
): boolean {
  const matchedCategory = RECIPE_CATEGORIES.find(
    (name) => name.toLowerCase() === category.toLowerCase()
  );
  if (!matchedCategory) {
    return false;
  }

  const searchableText = normalizeText([
    recipe.name,
    recipe.cuisine,
    ...recipe.tags,
    ...recipe.ingredients,
    ...recipe.mealType,
  ].join(' '));
  const paddedSearchableText = ` ${searchableText} `;
  const terms = categoryTerms[matchedCategory];

  return terms.some((term) => paddedSearchableText.includes(` ${normalizeText(term)} `));
}

export function getRecipeCategoryCounts(
  recipes: Pick<Recipe, 'name' | 'cuisine' | 'tags' | 'ingredients' | 'mealType'>[]
): { name: (typeof RECIPE_CATEGORIES)[number]; count: number }[] {
  return RECIPE_CATEGORIES.map((name) => ({
    name,
    count: recipes.filter((recipe) => recipeMatchesCategory(recipe, name)).length,
  }));
}
