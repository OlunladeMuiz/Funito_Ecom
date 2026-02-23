const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    // Load token from localStorage on init
    this.accessToken = localStorage.getItem("accessToken");
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }

  getToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        this.setToken(null);
        return null;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.setToken(null);
        localStorage.removeItem("refreshToken");
        return null;
      }

      const data = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
      };

      this.setToken(data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    hasRetried = false
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !hasRetried && endpoint !== "/auth/refresh") {
      const newAccessToken = await this.refreshAccessToken();
      if (newAccessToken) {
        return this.request<T>(endpoint, options, true);
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new ApiError(response.status, error.message || "Request failed");
    }

    return response.json();
  }

  // GET request
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST request
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiClient = new ApiClient();
