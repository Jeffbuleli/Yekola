# Yekola - école virtuelle offline-first (SaaS multi-tenant)

**Slogan :** Yekola partout. Même sans Internet.  
**Domaine :** https://yekola.mcbuleli.com  
**Repo :** Jeffbuleli/Yekola

---

## 1. Problème réel

En zones rurales et en zones touchées par la guerre (Est RDC, déplacements, coupures) :

- Les centres TVET / écoles / ONG **perdent la continuité pédagogique** dès que le réseau tombe.
- Les jeunes en formation pro n’ont pas une **école**, seulement des PDF ou WhatsApp dispersés.
- Les formateurs ne peuvent pas **suivre, noter, faire des TP, valider** sans être en ligne en permanence.
- Les LMS occidentaux (Moodle lourd) ou shops de cours (Ansella) **ne sont pas conçus offline-first**.
- Kolibri résout l’offline K-12/OER, mais **pas** l’école professionnelle multi-tenant + Meet + MoMo + parcours métier.

**Persona primaire :** un centre de formation / école / ONG qui doit faire apprendre 30–200 jeunes avec 1 hotspot intermittent.

---

## 2. Solution - pas un downloader de PDF

**Yekola = école virtuelle structurée**, multi-tenant, offline-capable.

L’unité n’est pas le « fichier téléchargé », c’est le **parcours d’enseignement** :

```
Parcours → Modules → Séances
  ├─ Cours (texte + audio compressé + media pack)
  ├─ DT (devoirs dirigés)
  ├─ TP (travaux pratiques / preuves terrain)
  ├─ Exercices & quiz (sync différée)
  ├─ Chat de classe (file offline → push au reconnect)
  └─ Meet (McBuleli Live / audio-first quand le réseau revient)
```

### Ce qu’on refuse
- Page = liste de PDF
- Clone McBuleli Academy (crypto / live trading / UI fintech)
- « Offline » = bouton Installer PWA sans pack de contenu

### Ce qu’on affirme
- **Pedagogie scolaire** : emploi du temps, classes, formateur, notes, présence
- **Offline-first** : pack de parcours + sync progress (inspiré Kolibri, UX moderne)
- **SaaS multi-tenant** : chaque école / ONG = tenant (inspiré Moodle Workplace)
- **Monétisation Afrique** : abonnement centre + MoMo (inspiré Ansella, sans être un shop créateur)

---

## 3. Positionnement vs concurrents

| | Ansella | Kolibri | Moodle / Workplace | **Yekola** |
|--|---------|---------|----------------------|------------|
| Cœur | Vendre des cours en ligne | Offline K-12 / OER | LMS généraliste | **École virtuelle TVET / crise** |
| Offline | Non | Excellent | App partielle | **Pack parcours + sync (cible)** |
| Multi-tenant | Soft (académies créateurs) | Facilities | Workplace oui | **SaaS écoles / ONG** |
| Live / Meet | Faible | Non | BBB / plugins | **McBuleli Meet (audio-first)** |
| MoMo | Excellent | Non | Plugins | **Natif (via stack McBuleli)** |
| UI | Shop / dashboard ventes | Coach K-12 | Admin lourd | **Classe + parcours (moderne)** |

**Différence jury :** on n’invente pas l’offline (Kolibri le fait), ni le MoMo (Ansella le fait), ni les tenants (Workplace).  
On **compose** une école pro pour RDC/crise : parcours + DT/TP + Meet + chat + credential + SaaS.

---

## 4. Business model (SaaS multi-tenant)

### Qui paie
1. **Centres / écoles / ONG** (B2B) - abonnement mensuel / annuel par tenant  
2. **Ministères / bailleurs / projets** - licences multi-sites (hubs)  
3. Optionnel plus tard : **apprenant individuel** (B2C) sur catalogue public

### Grille cible (indicatif)

| Plan | Pour qui | Inclus | Prix indicatif |
|------|----------|--------|----------------|
| **Pilot** | 1 centre, ≤50 apprenants | 1 tenant, packs offline, quiz, chat | Gratuit 90 j / puis ~$29/mois |
| **École** | Centre TVET / secondaire | ≤300 apprenants, Meet, DT/TP, badges | ~$99–149/mois |
| **Réseau** | ONG multi-sites / province | Multi-tenant, hub sync USB, reporting | ~$399+/mois ou contrat projet |
| **Usage** | Contenu premium partenaires | Commission MoMo 5–10 % (option) | Variable |

### Unit economics (jury)
- Coût data bas = audio-first + packs Mo mesurés  
- 1 formateur × N élèves = valeur claire  
- Offline réduit le churn « ça ne marche pas en province »

---

## 5. Produit - modules (MVP → V1)

### MVP (jury / demo)
1. Tenant « Centre Yekola Démo »
2. 1 parcours formation pro (4–6 modules) - **pas crypto**
3. Lecture offline (pack) + quiz + sync
4. DT + TP (soumission texte/photo, sync)
5. Chat classe (async)
6. Meet audio-only (lien McBuleli Live)
7. Badge / attestation de fin de parcours
8. Dashboard formateur : qui est bloqué où

### V1
- Multi-tenant branding
- Hub USB / partage Wi‑Fi local (mode Kolibri-like)
- Catalogue de parcours partenaires
- Facturation MoMo abonnement
- Rôles : admin tenant, formateur, apprenant, tuteur centre

### Hors scope volontaire
- Marketplace créateurs type Ansella (concurrence frontale inutile au début)
- SCORM complet
- App native lourde (PWA suffit d’abord)

---

## 6. UI - inspirations (sans cloner)

| Source | On emprunte | On évite |
|--------|-------------|----------|
| **Kolibri** | Statut offline/sync visible ; vue coach live progress | Look K-12 / interface datée |
| **Moodle Workplace** | Programmes ordonnés, tenants, certifications | Usine à plugins, UI admin |
| **Ansella** | Checkout MoMo primaire | Logique « vendre un cours » seule |
| **McBuleli Academy** | Meet low-bandwidth, badges, wallet | UI fintech / thèmes crypto / overlay offline bloquant |

**Langage UI Yekola :** Classe · Parcours · Séance · DT · TP · Présence · Sync - pas « Edition / Enrollment / Wallet ».

---

## 7. Architecture cible (résumé)

```
yekola.mcbuleli.com (SaaS)
  ├─ tenants (écoles)
  ├─ packs (manifest + media) → Cache/IndexedDB
  ├─ sync queue (progress, DT, TP, chat)
  └─ Meet → live.mcbuleli.org (rooms yekola-*)
```

Hébergement : VPS principal `162.35.181.98` - voir `ops/HOST.md`.

---

## 8. Pitch différenciant (30 s)

> Ansella vend des cours en ligne. Kolibri fait de l’offline scolaire. Moodle est un LMS généraliste.  
> **Yekola est l’école virtuelle** pour la formation pro en zones à faible connectivité et en contexte de crise : parcours structurés, DT/TP, Meet audio, chat, sync hors-ligne - en SaaS multi-tenant pour centres et ONG.  
> *Yekola partout. Même sans Internet.*
