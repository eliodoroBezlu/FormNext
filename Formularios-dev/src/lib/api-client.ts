import { getSession } from "next-auth/react";

class ApiClient {
  private baseURL: string;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  ) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders() {
    const session = await getSession();

    if (!session?.accessToken) {
      throw new Error("No access token available");
    }

    return {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  private async handleApiResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido - redirigir a login
        window.location.href = "/";
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers,
    });

    return this.handleApiResponse(response);
  }
  
  async post<T>(
    endpoint: string, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleApiResponse(response);
  }
  async put<T>(
    endpoint: string, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleApiResponse(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    return this.handleApiResponse(response);
  }

  // Método especial para endpoints públicos
  async getPublic<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleApiResponse(response);
  }
  async postPublic<T>(
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleApiResponse(response);
  }
}

export const apiClient = new ApiClient();
