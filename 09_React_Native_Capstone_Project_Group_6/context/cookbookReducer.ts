/**
 * Reducer for the cookbook (collections, meal plan, shopping list).
 * Kept separate from React so it can be unit-tested directly.
 * IDs are passed in the actions so the reducer stays pure.
 */
import type { CookbookData, Collection, PlannedMeal } from '@/types/cookbook';
import { mergeIngredients, normalizeIngredient } from '@/utils/cookbook';

export interface CookbookState extends CookbookData {
  isLoading: boolean; // true until saved data has been read
}

export type CookbookAction =
  | { type: 'COOKBOOK_HYDRATE'; payload: CookbookData }
  // collections
  | { type: 'COLLECTION_CREATE'; payload: { id: string; name: string } }
  | { type: 'COLLECTION_RENAME'; payload: { id: string; name: string } }
  | { type: 'COLLECTION_DELETE'; payload: string }
  | { type: 'COLLECTION_ADD_RECIPE'; payload: { id: string; recipeId: number } }
  | { type: 'COLLECTION_REMOVE_RECIPE'; payload: { id: string; recipeId: number } }
  // meal plan
  | { type: 'PLAN_ADD'; payload: PlannedMeal }
  | { type: 'PLAN_REMOVE'; payload: string }
  | { type: 'PLAN_CLEAR_DATES'; payload: string[] }
  // shopping list
  | { type: 'SHOPPING_ADD_RECIPES'; payload: { id: number; ingredients: string[] }[] }
  | { type: 'SHOPPING_ADD_ITEM'; payload: { id: string; name: string } }
  | { type: 'SHOPPING_TOGGLE'; payload: string }
  | { type: 'SHOPPING_REMOVE'; payload: string }
  | { type: 'SHOPPING_CLEAR_CHECKED' }
  | { type: 'SHOPPING_CLEAR' };

export const initialCookbookState: CookbookState = {
  collections: [],
  mealPlan: [],
  shopping: [],
  isLoading: true,
};

function updateCollection(
  collections: Collection[],
  id: string,
  change: (c: Collection) => Collection
): Collection[] {
  return collections.map((c) => (c.id === id ? change(c) : c));
}

export function cookbookReducer(state: CookbookState, action: CookbookAction): CookbookState {
  switch (action.type) {
    case 'COOKBOOK_HYDRATE':
      return { ...action.payload, isLoading: false };

    // ---- collections ----
    case 'COLLECTION_CREATE': {
      const name = normalizeIngredient(action.payload.name);
      if (!name) return state;
      return {
        ...state,
        collections: [...state.collections, { id: action.payload.id, name, recipeIds: [] }],
      };
    }
    case 'COLLECTION_RENAME': {
      const name = normalizeIngredient(action.payload.name);
      if (!name) return state;
      return {
        ...state,
        collections: updateCollection(state.collections, action.payload.id, (c) => ({ ...c, name })),
      };
    }
    case 'COLLECTION_DELETE':
      return { ...state, collections: state.collections.filter((c) => c.id !== action.payload) };
    case 'COLLECTION_ADD_RECIPE':
      return {
        ...state,
        collections: updateCollection(state.collections, action.payload.id, (c) =>
          c.recipeIds.includes(action.payload.recipeId)
            ? c
            : { ...c, recipeIds: [...c.recipeIds, action.payload.recipeId] }
        ),
      };
    case 'COLLECTION_REMOVE_RECIPE':
      return {
        ...state,
        collections: updateCollection(state.collections, action.payload.id, (c) => ({
          ...c,
          recipeIds: c.recipeIds.filter((r) => r !== action.payload.recipeId),
        })),
      };

    // ---- meal plan ----
    case 'PLAN_ADD': {
      const { date, slot, recipeId } = action.payload;
      const duplicate = state.mealPlan.some(
        (m) => m.date === date && m.slot === slot && m.recipeId === recipeId
      );
      if (duplicate) return state;
      return { ...state, mealPlan: [...state.mealPlan, action.payload] };
    }
    case 'PLAN_REMOVE':
      return { ...state, mealPlan: state.mealPlan.filter((m) => m.id !== action.payload) };
    case 'PLAN_CLEAR_DATES': {
      const dates = new Set(action.payload);
      return { ...state, mealPlan: state.mealPlan.filter((m) => !dates.has(m.date)) };
    }

    // ---- shopping list ----
    case 'SHOPPING_ADD_RECIPES':
      return { ...state, shopping: mergeIngredients(state.shopping, action.payload) };
    case 'SHOPPING_ADD_ITEM': {
      const name = normalizeIngredient(action.payload.name);
      if (!name) return state;
      if (state.shopping.some((i) => i.name.toLowerCase() === name.toLowerCase())) return state;
      return {
        ...state,
        shopping: [
          ...state.shopping,
          { id: action.payload.id, name, checked: false, recipeIds: [] },
        ],
      };
    }
    case 'SHOPPING_TOGGLE':
      return {
        ...state,
        shopping: state.shopping.map((i) =>
          i.id === action.payload ? { ...i, checked: !i.checked } : i
        ),
      };
    case 'SHOPPING_REMOVE':
      return { ...state, shopping: state.shopping.filter((i) => i.id !== action.payload) };
    case 'SHOPPING_CLEAR_CHECKED':
      return { ...state, shopping: state.shopping.filter((i) => !i.checked) };
    case 'SHOPPING_CLEAR':
      return { ...state, shopping: [] };

    default:
      return state;
  }
}
