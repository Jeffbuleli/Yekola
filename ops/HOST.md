# Hébergement yekola.mcbuleli.com

## Choix parmi les 2 VPS McBuleli

| VPS | IP | Rôle | Verdict Yekola |
|-----|-----|------|----------------|
| **Principal** | `162.35.181.98` | mcbuleli.com, Postgres, Jitsi live, e-avec, nginx multi-sites | **Retenu** |
| Ancien live | `162.35.160.30` | Jitsi legacy, à décommissionner | **Non** - pas de cible long terme |

Même schéma que `e-avec.org` : app Docker sur `127.0.0.1:PORT` + nginx + certbot sur le VPS principal.

## DNS (Cloudflare)
```
A  yekola.mcbuleli.com  → 162.35.181.98
```

## Ports suggérés
- App Yekola : `127.0.0.1:3015` (libre vs 3000 McBuleli, 3001 AVEC, 3012 Ngemba sur autre hôte)
- Meet : réutiliser `live.mcbuleli.org` (JWT rooms `yekola-*`) plutôt qu’un 2e Jitsi

## Repo
- GitHub : `Jeffbuleli/Yekola`
- Local : `/Users/mac/Documents/Yekola`
- Prod path : `/opt/yekola`

Deploy laptop : `bash ops/vps/deploy.sh`
