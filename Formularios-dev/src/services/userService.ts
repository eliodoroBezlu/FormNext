import { apiClient } from "@/lib/api-client";


export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  }

  static async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  static async createUser(userData: CreateUserDto): Promise<User> {
    return apiClient.post<User>('/users', userData);
  }

  static async updateUser(id: string, userData: Partial<CreateUserDto>): Promise<User> {
    return apiClient.put<User>(`/users/${id}`, userData);
  }

  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  static async getCurrentProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async validateToken(token: string): Promise<{ valid: boolean; userInfo?: any }> {
    return apiClient.postPublic('/auth/validate', { token });
  }
}
