# Yekola — Pi Next (état actuel)

Dernière mise à jour infra : 2026-11-20

## URLs

| Environnement | URL |
|---------------|-----|
| **Testnet (hackathon)** | https://pi-test.mcbuleli.com |
| **Mainnet (plus tard)** | https://yekola.mcbuleli.com |
| Sandbox navigateur | https://sandbox.minepi.com/mobile-app-ui/app/yekola-u9r1 |
| Pi Developers | https://developers.minepi.com/devconsole/my-apps/6aff5974b28a33a0faf0d9d3 |

Domaine **pi-test** validé (`/validation-key.txt`).

## Connexion

Sur **pi-test** : **Continuer avec Pi** (Pioneer uniquement).  
Sur **yekola** (mainnet) : email / mot de passe jusqu’à l’app Pi Production.

## Fait côté technique

- [x] App Staging Yekola (testnet)
- [x] Login + paiements Pi (U2A cours + abo enseignant)
- [x] Deploy VPS double instance (:3015 / :3016)
- [x] `pi-test.mcbuleli.com` + HTTPS + clé domaine

## Suite équipe (priorité hackathon)

1. **Pi Browser** : https://pi-test.mcbuleli.com → Pioneer → acheter un cours test (Test π).
2. **Console** : onglet Hackathon — inscrire **tous** les membres ; [register](https://developers.minepi.com/hackathon/register).
3. **Contenu EN** : au moins **3 cours publiés en anglais** (titres, descriptions, 1ère leçon utile).
4. **Listing Pi** : logo, description EN, captures, politique de confidentialité (URL publique).
5. **Vidéo ≤ 3 min** (EN) : problème, démo Pi login + paiement + offline, équipe.

## Deploy

```bash
bash ops/vps/deploy-app.sh
```

Secrets : `web/.env.pi-test` sur le serveur (non versionné).