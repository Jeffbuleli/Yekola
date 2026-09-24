# Yekola

**Créez. Vendez. Apprenez — même hors ligne.**

SaaS multi-tenant : les enseignants s’abonnent pour publier leurs cours ; les apprenants achètent chaque cours et peuvent apprendre hors ligne après l’achat.

- Site : https://yekola.mcbuleli.com
- App : `web/` (Next.js 15)
- Produit : `docs/PRODUCT.md`
- Deploy : `bash ops/vps/deploy-app.sh`

## Démarrage local

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Comptes démo (seed) :

- Enseignant : `jeff@yekola.demo` / `yekola2026`
- Apprenant : `patty@yekola.demo` / `yekola2026`

## Tarifs enseignants (FC)

| Plan | Prix / mois |
|------|-------------|
| Free | 0 FC |
| Base | 1 000 FC |
| Pro | 1 500 FC |
| Max | 2 000 FC |
