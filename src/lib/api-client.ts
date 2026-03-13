type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: any;
} | {
  success: false;
  error: string;
  code?: string;
};

class ApiClient {
  private baseUrl: string = "";
  private apiKey: string = process.env.NEXT_PUBLIC_API_SECRET_KEY || "";

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const payload = await response.json() as ApiResponse<T>;

    if (!response.ok || !payload.success) {
      const errorMessage = (!payload.success && payload.error) 
        ? payload.error 
        : `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return payload.data;
  }

  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  async post<T>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
