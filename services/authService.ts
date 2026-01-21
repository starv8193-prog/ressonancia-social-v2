export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  token?: string;
  error?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    // Simulação de login para teste
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula resposta de sucesso para qualquer email/senha
    if (credentials.email && credentials.password) {
      const mockUser = {
        id: '1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        avatarUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=200&fit=crop'
      };
      
      return {
        success: true,
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now()
      };
    }
    
    return {
      success: false,
      error: 'Email e senha são obrigatórios'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Erro de conexão com o servidor'
    };
  }
}

export async function register(userData: RegisterRequest): Promise<LoginResponse> {
  try {
    // Simulação de registro para teste
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (userData.name && userData.email && userData.password) {
      const mockUser = {
        id: '1',
        name: userData.name,
        email: userData.email,
        avatarUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=200&fit=crop'
      };
      
      return {
        success: true,
        user: mockUser,
        token: 'mock-jwt-token-' + Date.now()
      };
    }
    
    return {
      success: false,
      error: 'Todos os campos são obrigatórios'
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'Erro de conexão com o servidor'
    };
  }
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    // Simulação de validação de token
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Token mock sempre válido para teste
    return token.startsWith('mock-jwt-token-');
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

export async function logout(token: string): Promise<void> {
  try {
    // Simulação de logout
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Logout realizado com sucesso');
  } catch (error) {
    console.error('Logout error:', error);
  }
}
