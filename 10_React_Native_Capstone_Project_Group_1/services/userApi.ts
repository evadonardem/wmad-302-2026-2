/**
 * User API Service - DummyJSON Users
 * Docs: https://dummyjson.com/docs/users
 */
import axios, { AxiosInstance } from 'axios';
import { UpdateProfileData } from '@/types/user';
import { getErrorStatus } from '@/utils/errors';

const API_BASE_URL = 'https://dummyjson.com';

export interface UpdatedUser {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

class UserApiService {
  private client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client =
      client ??
      axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  /**
   * PUT /users/{id}
   * DummyJSON simulates the update (nothing is stored server-side), and users
   * created through the register screen don't exist on the server (404). In
   * both cases the caller applies the changes locally, so a 404 is treated as
   * a successful simulated update.
   */
  async updateUser(id: number, data: UpdateProfileData): Promise<UpdatedUser> {
    try {
      const response = await this.client.put<UpdatedUser>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      if (getErrorStatus(error) === 404) return { id, ...data };
      throw error;
    }
  }
}

export const userApi = new UserApiService();
export { UserApiService };
