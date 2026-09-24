# Hébergement yekola.mcbuleli.com

## VPS

| VPS | IP | Rôle |
|-----|-----|------|
| **Principal** | `162.35.181.98` | yekola.mcbuleli.com, nginx, app :3015 |

## DNS (Cloudflare)

```
A  yekola.mcbuleli.com  → 162.35.181.98
```

## Ports

- App Yekola : `127.0.0.1:3015`
- Meet optionnel : `live.mcbuleli.org` (rooms `yekola-*`)

## Repo

- GitHub : `Jeffbuleli/Yekola`
- Local : `/Users/mac/Documents/Yekola`
- Prod : `/opt/yekola`

Deploy : `bash ops/vps/deploy-app.sh`
