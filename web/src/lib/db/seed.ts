import { hashPassword, newId } from "@/lib/auth/crypto";
import type { Academy, Course, DbShape, User } from "@/lib/types";

export const SEED_VERSION = 8;
const DEMO_PASSWORD = "yekola2026";

export function buildSeed(): DbShape {
  const now = new Date().toISOString();
  const adminId = newId("usr");
  const teacherId = newId("usr");
  const learnerId = newId("usr");
  const academyId = newId("acd");

  const admin: User = {
    id: adminId,
    email: "jeff@yekola.demo",
    name: "Jeff Buleli",
    role: "admin",
    passwordHash: hashPassword(DEMO_PASSWORD),
    academyId: null,
    createdAt: now,
    emailVerifiedAt: now,
    emailVerifyTokenHash: null,
    emailVerifyExpiresAt: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  };

  const teacher: User = {
    id: teacherId,
    email: "patty@yekola.demo",
    name: "Patty Basoga",
    role: "teacher",
    passwordHash: hashPassword(DEMO_PASSWORD),
    academyId,
    createdAt: now,
    emailVerifiedAt: now,
    emailVerifyTokenHash: null,
    emailVerifyExpiresAt: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  };

  const learner: User = {
    id: learnerId,
    email: "dan@yekola.demo",
    name: "Dan Muyumbu",
    role: "learner",
    passwordHash: hashPassword(DEMO_PASSWORD),
    academyId: null,
    createdAt: now,
    emailVerifiedAt: now,
    emailVerifyTokenHash: null,
    emailVerifyExpiresAt: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  };

  const academy: Academy = {
    id: academyId,
    slug: "academie-patty",
    name: "Académie Patty",
    ownerId: teacherId,
    city: "Kinshasa",
    bio: "Formations pratiques pour entrepreneurs et jeunes motivés.",
    planId: "free",
    subscriptionStatus: "active",
    subscriptionExpiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
    walletBalanceCdf: 5000,
    createdAt: now,
  };

  const courseWeb: Course = {
    id: newId("crs"),
    academyId,
    slug: "developpeur-web-moderne",
    title: "Développement Web Moderne",
    tagline: "Du HTML au premier site pour une PME de Kinshasa",
    description:
      "Parcours complet en 4 modules : culture numérique, HTML/CSS, JavaScript, puis mise en ligne et maintenance. Chaque module se termine par un quiz. Pack hors ligne disponible après achat.",
    priceCdf: 1000,
    currency: "CDF",
    status: "published",
    reviewNote: null,
    reviewedAt: now,
    reviewedBy: adminId,
    coverIcon: "code",
    coverImage: "/covers/web.png",
    liveRequired: false,
    liveSessions: [],
    createdAt: now,
    updatedAt: now,
    modules: [
      {
        id: "web-m1",
        title: "Culture numérique",
        summary: "Internet, data, sécurité et métier du web en RDC.",
        order: 1,
        lessons: [
          {
            id: "web-l1-1",
            title: "Internet et smartphone en RDC",
            minutes: 12,
            order: 1,
            media: [],
            body: `## Bienvenue

Comprenez comment Internet arrive sur un téléphone en RDC (3G/4G, Wi-Fi cybercafé, forfait data).

### À retenir
- Un site consomme de la data : images lourdes = facture élevée.
- Hors ligne, vous pouvez revoir ce texte si vous avez téléchargé le pack.
- Objectif du parcours : publier une page utile pour une petite entreprise.`,
          },
          {
            id: "web-l1-2",
            title: "Sécurité de base",
            minutes: 10,
            order: 2,
            media: [],
            body: `## Sécurité au quotidien

- Mot de passe unique par service (gestionnaire recommandé).
- Ne partagez jamais vos codes Mobile Money ni OTP.
- Mettez à jour le navigateur quand c'est possible.
- Méfiez-vous des liens « promotion » reçus par SMS.`,
          },
          {
            id: "web-l1-3",
            title: "Qui fait quoi sur un projet web ?",
            minutes: 11,
            order: 3,
            media: [],
            body: `## Rôles

- **Client** : valide le besoin (menu, WhatsApp, horaires).
- **Designer** : maquette et lisibilité mobile.
- **Développeur** : HTML, CSS, JS, hébergement.
- **Vous** : dans ce cours, vous jouez les trois premiers rôles pour une PME.`,
          },
        ],
        quiz: [
          {
            id: "web-q1a",
            prompt: "Pourquoi compresser les images d'un site ?",
            choices: [
              "Pour que le site soit plus beau",
              "Pour réduire la data et accélérer le chargement",
              "Parce que Google l'exige toujours",
              "Ce n'est jamais utile",
            ],
            correctIndex: 1,
            explanation: "Moins de poids = moins de data et un site plus rapide, surtout en 3G.",
          },
          {
            id: "web-q1b",
            prompt: "Que faire si on vous demande votre code OTP Mobile Money ?",
            choices: [
              "Le partager pour « valider une offre »",
              "Ne jamais le partager",
              "L'envoyer seulement à un ami",
              "Le publier sur WhatsApp",
            ],
            correctIndex: 1,
            explanation: "L'OTP est secret. Personne de légitime ne vous le demande.",
          },
        ],
      },
      {
        id: "web-m2",
        title: "HTML & CSS",
        summary: "Structurer et styliser une page PME mobile-first.",
        order: 2,
        lessons: [
          {
            id: "web-l2-1",
            title: "Structure HTML d'une page PME",
            minutes: 18,
            order: 1,
            media: [],
            body: `## HTML sémantique

Utilisez \`header\`, \`main\`, \`footer\`. Un titre clair, un numéro WhatsApp, un bouton « Commander ».

### Mini-exercice
Listez 5 infos que votre client veut voir en moins de 5 secondes sur mobile.`,
          },
          {
            id: "web-l2-2",
            title: "CSS responsive simple",
            minutes: 16,
            order: 2,
            media: [],
            body: `## Mobile-first

- Commencez par le petit écran, puis élargissez.
- \`max-width\` sur le contenu (ex. 40rem).
- Boutons d'au moins 44 px de haut pour le pouce.
- Contraste texte / fond lisible en plein soleil.`,
          },
          {
            id: "web-l2-3",
            title: "Typographie et couleurs locales",
            minutes: 12,
            order: 3,
            media: [],
            body: `## Identité

Choisissez 2 couleurs max + une police lisible. Évitez le texte gris trop pâle.

### Astuce
Testez la page sur un vrai téléphone Android entrée de gamme.`,
          },
        ],
        quiz: [
          {
            id: "web-q2a",
            prompt: "Quelle balise contient le contenu principal ?",
            choices: ["div", "main", "script", "meta"],
            correctIndex: 1,
            explanation: "main marque le contenu principal de la page.",
          },
          {
            id: "web-q2b",
            prompt: "Pourquoi viser d'abord le mobile ?",
            choices: [
              "Parce que les ordinateurs n'existent plus",
              "Parce que la plupart des clients consultent sur téléphone",
              "Parce que CSS n'existe que sur mobile",
              "Parce que Google l'interdit sur desktop",
            ],
            correctIndex: 1,
            explanation: "En Afrique urbaine, le trafic web est largement mobile.",
          },
        ],
      },
      {
        id: "web-m3",
        title: "JavaScript utile",
        summary: "Fonctions, validation de formulaires, feedback utilisateur.",
        order: 3,
        lessons: [
          {
            id: "web-l3-1",
            title: "Fonctions et événements",
            minutes: 18,
            order: 1,
            media: [],
            body: `## Fonctions

Une fonction regroupe une action réutilisable.

Exemple : au clic sur « Commander », vérifier le numéro puis ouvrir WhatsApp.`,
          },
          {
            id: "web-l3-2",
            title: "Valider un formulaire commande",
            minutes: 20,
            order: 2,
            media: [],
            body: `## Validation

- Nom non vide.
- Téléphone ≥ 9 chiffres.
- Message d'erreur clair en français.

Exercice : validez qu'un numéro a au moins 9 chiffres avant d'envoyer.`,
          },
          {
            id: "web-l3-3",
            title: "Messages de succès et d'erreur",
            minutes: 10,
            order: 3,
            media: [],
            body: `## UX

Confirmez toujours l'action (« Commande prête à envoyer »). En cas d'erreur, dites quoi corriger.`,
          },
        ],
        quiz: [
          {
            id: "web-q3a",
            prompt: "À quoi sert une fonction en JavaScript ?",
            choices: [
              "Stocker une image",
              "Regrouper une action réutilisable",
              "Remplacer le HTML",
              "Payer en Mobile Money",
            ],
            correctIndex: 1,
            explanation: "Les fonctions encapsulent une logique réutilisable.",
          },
          {
            id: "web-q3b",
            prompt: "Que faire si le téléphone saisi est trop court ?",
            choices: [
              "Envoyer quand même",
              "Afficher une erreur claire et bloquer l'envoi",
              "Effacer tout le formulaire",
              "Redémarrer le téléphone",
            ],
            correctIndex: 1,
            explanation: "La validation empêche les commandes inutilisables.",
          },
        ],
      },
      {
        id: "web-m4",
        title: "Mise en ligne",
        summary: "Hébergement simple, nom de domaine, checklist de livraison.",
        order: 4,
        lessons: [
          {
            id: "web-l4-1",
            title: "Choisir un hébergement",
            minutes: 14,
            order: 1,
            media: [],
            body: `## Héberger

Pages statiques : Netlify, GitHub Pages, ou hébergeur local. Gardez une copie hors ligne du site livré.`,
          },
          {
            id: "web-l4-2",
            title: "Checklist avant de livrer au client",
            minutes: 12,
            order: 2,
            media: [],
            body: `## Checklist

1. Liens WhatsApp et téléphone testés.
2. Images compressées.
3. Titre et description de la page renseignés.
4. Affichage OK sur un téléphone réel.
5. Mot de passe d'admin stocké hors ligne (si applicable).`,
          },
        ],
        quiz: [
          {
            id: "web-q4a",
            prompt: "Avant de livrer, que faut-il tester en priorité ?",
            choices: [
              "Uniquement le logo",
              "Liens de contact et affichage mobile",
              "La musique de fond",
              "Le dark mode uniquement",
            ],
            correctIndex: 1,
            explanation: "Contact + mobile = le cœur d'une page PME.",
          },
        ],
      },
    ],
  };

  const courseMomo: Course = {
    id: newId("crs"),
    academyId,
    slug: "mobile-money-pour-commerces",
    title: "Mobile Money pour commerces",
    tagline: "Encaisser, suivre et réconcilier les paiements au quotidien",
    description:
      "Trois modules pour boutiques et services : ouvrir un compte marchand, encaisser sans erreur, puis réconcilier le soir. Inclut quiz et pack hors ligne.",
    priceCdf: 500,
    currency: "CDF",
    status: "published",
    reviewNote: null,
    reviewedAt: now,
    reviewedBy: adminId,
    coverIcon: "wallet",
    coverImage: "/covers/momo.png",
    liveRequired: false,
    liveSessions: [],
    createdAt: now,
    updatedAt: now,
    modules: [
      {
        id: "mm-m1",
        title: "Bases MoMo",
        summary: "Comptes marchands, opérateurs et sécurité.",
        order: 1,
        lessons: [
          {
            id: "mm-l1-1",
            title: "Ouvrir et sécuriser un compte marchand",
            minutes: 14,
            order: 1,
            media: [],
            body: `## Compte marchand

Séparez le téléphone business du téléphone personnel. Notez chaque encaissement dans un carnet ou une feuille.

### Règles
- PIN connu de vous seul.
- Pas de partage d'OTP.
- Sauvegarde des reçus (SMS / capture).`,
          },
          {
            id: "mm-l1-2",
            title: "Orange, Airtel, M-Pesa : quoi savoir",
            minutes: 12,
            order: 2,
            media: [],
            body: `## Opérateurs

Chaque opérateur a ses frais et plafonds. Affichez clairement les numéros acceptés près de la caisse.`,
          },
          {
            id: "mm-l1-3",
            title: "Fraudes courantes à éviter",
            minutes: 13,
            order: 3,
            media: [],
            body: `## Vigilance

- Faux « agents » qui appellent pour un « remboursement ».
- Captures d'écran falsifiées.
- Double paiement réclamé sans vérifier le SMS opérateur.`,
          },
        ],
        quiz: [
          {
            id: "mm-q1a",
            prompt: "Pourquoi séparer téléphone personnel et business ?",
            choices: [
              "Pour la mode",
              "Pour limiter les risques et clarifier la compta",
              "Ce n'est pas recommandé",
              "Parce que c'est gratuit",
            ],
            correctIndex: 1,
            explanation: "Séparation = moins de risque et une comptabilité plus claire.",
          },
          {
            id: "mm-q1b",
            prompt: "Une capture d'écran suffit-elle comme preuve de paiement ?",
            choices: [
              "Toujours",
              "Non, vérifier aussi le SMS / solde opérateur",
              "Oui si le client sourit",
              "Uniquement le dimanche",
            ],
            correctIndex: 1,
            explanation: "Les captures peuvent être falsifiées. Confirmez côté opérateur.",
          },
        ],
      },
      {
        id: "mm-m2",
        title: "Encaisser sans erreur",
        summary: "Processus caisse, montants, confirmations.",
        order: 2,
        lessons: [
          {
            id: "mm-l2-1",
            title: "Parcours client à la caisse",
            minutes: 15,
            order: 1,
            media: [],
            body: `## Étapes

1. Annoncer le montant à voix haute.
2. Indiquer le numéro marchand.
3. Attendre le SMS / notification.
4. Remettre le bien ou le reçu.`,
          },
          {
            id: "mm-l2-2",
            title: "Gérer un paiement en attente",
            minutes: 12,
            order: 2,
            media: [],
            body: `## En attente

Ne livrez pas avant confirmation. Notez le nom du client et l'heure. Relancez calmement après 2-3 minutes.`,
          },
          {
            id: "mm-l2-3",
            title: "Remboursements et erreurs de montant",
            minutes: 14,
            order: 3,
            media: [],
            body: `## Corrections

Documentez chaque remboursement. Préférez le même canal (même opérateur) pour tracer.`,
          },
        ],
        quiz: [
          {
            id: "mm-q2a",
            prompt: "Quand livrer la marchandise ?",
            choices: [
              "Dès que le client dit « j'ai payé »",
              "Après confirmation opérateur / SMS",
              "Le lendemain",
              "Jamais",
            ],
            correctIndex: 1,
            explanation: "La confirmation opérateur protège le commerçant.",
          },
          {
            id: "mm-q2b",
            prompt: "Que faire si le montant reçu est trop bas ?",
            choices: [
              "Ignorer",
              "Ne pas livrer tant que l'écart n'est pas réglé",
              "Offrir un cadeau",
              "Fermer la boutique",
            ],
            correctIndex: 1,
            explanation: "Protégez la marge : réglez l'écart avant livraison.",
          },
        ],
      },
      {
        id: "mm-m3",
        title: "Réconciliation du soir",
        summary: "Cahier de caisse, écarts, rapport simple.",
        order: 3,
        lessons: [
          {
            id: "mm-l3-1",
            title: "Tenir un cahier de caisse MoMo",
            minutes: 16,
            order: 1,
            media: [],
            body: `## Colonnes utiles

Date | Heure | Client | Opérateur | Montant | Réf SMS | Remarque

Totalisez le soir et comparez au solde affiché.`,
          },
          {
            id: "mm-l3-2",
            title: "Trouver un écart rapidement",
            minutes: 14,
            order: 2,
            media: [],
            body: `## Méthode

1. Comparez le total du cahier et le solde.
2. Relisez les SMS du jour.
3. Isolez les doublons et les annulations.`,
          },
          {
            id: "mm-l3-3",
            title: "Rapport hebdo pour le patron",
            minutes: 10,
            order: 3,
            media: [],
            body: `## Synthèse

Volumes par opérateur, frais estimés, incidents. Une demi-page suffit.`,
          },
        ],
        quiz: [
          {
            id: "mm-q3a",
            prompt: "À quoi sert la réconciliation du soir ?",
            choices: [
              "À décorer le cahier",
              "À détecter écarts et fraudes tôt",
              "À remplacer les impôts",
              "À changer d'opérateur",
            ],
            correctIndex: 1,
            explanation: "Plus tôt vous voyez l'écart, plus il est facile à corriger.",
          },
        ],
      },
    ],
  };

  const courseFp: Course = {
    id: newId("crs"),
    academyId,
    slug: "electricite-base-apprentis",
    title: "Électricité de base pour apprentis",
    tagline: "Sécurité, circuits simples et premiers dépannages en atelier",
    description:
      "Parcours formation professionnelle : sécurité électrique, outils, circuits simples et bonnes pratiques atelier. Conçu pour apprentis en zone à faible connectivité - pack hors ligne après achat.",
    priceCdf: 800,
    currency: "CDF",
    status: "published",
    reviewNote: null,
    reviewedAt: now,
    reviewedBy: adminId,
    coverIcon: "book",
    coverImage: "/covers/electric.png",
    liveRequired: true,
    liveSessions: [
      {
        id: "live-el-1",
        title: "Atelier pratique - sécurité",
        startsAt: new Date(Date.now() + 3 * 864e5).toISOString(),
        durationMin: 60,
        required: true,
        
      },
    ],
    createdAt: now,
    updatedAt: now,
    modules: [
      {
        id: "el-m1",
        title: "Sécurité en atelier",
        summary: "EPI, coupures et gestes qui sauvent.",
        order: 1,
        lessons: [
          {
            id: "el-l1-1",
            title: "Équipements de protection",
            minutes: 12,
            order: 1,
            media: [],
            body: `## EPI obligatoire

- Chaussures isolantes, gants adaptés, lunettes.
- Ne travaillez jamais seul sur une installation sous tension.
- Signalez la zone de travail aux collègues.

### Hors ligne
Ce module reste lisible après téléchargement du pack, même sans 3G.`,
          },
          {
            id: "el-l1-2",
            title: "Couper et vérifier l'alimentation",
            minutes: 14,
            order: 2,
            media: [],
            body: `## Avant toute intervention

1. Identifier le disjoncteur concerné.
2. Couper.
3. Vérifier l'absence de tension avec un testeur.
4. Étiqueter « Travaux en cours ».`,
          },
          {
            id: "el-l1-3",
            title: "Gestes d'urgence",
            minutes: 10,
            order: 3,
            media: [],
            body: `## Si accident

- Couper l'alimentation si possible sans vous exposer.
- Appeler les secours / responsable atelier.
- Ne jamais toucher une victime encore en contact avec le courant.`,
          },
        ],
        quiz: [
          {
            id: "el-q1a",
            prompt: "Que faire avant d'ouvrir un tableau électrique ?",
            choices: [
              "Commencer tout de suite",
              "Couper et vérifier l'absence de tension",
              "Demander à un ami de filmer",
              "Mouiller les mains",
            ],
            correctIndex: 1,
            explanation: "Sécurité : couper + vérifier.",
          },
          {
            id: "el-q1b",
            prompt: "Pourquoi les EPI ?",
            choices: [
              "Pour la mode",
              "Pour réduire le risque de blessure et d'électrisation",
              "Ce n'est jamais utile",
              "Uniquement le dimanche",
            ],
            correctIndex: 1,
            explanation: "Les EPI protègent l'apprenti en atelier.",
          },
        ],
      },
      {
        id: "el-m2",
        title: "Circuits simples",
        summary: "Lampe, interrupteur, continuité.",
        order: 2,
        lessons: [
          {
            id: "el-l2-1",
            title: "Schéma lampe + interrupteur",
            minutes: 16,
            order: 1,
            media: [],
            body: `## Circuit de base

Phase → interrupteur → lampe → neutre.  
Comprenez le rôle de chaque fil avant de câbler.`,
          },
          {
            id: "el-l2-2",
            title: "Tester la continuité",
            minutes: 14,
            order: 2,
            media: [],
            body: `## Multimètre

- Mode continuité / ohmmètre.
- Vérifiez les connexions une par une.
- Notez vos mesures dans le carnet d'atelier.`,
          },
          {
            id: "el-l2-3",
            title: "Erreurs fréquentes des débutants",
            minutes: 12,
            order: 3,
            media: [],
            body: `## À éviter

- Neutre et phase inversés.
- Serrage insuffisant des bornes.
- Oublier la terre sur les appareils concernés.`,
          },
        ],
        quiz: [
          {
            id: "el-q2a",
            prompt: "Dans un circuit lampe simple, l'interrupteur coupe généralement :",
            choices: ["Le neutre uniquement", "La phase", "La terre", "Rien"],
            correctIndex: 1,
            explanation: "On coupe la phase pour isoler la charge.",
          },
          {
            id: "el-q2b",
            prompt: "À quoi sert le test de continuité ?",
            choices: [
              "À décorer le tableau",
              "À vérifier qu'un chemin électrique est bien fermé",
              "À augmenter la tension",
              "À payer le MoMo",
            ],
            correctIndex: 1,
            explanation: "La continuité confirme le câblage.",
          },
        ],
      },
      {
        id: "el-m3",
        title: "Dépannage de base",
        summary: "Diagnostiquer sans aggraver.",
        order: 3,
        lessons: [
          {
            id: "el-l3-1",
            title: "Méthode : observer, isoler, tester",
            minutes: 12,
            order: 1,
            media: [],
            body: `## Diagnostic

1. Que faisait le client / l'atelier juste avant la panne ?
2. Isoler la zone.
3. Tester du général vers le particulier.`,
          },
          {
            id: "el-l3-2",
            title: "Disjoncteur qui saute",
            minutes: 14,
            order: 2,
            media: [],
            body: `## Surcharge ou défaut

- Débrancher les charges.
- Remettre le disjoncteur.
- Reconnecter une par une pour trouver le fautif.`,
          },
          {
            id: "el-l3-3",
            title: "Quand appeler un senior",
            minutes: 8,
            order: 3,
            media: [],
            body: `## Limites de l'apprenti

Haute tension, incendie, odeur de brûlé persistante, doute sur le schéma : stop et escalade.`,
          },
        ],
        quiz: [
          {
            id: "el-q3a",
            prompt: "Un disjoncteur saute en boucle. Que faire d'abord ?",
            choices: [
              "Forcer le levier",
              "Débrancher les charges et isoler",
              "Ignorer",
              "Doubler le calibre sans analyse",
            ],
            correctIndex: 1,
            explanation: "Isoler puis diagnostiquer.",
          },
        ],
      },
    ],
  };

  const coursePending: Course = {
    id: newId("crs"),
    academyId,
    slug: "soudure-intro-brouillon",
    title: "Soudure - introduction (brouillon)",
    tagline: "En attente de validation admin",
    description: "Module FP soumis pour contrôle qualité avant publication publique.",
    priceCdf: 600,
    currency: "CDF",
    status: "pending_review",
    reviewNote: null,
    reviewedAt: null,
    reviewedBy: null,
    coverIcon: "store",
    coverImage: "/covers/weld.png",
    liveRequired: false,
    liveSessions: [],
    createdAt: now,
    updatedAt: now,
    modules: [
      {
        id: "su-m1",
        title: "Sécurité soudure",
        summary: "EPI et zone de travail.",
        order: 1,
        lessons: [
          {
            id: "su-l1",
            title: "Équipements de protection",
            minutes: 10,
            order: 1,
            media: [],
            body: `## EPI\n\nMasque, gants, tablier. Zone ventilée. Jamais sans supervision en atelier.`,
          },
        ],
        quiz: [
          {
            id: "su-q1",
            prompt: "Que faire avant d’allumer un poste de soudure ?",
            choices: ["Rien", "Vérifier EPI et zone", "Appeler un ami", "Couper toute électricité du quartier"],
            correctIndex: 1,
            explanation: "Sécurité d’abord.",
          },
        ],
      },
    ],
  };

  return {
    seedVersion: SEED_VERSION,
    users: [admin, teacher, learner],
    academies: [academy],
    courses: [courseWeb, courseMomo, courseFp, coursePending],
    enrollments: [],
    progress: [],
    certificates: [],
    walletTx: [
      {
        id: newId("wtx"),
        academyId,
        type: "sale",
        amountCdf: 5000,
        description: "Solde initial démo",
        reference: "SEED",
        createdAt: now,
      },
    ],
    subscriptions: [],
    payments: [],
    syncAccepted: [],
  };
}
