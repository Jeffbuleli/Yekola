# Yekola sur Pi Next

Date limite de soumission : 5 janvier 2027, 23 h 59 PT.

## Domaines

| Domaine | Réseau Pi | Usage |
|---------|-----------|--------|
| **pi-test.mcbuleli.com** | Testnet (Staging) | Hackathon, Sandbox navigateur, clés sandbox |
| **yekola.mcbuleli.com** | Mainnet (Production) | Produit public quand l’app Pi Production est créée |

## Économie

- L’enseignant paie l’abonnement Yekola en π ; l’apprenant achète les cours en π. 1 π = 1 000 FC.
- Commission selon le plan enseignant ; pack hors ligne après paiement.

## Connexion

Sur **pi-test** ( et Sandbox local ) : **Continuer avec Pi** uniquement (`NEXT_PUBLIC_PI_SANDBOX=1`).

## Checklist

1. [Console Yekola Staging](https://developers.minepi.com/devconsole/my-apps/6aff5974b28a33a0faf0d9d3) → `frontend_url` = `https://pi-test.mcbuleli.com`
2. Clés Testnet dans `web/.env.pi-test` sur le VPS (voir `.env.pi-test.example`)
3. Vérif : https://pi-test.mcbuleli.com/api/pi/payments → `configured`, `sandbox: true`
4. Hackathon : [inscription](https://developers.minepi.com/hackathon/register), 3 cours EN, vidéo ≤ 3 min
5. Plus tard : app Pi **Production** + `web/.env.production` sur yekola.mcbuleli.com