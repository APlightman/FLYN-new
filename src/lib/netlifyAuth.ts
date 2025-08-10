interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  user?: User;
  error?: string;
}

class NetlifyAuth {
  private baseUrl: string;
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    this.baseUrl = window.location.origin;
    this.loadFromStorage();
  }

  private saveToStorage() {
    if (this.currentUser && this.token) {
      localStorage.setItem('netlify_auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('netlify_auth_token', this.token);
    }
  }

  private loadFromStorage() {
    const user = localStorage.getItem('netlify_auth_user');
    const token = localStorage.getItem('netlify_auth_token');
    
    if (user && token) {
      this.currentUser = JSON.parse(user);
      this.token = token;
    }
  }

  private clearStorage() {
    localStorage.removeItem('netlify_auth_user');
    localStorage.removeItem('netlify_auth_token');
    this.currentUser = null;
    this.token = null;
  }

  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/auth-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName })
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, user: result.user };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success) {
        this.currentUser = result.user;
        this.token = result.access_token;
        this.saveToStorage();
        
        return { 
          success: true, 
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          user: result.user 
        };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  }

  logout() {
    this.clearStorage();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!(this.currentUser && this.token);
  }
}

export const netlifyAuth = new NetlifyAuth();
