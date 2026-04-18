# GestãoPro — Sistema de Gestão Empresarial SaaS

Sistema completo de gestão empresarial multi-tenant construído com **React + Vite + Supabase**.

## 📦 Módulos

| Módulo | Arquivo | Descrição |
|--------|---------|-----------|
| Dashboard | `Dashboard.jsx` | KPIs e gráficos gerais |
| PDV | `PDV.jsx` | Ponto de venda com carrinho |
| Caixa | `Caixa.jsx` | Abertura/fechamento e movimentos |
| Estoque | `Estoque.jsx` | Produtos e controle de estoque |
| Financeiro | `Financeiro.jsx` | Contas a pagar e receber |
| Serviços / OS | `Servicos.jsx` | Ordens de serviço |
| Nota Fiscal | `NotaFiscal.jsx` | Emissão NF-e via Focus NFe |
| Relatórios | `Relatorios.jsx` | Gráficos analíticos |
| Suporte | `Suporte.jsx` | Tickets de atendimento |

## 🚀 Como rodar

```bash
# 1. Navegar até a pasta
cd C:\Users\GABRIEL\Desktop\gestao-saas

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
# Renomeie .env.example para .env e preencha com suas credenciais do Supabase

# 4. Criar tabelas no Supabase
# Abra o SQL Editor no painel do Supabase e cole o conteúdo de schema.sql

# 5. Rodar em desenvolvimento
npm run dev

# 6. Build para produção
npm run build
```

## ⚙️ Configuração Supabase

1. Crie um projeto em https://supabase.com
2. Copie a **URL** e **anon key** do painel → Settings → API
3. Cole no `.env`
4. Execute o `schema.sql` no SQL Editor

## 🧾 Nota Fiscal (NF-e)

Integração preparada para **Focus NFe** (https://focusnfe.com.br) ou **NFe.io**.

1. Crie conta no Focus NFe (homologação gratuita)
2. Copie token e URL da API
3. Cole no `.env`
4. Ajuste o payload em `NotaFiscal.jsx` conforme dados da sua empresa

## 💰 Planos SaaS sugeridos

| Plano | Preço | Módulos |
|-------|-------|---------|
| Básico | R$ 89/mês | PDV + Caixa + Estoque |
| Pro | R$ 149/mês | + Financeiro + NF-e + OS |
| Premium | R$ 249/mês | Tudo + Suporte prioritário |

## 🏗️ Deploy (Vercel)

```bash
cd C:\Users\GABRIEL\Desktop\gestao-saas

# Criar repositório e subir no GitHub
git init
git add .
git commit -m "feat: initial commit — GestãoPro SaaS"
git remote add origin https://github.com/Bieli131121/gestao-saas.git
git branch -M main
git push -u origin main

# Deploy na Vercel
npx vercel --prod

# Adicionar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_NFE_TOKEN
vercel env add VITE_NFE_API_URL

# Redeploy para aplicar as variáveis
vercel --prod
```

## 📁 Estrutura

```
C:\Users\GABRIEL\Desktop\gestao-saas\
├── src/
│   ├── pages/          # Um arquivo por módulo
│   ├── components/     # Layout + Sidebar
│   ├── context/        # AuthContext (auth + empresa)
│   ├── hooks/          # useEmpresa
│   ├── lib/            # supabase.js
│   └── App.jsx         # Rotas
├── schema.sql          # Execute no Supabase SQL Editor
├── .env.example        # Renomear para .env e preencher
└── README.md
```

---

Desenvolvido com ❤️ — Stack: React · Vite · Supabase · Recharts · Tailwind
