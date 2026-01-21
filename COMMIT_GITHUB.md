# Comandos Git para Salvar no GitHub

## Execute estes comandos no terminal na pasta do projeto:

### 1. Inicializar repositório Git
```bash
git init
```

### 2. Configurar usuário (se primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@example.com"
```

### 3. Adicionar remote do GitHub
```bash
git remote add origin https://github.com/SEU_USERNAME/ressonancia-social-v2.git
```

### 4. Adicionar todos os arquivos
```bash
git add .
```

### 5. Fazer o commit inicial
```bash
git commit -m "🚀 Projeto Ressonância Social v2 - Deploy Vercel pronto

✅ Features implementadas:
- Sistema de login/registro completo
- Persistência de dados dos usuários
- API de ressonância social com Gemini
- Interface moderna com React + TypeScript
- Configuração para deploy na Vercel

🔧 Arquivos criados:
- services/authService.ts - Autenticação completa
- services/userDataService.ts - Persistência de dados
- components/LoginForm.tsx - Interface de login
- vercel.json - Configuração deploy Vercel
- README_DEPLOY.md - Instruções de deploy

📦 Tecnologias:
- React 19 + TypeScript
- Vite 6
- Google Gemini AI
- TailwindCSS (estilos inline)
- Mock API para autenticação"
```

### 6. Fazer push para o GitHub
```bash
git branch -M main
git push -u origin main
```

## 📝 Arquivos que serão commitados:

### Frontend:
- App.tsx - Aplicação principal com autenticação
- components/ - Componentes React
- services/ - Serviços de API e dados
- types.ts - Tipos TypeScript

### Configuração:
- package.json - Dependências e scripts
- vite.config.ts - Configuração Vite
- tsconfig.json - Configuração TypeScript
- vercel.json - Deploy Vercel

### Documentação:
- README.md - Descrição do projeto
- README_DEPLOY.md - Instruções de deploy
- .env.example - Variáveis de ambiente

### Ignorados (.gitignore):
- node_modules/
- .env.local
- dist/
- logs/

## 🚀 Após o push:

1. **Configure variáveis de ambiente** na Vercel:
   - API_KEY do Google Gemini
   - NODE_ENV=production

2. **Conecte o repositório** na Vercel para deploy automático

3. **Teste a aplicação** na URL da Vercel

---

**Projeto pronto para produção! 🎉**
