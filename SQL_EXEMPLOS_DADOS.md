# 📊 Códigos SQL para Popular Dados de Exemplo

## 👤 Tabela: users
```sql
-- Inserir usuários de exemplo
INSERT INTO users (email, name, bio, avatar_url, avatar_color, is_public) VALUES
('joao@exemplo.com', 'João Silva', 'Desenvolvedor apaixonado por tecnologia', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', '#ff6b6b', true),
('maria@exemplo.com', 'Maria Santos', 'Designer criativa e fotógrafa', 'https://images.unsplash.com/photo-1494790108755-2616b332c2ca?w=200&h=200&fit=crop', '#4ecdc4', true),
('pedro@exemplo.com', 'Pedro Costa', 'Engenheiro de software e gamer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', '#45b7d1', true);
```

## 🖼️ Tabela: gallery
```sql
-- Inserir posts de exemplo
INSERT INTO gallery (user_id, caption, media_urls, timestamp, author_name) VALUES
(
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1),
  'Meu novo projeto de desenvolvimento web! 🚀',
  ARRAY['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'],
  1703123456789,
  'João Silva'
),
(
  (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1),
  'Lindo pôr do sol na praia 🌅',
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'],
  1703223456789,
  'Maria Santos'
);
```

## 📝 Tabela: resonance_history
```sql
-- Inserir histórico de ressonâncias
INSERT INTO resonance_history (user_id, original, response, timestamp) VALUES
(
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1),
  'Qual o futuro da inteligência artificial?',
  '{"title": "O Futuro da IA", "content": "A inteligência artificial está evoluindo rapidamente...", "tags": ["tecnologia", "futuro", "IA"]}',
  1703323456789
),
(
  (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1),
  'Como melhorar a criatividade?',
  '{"title": "Despertando a Criatividade", "content": "A criatividade floresce com prática e abertura...", "tags": ["criatividade", "arte", "desenvolvimento"]}',
  1703423456789
);
```

## 👥 Tabela: followers
```sql
-- Inserir relacionamentos de seguidores
INSERT INTO followers (follower_id, following_id) VALUES
((SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1), (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1)),
((SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1), (SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1)),
((SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1), (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1));
```

## 👑 Tabela: dynasties
```sql
-- Inserir dinastias (grupos/clãs)
INSERT INTO dynasties (name, photo_url, banner_url, purpose, is_public, created_by) VALUES
(
  'Desenvolvedores Web',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
  'Comunidade para desenvolvedores compartilharem conhecimento e projetos',
  true,
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1)
),
(
  'Criativos Digitais',
  'https://images.unsplash.com/photo-1494790108755-2616b332c2ca?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
  'Espaço para artistas, designers e criativos digitais',
  true,
  (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1)
);
```

## 👥 Tabela: dynasty_members
```sql
-- Inserir membros nas dinastias
INSERT INTO dynasty_members (dynasty_id, user_id, role_name, role_color) VALUES
((SELECT id FROM dynasties WHERE name = 'Desenvolvedores Web' LIMIT 1), (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1), 'Fundador', '#ff6b6b'),
((SELECT id FROM dynasties WHERE name = 'Desenvolvedores Web' LIMIT 1), (SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1), 'Membro', '#45b7d1'),
((SELECT id FROM dynasties WHERE name = 'Criativos Digitais' LIMIT 1), (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1), 'Fundadora', '#4ecdc4');
```

## 💬 Tabela: dynasty_messages
```sql
-- Inserir mensagens nas dinastias
INSERT INTO dynasty_messages (dynasty_id, user_id, role_name, role_color, text, timestamp) VALUES
(
  (SELECT id FROM dynasties WHERE name = 'Desenvolvedores Web' LIMIT 1),
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1),
  'Fundador',
  '#ff6b6b',
  'Bem-vindos à nossa comunidade! Vamos compartilhar conhecimento e crescer juntos! 🚀',
  1703523456789
),
(
  (SELECT id FROM dynasties WHERE name = 'Desenvolvedores Web' LIMIT 1),
  (SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1),
  'Membro',
  '#45b7d1',
  'Obrigado pela oportunidade! Estou animado para aprender com todos! 🎯',
  1703623456789
);
```

## 👥 Tabela: groups
```sql
-- Inserir grupos menores
INSERT INTO groups (name, photo_url, created_by) VALUES
(
  'React Brasil',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop',
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1)
),
(
  'Design UI/UX',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop',
  (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1)
);
```

## 👥 Tabela: group_members
```sql
-- Inserir membros nos grupos
INSERT INTO group_members (group_id, user_id) VALUES
((SELECT id FROM groups WHERE name = 'React Brasil' LIMIT 1), (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1)),
((SELECT id FROM groups WHERE name = 'React Brasil' LIMIT 1), (SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1)),
((SELECT id FROM groups WHERE name = 'Design UI/UX' LIMIT 1), (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1));
```

## 💬 Tabela: group_messages
```sql
-- Inserir mensagens nos grupos
INSERT INTO group_messages (group_id, user_id, text, timestamp) VALUES
(
  (SELECT id FROM groups WHERE name = 'React Brasil' LIMIT 1),
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1),
  'Alguém trabalhando com React 18? Quero compartilhar algumas dicas! ⚛️',
  1703723456789
),
(
  (SELECT id FROM groups WHERE name = 'React Brasil' LIMIT 1),
  (SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1),
  'Sim! Estou usando em um projeto novo. Que dicas você tem? 🤔',
  1703823456789
);
```

## 🎯 Tabela: participations
```sql
-- Inserir participações ativas
INSERT INTO participations (topic, description, active_count, created_by) VALUES
(
  'Desafio de Código Semanal',
  'Participe do nosso desafio semanal de programação! Cada semana um novo problema para resolver.',
  15,
  (SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1)
),
(
  'Workshop de Design',
  'Aprenda os fundamentos de design digital em nosso workshop online gratuito.',
  8,
  (SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1)
);
```

## ⚙️ Tabela: user_settings
```sql
-- Inserir configurações dos usuários
INSERT INTO user_settings (user_id, is_public, allow_messages, allow_groups, allow_dynasty_invites) VALUES
((SELECT id FROM users WHERE email = 'joao@exemplo.com' LIMIT 1), true, true, true, true),
((SELECT id FROM users WHERE email = 'maria@exemplo.com' LIMIT 1), true, true, true, true),
((SELECT id FROM users WHERE email = 'pedro@exemplo.com' LIMIT 1), true, false, true, false);
```

---

## 🚀 Como Usar:

1. **Copie e cole** cada bloco SQL no Table Editor do Supabase
2. **Execute** um de cada vez para evitar erros
3. **Verifique** os dados inseridos nas tabelas
4. **Teste** a busca de usuários na aplicação

## 📋 Resultado Esperado:

Após executar todos os códigos:
- ✅ **3 usuários** criados e buscáveis
- ✅ **Posts na galeria** para cada usuário
- ✅ **Histórico de ressonâncias** populado
- ✅ **Sistema de seguidores** funcionando
- ✅ **Dinastias e grupos** com membros
- ✅ **Mensagens** trocadas
- ✅ **Participações** ativas

**Agora sua aplicação terá dados reais para testar!** 🎉
