import type { Recipe } from '@/types/recipe';

export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 1,
    name: 'Classic Margherita Pizza',
    ingredients: ['Dough', 'Tomato sauce', 'Mozzarella'],
    instructions: ['Preheat oven', 'Bake'],
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Italian',
    caloriesPerServing: 300,
    tags: ['Pizza', 'Italian'],
    userId: 166,
    image: 'https://example.com/pizza.jpg',
    rating: 4.6,
    reviewCount: 98,
    mealType: ['Dinner'],
    ...overrides,
  };
}
