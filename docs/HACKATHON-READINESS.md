# YEKOLA - HACKATHON READINESS

Date: 2026-09-24

## Checklist

```text
YEKOLA - HACKATHON READINESS

✓ Fonctionnalités marketing conservées (repositionnées)
✓ Audit docs/AUDIT-2026-09-24.md
✓ P0 cœur démo (parcours, quiz, offline queue, AI, skills, verify)
✓ AI Tutor (OpenAI ou DEMO MODE)
✓ AI Course Builder (draft + human review)
✓ Offline/Learning Hub (IndexedDB + SW + bouton simuler offline)
✓ Synchronisation (/api/sync idempotent)
✓ Quiz JS Functions
✓ Skill Passport
✓ Certificat vérifiable /verify/YK-WEB-2026-JM01
✓ Dashboard apprenant
✓ Dashboard formateur (+ AI Insights)
✓ Dashboard organisation
✓ Mobile-first CSS
✓ Demo data (Jonathan / Sarah / Centre Kinshasa)
~ Security review (surface API minimale, pas de secrets en client)
~ Performance (build VPS; images unoptimized)
~ Build local machine tué (SIGKILL) - build sur VPS
✓ Demo flow documenté ci-dessous
```

## Ce qui a été modifié

- Scaffold Next.js 15 dans `web/`
- Logos `brand/yekola-mark.png` + `yekola-wordmark.png`
- App démo jury : learn / teach / org / verify / AI / sync / Meet
- Deploy app : `ops/vps/deploy-app.sh` + nginx proxy :3015
- Audit : `docs/AUDIT-2026-09-24.md`

## Fichiers importants

- `web/src/lib/seed/demo-data.ts`
- `web/src/lib/sync/sync-manager.ts`
- `web/src/lib/ai/*`
- `web/src/components/connectivity-bar.tsx`
- `web/src/app/learn/**`
- `web/src/app/teach/page.tsx`
- `web/src/app/verify/[code]/page.tsx`
- `web/public/sw.js`
- `ops/vps/deploy-app.sh`

## Variables d'environnement

Voir `web/.env.example` :

- `OPENAI_API_KEY` (sinon AI = DEMO MODE explicite)
- `OPENAI_MODEL` (défaut gpt-4o-mini)
- `NEXT_PUBLIC_MEET_BASE_URL=https://live.mcbuleli.org`
- `NEXT_PUBLIC_APP_URL=https://yekola.mcbuleli.com`
- `PORT=3015`

## Commandes

```bash
cd web && npm install && npm run dev
# Prod VPS
bash ops/vps/deploy-app.sh
```

## Limites honnêtes

- Offline = prototype crédible (cache SW + IndexedDB), pas un hub physique Kolibri.
- Paiement = DemoProvider uniquement (pas de faux débit PawaPay).
- Sync serveur = acceptation en mémoire process (redémarrage = reset côté serveur ; file locale conserve).
- Auth = sélection de rôle démo (pas OAuth).
- Build local parfois tué sur ce Mac - privilégier build VPS.

## Scénario démo (jury)

1. Accueil → **Commencer à apprendre**
2. Choisir **Jonathan Mbuyi**
3. Continuer **JavaScript Functions**
4. Cliquer **Simuler offline** (barre connectivity)
5. Terminer leçon + passer quiz
6. Yekola AI : « pourquoi ma réponse est fausse »
7. Ouvrir Skill Passport
8. Soumettre projet PME Kinshasa
9. Désactiver offline → **Synchroniser**
10. Formatrice Sarah : AI Insights + Course Builder draft
11. Meet → live.mcbuleli.org
12. `/verify/YK-WEB-2026-JM01`

## Post-hackathon

- Postgres + auth réelle
- PawaPay MobileMoneyProvider
- Hub physique (LAN)
- JWT Meet McBuleli
- i18n Lingala
