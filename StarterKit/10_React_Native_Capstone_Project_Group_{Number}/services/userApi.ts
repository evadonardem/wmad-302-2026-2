/**
 * User API - DummyJSON users
 * Docs: https://dummyjson.com/docs/users
 */
import axios from 'axios';
import { toApiError } from '@/services/authApi';

const client = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

/**
 * PUT /users/{id}. DummyJSON only simulates the update (it echoes the changed
 * user back without saving it), so callers must also save the changes locally.
 */
export async function updateUser(id: number, changes: UserUpdate): Promise<UserUpdate> {
  try {
    const response = await client.put<UserUpdate>(`/users/${id}`, changes);
    return response.data;
  } catch (error) {
    throw toApiError(error, 'Could not update your profile');
  }
}
