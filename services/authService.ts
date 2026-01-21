import { AuthUser, AuthState } from '../types';

// Mock authentication service
export const login = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  // Simulação de login
  if (email && password) {
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      email: email,
      name: email.split('@')[0],
      token: 'mock-token-' + crypto.randomUUID()
    };
    
    return {
      success: true,
      user: mockUser
    };
  }
  
  return {
    success: false,
    error: 'Email ou senha inválidos'
  };
};

export const register = async (data: { email: string; password: string; name: string }): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  // Simulação de registro
  if (data.email && data.password && data.name) {
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      token: 'mock-token-' + crypto.randomUUID()
    };
    
    return {
      success: true,
      user: mockUser
    };
  }
  
  return {
    success: false,
    error: 'Dados inválidos'
  };
};

export const validateToken = async (token: string): Promise<boolean> => {
  // Simulação de validação de token
  return token.startsWith('mock-token-');
};

export const logout = async (token: string): Promise<void> => {
  // Simulação de logout
  console.log('Logout:', token);
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}