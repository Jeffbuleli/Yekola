# Yekola — état produit

Date: 2026-09-24

## Connexion (Sandbox / Pi Next)

Avec `NEXT_PUBLIC_PI_SANDBOX=1`, **seule la connexion Pioneer** (SDK Pi) est proposée. Pas d’email / mot de passe dans le Sandbox.

| Contexte | Accès |
|----------|--------|
| Pioneer (Sandbox) | **Continuer avec Pi** → catalogue, achat cours en Test Pi |
| Staging local prod | Comptes démo `*@yekola.demo` / `yekola2026` (si sandbox désactivé) |

## Navigation par rôle

- Visiteur : Catalogue, Tarifs enseignants
- Apprenant : Catalogue, Mes cours
- Enseignant : Studio, Tarifs, Catalogue
- Admin : Modération, Catalogue

## Phases

0–4 livrées (SaaS, offline, MoMo, certificats, Meet, IA).  
Validation admin des cours avant public.

## Deploy

```bash
bash ops/vps/deploy-app.sh
```
