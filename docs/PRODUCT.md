# Yekola — SaaS créateurs + apprentissage offline

**Slogan :** Créez. Vendez. Apprenez — même hors ligne.  
**Domaine :** https://yekola.mcbuleli.com  
**Repo :** Jeffbuleli/Yekola

---

## 1. Problème

Les formateurs en Afrique veulent vendre leurs formations en ligne (Mobile Money), sans être développeurs.  
Les apprenants veulent acheter un cours et continuer à apprendre quand le réseau tombe.

---

## 2. Solution

**Yekola** est une plateforme multi-tenant où :

1. **L’enseignant** paie un **abonnement mensuel** pour publier et gérer son académie.
2. **L’apprenant** **achète chaque cours** pour y accéder.
3. Après achat, l’apprenant peut **télécharger le pack** et apprendre **hors ligne**, puis synchroniser sa progression au reconnect.

```
Enseignant → Abonnement → Académie (tenant)
                          └─ Cours publiés (prix, modules, quiz)
Apprenant  → Achat cours → Accès + pack offline + progression
```

---

## 3. Qui paie quoi

| Acteur | Paiement | Contrepartie |
|--------|----------|--------------|
| Enseignant / académie | Abonnement mensuel | Publier des cours, encaisser les ventes |
| Apprenant | Prix du cours (une fois) | Accès + téléchargement offline |
| Plateforme | Commission sur ventes (selon plan) | Hébergement, paiements, sync |

### Grille abonnements enseignants (test MoMo — FC)

| Plan | Prix / mois | Cours actifs | Apprenants | Commission ventes |
|------|-------------|--------------|------------|-------------------|
| **Free** | **0 FC** | 1 | 15 | 20 % |
| **Base** | **1 000 FC** | 3 | 50 | 10 % |
| **Pro** | **1 500 FC** | 10 | 200 | 5 % |
| **Max** | **2 000 FC** | Illimité | Illimité | 0 % |

---

## 4. Différenciateur

**Offline après achat** : le contenu acheté reste utilisable sans Internet (leçons, quiz, file de sync).  
Ce n’est pas un simple PDF : progression, quiz et sync au retour du réseau.

---

## 5. Rôles

- `teacher` — propriétaire d’une académie, abonnement, studio, wallet
- `learner` — catalogue, achat, mes cours, offline
- `admin` — ops plateforme

---

## Modules produit

### MVP
- Landing + tarifs enseignants (FC)
- Auth + académie (tenant)
- Studio cours, catalogue, achat
- Pack hors ligne post-achat + sync
- Wallet enseignant + Mobile Money (démo / PawaPay)
- Certificats vérifiables `/verify/{code}`
- Analytics enseignant (ventes, progression, certificats)
- Meet audio optionnel (McBuleli Live) par cours
- IA opt-in (tuteur apprenant + assistant studio)

### Suite
- Branding académie (logo, couleurs)
- Coupons / codes promo
- Domaine personnalisé (plan Max)

---

## 7. Architecture (résumé)

```
yekola.mcbuleli.com
  ├─ /                 landing
  ├─ /catalog          cours publics
  ├─ /studio           enseignant
  ├─ /learn            apprenant (achetés + offline)
  ├─ /verify/[code]    certificats
  └─ API               auth, courses, payments, sync, offline packs
```

Hébergement : VPS `162.35.181.98` — voir `ops/HOST.md`.

---

## 8. Pitch (30 s)

> Sur Yekola, les formateurs s’abonnent pour publier leurs cours et encaisser via Mobile Money.  
> Les apprenants achètent un cours et peuvent l’apprendre hors ligne après l’achat.  
> *Créez. Vendez. Apprenez — même hors ligne.*
