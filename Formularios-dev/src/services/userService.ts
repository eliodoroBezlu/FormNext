import { apiClient } from "../lib/api-client";


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
    return apiClient.post<User, CreateUserDto>('/users', userData);
  }

  static async updateUser(id: string, userData: Partial<CreateUserDto>): Promise<User> {
    return apiClient.put<User, Partial<CreateUserDto>>(`/users/${id}`, userData);
  }

  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  static async getCurrentProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  static async validateToken(token: string): Promise<{ valid: boolean; userInfo?: User }> {
    return apiClient.postPublic<{ valid: boolean; userInfo?: User }, { token: string }>(
      '/auth/validate',
      { token }
    );
  }
}
