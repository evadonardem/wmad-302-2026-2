/** Sample data shared by the unit tests (not part of the app). */
import type { Recipe } from '@/types/recipe';
import type { AuthUser } from '@/types/auth';

export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 1,
    name: 'Margherita Pizza',
    ingredients: ['Dough', 'Tomato', 'Mozzarella'],
    instructions: ['Roll the dough', 'Bake'],
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Italian',
    caloriesPerServing: 300,
    tags: ['Pizza', 'Italian'],
    userId: 1,
    image: 'https://example.com/pizza.jpg',
    rating: 4.6,
    reviewCount: 98,
    mealType: ['Dinner'],
    ...overrides,
  };
}

export const SAMPLE_RECIPES: Recipe[] = [
  makeRecipe({ id: 1, name: 'Margherita Pizza', rating: 4.6 }),
  makeRecipe({
    id: 2,
    name: 'Chicken Tikka',
    cuisine: 'Indian',
    difficulty: 'Hard',
    prepTimeMinutes: 40,
    cookTimeMinutes: 30,
    caloriesPerServing: 450,
    tags: ['Chicken', 'Curry'],
    mealType: ['Dinner', 'Lunch'],
    rating: 4.9,
  }),
  makeRecipe({
    id: 3,
    name: 'Avocado Toast',
    cuisine: 'American',
    difficulty: 'Medium',
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    caloriesPerServing: 200,
    tags: ['Pizza', 'Vegetarian'],
    mealType: ['Breakfast'],
    rating: 3.8,
  }),
];

export function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    username: 'jecressa',
    email: 'jecressa@example.com',
    firstName: 'Jecressa',
    lastName: 'Agustin',
    gender: 'female',
    image: 'https://example.com/me.png',
    token: 'token',
    refreshToken: 'refresh',
    ...overrides,
  };
}
