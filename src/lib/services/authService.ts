export type UserRole = 'user' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentIds?: string[];
}

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    await this.delay(1000);

    if (email.includes('teacher')) {
      this.currentUser = {
        id: '1',
        name: 'Sarah Johnson',
        email: email,
        role: 'teacher',
        avatar: '/avatars/teacher.png',
        studentIds: ['s1', 's2', 's3']
      };
    } else if (email.includes('admin')) {
      this.currentUser = {
        id: '3',
        name: 'Admin User',
        email: email,
        role: 'admin',
        avatar: '/avatars/admin.png'
      };
    } else {
      this.currentUser = {
        id: 'u1',
        name: 'Regular User',
        email: email,
        role: 'user',
        avatar: '/avatars/user.png'
      };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }

    return this.currentUser;
  }

  async register(name: string, email: string, password: string, role: UserRole = 'user'): Promise<User> {
    await this.delay(1000);

    this.currentUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatar: `/avatars/${role}.png`
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }

    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    }

    return null;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();
