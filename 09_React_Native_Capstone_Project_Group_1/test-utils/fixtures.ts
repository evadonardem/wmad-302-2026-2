/**
 * Shared test data
 */
import type { Recipe } from '@/types/recipe';
import type { AuthUser } from '@/types/auth';

export const sampleRecipe: Recipe = {
  id: 1,
  name: 'Classic Margherita Pizza',
  ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella cheese'],
  instructions: ['Preheat the oven.', 'Add toppings.', 'Bake for 15 minutes.'],
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
};

export const sampleUser: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily.johnson@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://example.com/emily.png',
  token: 'access-token',
  refreshToken: 'refresh-token',
};