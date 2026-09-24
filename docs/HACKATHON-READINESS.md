# Yekola — état produit

Date: 2026-09-24

## Comptes démo (mot de passe `yekola2026`)

| Rôle | Compte | Accès |
|------|--------|--------|
| Apprenant | `dan@yekola.demo` | Catalogue, Mes cours, achat |
| Enseignant | `patty@yekola.demo` | Studio, Tarifs, Catalogue (pas d’achat de ses cours) |
| Admin | `jeff@yekola.demo` | Modération (valider avant publication) |

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
