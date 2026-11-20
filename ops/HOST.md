# Hébergement Yekola

## VPS `153.75.235.176`

| URL | Port | Fichier env | Pi |
|-----|------|-------------|-----|
| **https://yekola.mcbuleli.com** | 3015 | `web/.env.production` | Mainnet (après app Production) |
| **https://pi-test.mcbuleli.com** | 3016 | `web/.env.pi-test` | Testnet / hackathon |

Service systemd : `yekola` et `yekola-pi-test`.

## DNS (Cloudflare)

```
A  yekola.mcbuleli.com     → 153.75.235.176
A  pi-test.mcbuleli.com    → 153.75.235.176
```

## Pi Developers (app Staging `yekola-u9r1`)

- `development_url` : `http://localhost:3015` (Sandbox local)
- `frontend_url` : **https://pi-test.mcbuleli.com** (pas yekola.mcbuleli.com)

Quand l’app **Production** Mainnet existera : `frontend_url` = **https://yekola.mcbuleli.com**.

## Deploy

```bash
bash ops/vps/deploy-app.sh
```

Les `.env.production` et `.env.pi-test` sur le serveur ne sont **pas** écrasés par rsync.