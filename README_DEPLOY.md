# Deploy na Vercel - Ressonância Social v2

## 🚀 Passos para Deploy

### 1. Preparar o Repositório
```bash
# Commit todas as mudanças
git add .
git commit -m "Preparar projeto para deploy na Vercel"
git push origin main
```

### 2. Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel:
1. Vá para Settings → Environment Variables
2. Adicione as seguintes variáveis:

```
API_KEY=sua_google_gemini_api_key_aqui
NODE_ENV=production
VITE_APP_NAME=Ressonância Social
VITE_APP_VERSION=2.0.0
```

### 3. Conectar com GitHub

1. Faça login na [Vercel](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. A Vercel detectará automaticamente que é um projeto Vite

### 4. Configurações de Build

A Vercel usará automaticamente:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy

Clique em "Deploy" e aguarde o build completar.

## 📋 Arquivos de Configuração

### vercel.json
- Configura rotas para SPA (Single Page Application)
- Define comando de build e output directory
- Configura rewrites para roteamento do React

### .env.example
- Template com variáveis de ambiente necessárias
- Use como referência para configurar na Vercel

## 🔧 Configurações Importantes

### API Key do Gemini
- **Obrigatório**: Configure `API_KEY` nas environment variables
- Sem isso, a API de ressonância não funcionará

### Roteamento
- Todas as rotas são redirecionadas para `index.html`
- Permite navegação SPA sem erros 404

### Build Otimizado
- Vite com TypeScript
- React 19
- Build estático otimizado para Vercel

## 🌐 Após o Deploy

1. **Teste a aplicação** na URL fornecida pela Vercel
2. **Verifique o console** para erros de API
3. **Configure domínio personalizado** (opcional)
4. **Monitore** nos Analytics da Vercel

## 🚨 Solução de Problemas

### Erro de API
- Verifique se `API_KEY` está configurada corretamente
- Confirme se a key tem permissões para a API Gemini

### Build Falha
- Verifique se todas as dependências estão em `package.json`
- Confirme se não há erros de TypeScript

### Erros 404
- As rotas estão configuradas no `vercel.json`
- Verifique se o arquivo foi criado corretamente

## 📞 Suporte

Se precisar ajuda:
1. Verifique os logs de build na Vercel
2. Teste localmente com `npm run build && npm run preview`
3. Confirme todas as variáveis de ambiente

---

**Projeto pronto para deploy na Vercel! 🎉**
