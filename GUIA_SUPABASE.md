# 🗄️ Guia Completo: Instalar e Configurar Supabase

## 📋 Passo a Passo

### 1. Criar Conta Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub ou Google

### 2. Criar Novo Projeto
1. Clique em **"New project"**
2. **Project name**: `ressonancia-social-v2`
3. **Database password**: Crie uma senha forte (guarde!)
4. **Region**: Escolha a mais próxima (ex: South America East)
5. Clique em **"Create new project"**

### 3. Executar Schema SQL
1. Aguarde o projeto ser criado (2-3 minutos)
2. Vá para **SQL Editor** no menu lateral
3. Copie todo o conteúdo do arquivo `supabase_schema.sql`
4. Cole no editor SQL e clique em **"Run"**
5. Verifique se todas as tabelas foram criadas

### 4. Obter Credenciais
1. Vá para **Settings** > **API**
2. Copie os seguintes valores:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 5. Configurar Variáveis de Ambiente
Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Variáveis Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# API Gemini (se já tiver)
API_KEY=sua-google-gemini-api-key

# Ambiente
NODE_ENV=production
VITE_APP_NAME=Ressonância Social
VITE_APP_VERSION=2.0.0
```

### 6. Ativar RLS (Row Level Security)
1. Vá para **Authentication** > **Policies**
2. Verifique se as políticas foram criadas:
   - `Users can view own profile`
   - `Users can update own profile`
   - `Gallery visibility based on user privacy`
   - `Resonance history privacy`

### 7. Testar Conexão
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 8. Verificar no Console
1. Abra o navegador em `http://localhost:5173`
2. Faça login com qualquer email/senha
3. Verifique no console do Supabase:
   - Vá para **Table Editor** > **users**
   - Deve aparecer o novo usuário

## 🔧 Configurações Adicionais

### Criar Função SQL para Contador
No SQL Editor, adicione esta função:

```sql
CREATE OR REPLACE FUNCTION increment_resonance_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET resonance_count = resonance_count + 1, updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

### Configurar Storage para Imagens
1. Vá para **Storage**
2. Crie bucket `avatars`
3. Crie bucket `gallery`
4. Configure políticas RLS para cada bucket

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
1. Vá para [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe: `starv8193-prog/ressonancia-social-v2`

### 2. Configurar Environment Variables
Na Vercel, adicione:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
API_KEY=sua-google-gemini-api-key
NODE_ENV=production
```

### 3. Deploy
Clique em **"Deploy"** e aguarde o build.

## 📋 Verificação Final

### Testar Funcionalidades:
- ✅ Login/Registro
- ✅ Busca de usuários
- ✅ Salvamento de perfil
- ✅ Histórico de ressonâncias
- ✅ Upload de mídias

### Verificar no Supabase:
- **Table Editor**: Ver dados salvos
- **Authentication**: Ver usuários criados
- **Logs**: Ver erros de conexão

## 🚨 Solução de Problemas

### Erro de Conexão:
```bash
# Verificar URL e chave
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Erro de Permissão:
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Erro de CORS:
1. Vá para **Settings** > **API**
2. Em **CORS settings**, adicione:
   - `http://localhost:5173`
   - `https://seu-projeto.vercel.app`

## 🎯 Resultado Esperado

Após seguir todos os passos:
- ✅ **Banco de dados real** funcionando
- ✅ **Usuários encontráveis** na busca
- ✅ **Dados persistentes** entre sessões
- ✅ **Deploy automático** na Vercel
- ✅ **Aplicação 100% funcional**

---

**Parabéns! Sua Ressonância Social agora tem backend real!** 🗄️🚀
