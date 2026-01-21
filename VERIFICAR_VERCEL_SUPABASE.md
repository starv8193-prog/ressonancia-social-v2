# 🔍 Verificar Conexão Vercel + Supabase

## ✅ Status Atual

Seu projeto já está **deployado na Vercel**:
- **URL**: https://ressonancia-social-v2.vercel.app
- **Status**: ✅ Online e funcionando
- **Supabase**: 🔄 Precisa verificar conexão

## 🔧 Como Verificar Variáveis de Ambiente

### 1. Acessar Dashboard Vercel
1. Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
2. Encontre o projeto `ressonancia-social-v2`
3. Clique em **"Settings"**
4. Vá para **"Environment Variables"**

### 2. Verificar Variáveis Necessárias
No dashboard da Vercel, verifique se estas variáveis existem:

```
VITE_SUPABASE_URL=https://dbqavikwfalegfstceqr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicWF2aWt3ZmFsZWdmc3RjZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MzkxNzEsImV4cCI6MjA4NDUxNTE3MX0.EcpsrbVh8nojK1exOK6a-OKofAQJ_BJ9jSt82ZTBaSc
API_KEY=sua_google_gemini_api_key_aqui
NODE_ENV=production
VITE_APP_NAME=Ressonância Social
VITE_APP_VERSION=2.0.0
```

### 3. Se Faltarem Variáveis
1. Clique em **"Add New"**
2. Adicione cada variável acima
3. Marque como **Environment**: Production, Preview, Development
4. Clique em **"Save"**

## 🚀 Como Fazer Redeploy

Após configurar as variáveis:

### Opção 1: Automaticamente
1. Vá para **"Deployments"** no dashboard Vercel
2. Clique nos **três pontos (⋯)** do deployment mais recente
3. Selecione **"Redeploy"**

### Opção 2: Via Git
```bash
git add .
git commit -m "🔧 Add Supabase environment variables"
git push origin main
```

## 🔍 Como Testar a Conexão

### 1. Teste no Browser
1. Abra: https://ressonancia-social-v2.vercel.app
2. Abra **DevTools** (F12)
3. Vá para **Console**
4. Procure por erros de conexão

### 2. Teste de Busca
1. Na aplicação, clique em **"Feed"**
2. No campo de busca, digite: "joao"
3. Deveria aparecer: **"João Silva"**

### 3. Teste de Login
1. Tente fazer login com: `joao@exemplo.com`
2. Use qualquer senha (modo de desenvolvimento)

## 🚨 Possíveis Erros e Soluções

### Erro: "Supabase connection failed"
**Causa**: Variáveis de ambiente incorretas
**Solução**: Verifique URL e ANON_KEY no dashboard Vercel

### Erro: "CORS policy blocked"
**Causa**: URL do Supabase não configurada para Vercel
**Solução**: 
1. No Supabase > Settings > API
2. Em CORS, adicione: `https://ressonancia-social-v2.vercel.app`

### Erro: "Users not found"
**Causa**: RLS policies bloqueando acesso
**Solução**: Verifique políticas RLS no Supabase

## 📋 Checklist Final

- [ ] Variáveis configuradas no dashboard Vercel
- [ ] CORS configurado no Supabase
- [ ] Redeploy realizado
- [ ] Busca de usuários funcionando
- [ ] Login funcionando
- [ ] Dados aparecendo na aplicação

## 🎯 Resultado Esperado

Após configurar tudo:
- ✅ **Busca funcionando** (encontre "João", "Maria", "Pedro")
- ✅ **Dados reais** aparecendo
- ✅ **Conexão estável** com Supabase
- ✅ **Aplicação 100% funcional**

---

**Sua aplicação está pronta! Só precisa configurar as variáveis na Vercel!** 🚀
