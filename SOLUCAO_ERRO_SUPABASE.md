# 🚨 Solução Completa: Erro de Autenticação Supabase

## 🔍 Problema Identificado

### **Logs de Erros:**
```
GET /rest/v1/profiles?select=*&id=eq.32038ac5-a671-4be7-881c-d6c15d357737 | 404
GET /rest/v1/_test_connection?select=*&limit=1 | 404
POST /auth/v1/signup | 422
```

### **Causa Raiz:**
- App.tsx está tentando usar **endpoints REST inexistentes**
- Funções de autenticação são **mock** mas tentam acessar Supabase
- Conflito entre mock e real

## 🔧 Solução Passo a Passo

### **1. Desabilitar Autenticação Supabase Temporariamente**

Modifique o `App.tsx` para usar apenas autenticação mock:

```tsx
// Comente ou remova as chamadas Supabase no login
// Mantenha apenas o authService mock existente

const handleLoginSuccess = async (userData: AuthUser) => {
  setAuthState({
    user: userData,
    isAuthenticated: true,
    isLoading: false
  });

  // Carregar dados do usuário após login
  try {
    // Use apenas dados mock por enquanto
    const mockUserData = {
      profile: {
        name: userData.name,
        bio: 'Usuário mock temporário',
        // ... outros campos mock
      },
      // ... outros dados mock
    };
    
    setUserData(mockUserData);
  } catch (error) {
    console.error('Error loading user data on login:', error);
  }
};
```

### **2. Configurar CORS no Supabase**

No dashboard Supabase:
1. **Settings** → **API**
2. Em **CORS settings**, adicione:
   ```
   https://ressonancia-social-v2.vercel.app
   http://localhost:5173
   http://localhost:3000
   ```
3. Salve as configurações

### **3. Ajustar Variáveis de Ambiente**

No dashboard Vercel, verifique se as variáveis estão corretas:
```
VITE_SUPABASE_URL=https://dbqavikwfalegfstceqr.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### **4. Testar Conexão**

Use o Supabase Client Library diretamente:

```tsx
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Teste simples
const testConnection = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .limit(1);
    
  if (error) {
    console.error('Erro de conexão:', error);
  } else {
    console.log('Conexão OK:', data);
  }
};
```

## 🎯 Estratégia Recomendada

### **Fase 1: Mock Funcional**
1. **Desabilite** tentativas de acesso Supabase
2. **Use apenas** authService mock
3. **Teste** login e cadastro
4. **Funcionalidade básica** funcionando

### **Fase 2: Integração Gradual**
1. **Substitua** uma função por vez
2. **Teste** cada mudança
3. **Mantenha** backup do mock
4. **Use** Supabase Client Library

### **Fase 3: Migração Completa**
1. **Autenticação Supabase** real
2. **RLS policies** configuradas
3. **CORS** funcionando
4. **Todos os endpoints** funcionando

## 📋 Checklist de Resolução

- [ ] Desabilitar chamadas Supabase no App.tsx
- [ ] Usar apenas authService mock
- [ ] Configurar CORS no Supabase
- [ ] Testar login/cadastro mock
- [ ] Implementar Supabase auth
- [ ] Migrar dados existentes
- [ ] Testar busca de usuários
- [ ] Fazer deploy final

## 🚨 Se Ainda Persistir

### **Sintomas:**
- Erro 404 em `/rest/v1/profiles`
- Erro 422 em `/auth/v1/signup`
- Login/cadastro não funcionam
- Dados não são salvos

### **Ações Imediatas:**
1. **Comente todas** as chamadas `supabaseService` no App.tsx
2. **Use apenas** `authService` mock
3. **Teste** localmente
4. **Configure CORS** no dashboard Supabase

---

**O problema é que o App.tsx está "no meio" entre mock e real!** 

**Siga os passos acima para resolver completamente.**
