# niverr 🎂 — convites de aniversário

Convite personalizado por convidado, enviado pelo WhatsApp, com confirmação de presença sem login/SMS.

## Áreas
- `/` página inicial · `/cadastro` · `/entrar`
- `/painel` — organizador: festas, convidados (enviar via WhatsApp), detalhes, fotos, presentes, exportar CSV
- `/c/[token]` — convite do convidado ("Olá, Maria!"), mapa (Apple Maps no iPhone, Google Maps/Waze no Android), confirmação, fotos, lista de presentes
- `/admin` — dono da plataforma (e-mails em `SUPERADMIN_EMAILS`): métricas, gráfico 30 dias, acessos, erros/bugs, festas, organizadores, relatórios CSV

## Como o convidado é identificado
Cada convidado tem um token aleatório de 10 caracteres no link. O organizador pode gerar um link novo a qualquer momento (o antigo para de funcionar).

## Rodar local
```bash
cp .env.example .env   # preencha DATABASE_URL, AUTH_SECRET, SUPERADMIN_EMAILS
npm install
npx prisma migrate dev
npm run dev
```

## Produção (Vercel)
1. Banco: Neon Postgres pela Vercel Marketplace (preenche `DATABASE_URL`).
2. Fotos: criar um Blob store (preenche `BLOB_READ_WRITE_TOKEN`).
3. Definir `AUTH_SECRET`, `SUPERADMIN_EMAILS`, `NEXT_PUBLIC_APP_URL`.
4. O build roda `prisma migrate deploy` automaticamente.

## Teste local
- Banco local: `npx prisma dev --name niverr` (a URL TCP vai no `.env`)
- Conta de teste (admin da plataforma): `admin@niverr.test` / `teste123`
