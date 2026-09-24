import { hashPassword, newId } from "@/lib/auth/crypto";
import type { Academy, Course, DbShape, User } from "@/lib/types";

export const SEED_VERSION = 4;
const DEMO_PASSWORD = "yekola2026";

export function buildSeed(): DbShape {
  const now = new Date().toISOString();
  const teacherId = newId("usr");
  const learnerId = newId("usr");
  const academyId = newId("acd");

  const teacher: User = {
    id: teacherId,
    email: "jeff@yekola.demo",
    name: "Jeff Buleli",
    role: "teacher",
    passwordHash: hashPassword(DEMO_PASSWORD),
    academyId,
    createdAt: now,
  };

  const learner: User = {
    id: learnerId,
    email: "patty@yekola.demo",
    name: "Patty Basoga",
    role: "learner",
    passwordHash: hashPassword(DEMO_PASSWORD),
    academyId: null,
    createdAt: now,
  };

  const academy: Academy = {
    id: academyId,
    slug: "academie-jeff",
    name: "Académie Jeff",
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
    coverIcon: "code",
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
            body: `## Fonctions

Une fonction regroupe une action réutilisable.

Exemple : au clic sur « Commander », vérifier le numéro puis ouvrir WhatsApp.`,
          },
          {
            id: "web-l3-2",
            title: "Valider un formulaire commande",
            minutes: 20,
            order: 2,
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
            body: `## Héberger

Pages statiques : Netlify, GitHub Pages, ou hébergeur local. Gardez une copie hors ligne du site livré.`,
          },
          {
            id: "web-l4-2",
            title: "Checklist avant de livrer au client",
            minutes: 12,
            order: 2,
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
    coverIcon: "wallet",
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
            body: `## Opérateurs

Chaque opérateur a ses frais et plafonds. Affichez clairement les numéros acceptés près de la caisse.`,
          },
          {
            id: "mm-l1-3",
            title: "Fraudes courantes à éviter",
            minutes: 13,
            order: 3,
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
            body: `## En attente

Ne livrez pas avant confirmation. Notez le nom du client et l'heure. Relancez calmement après 2-3 minutes.`,
          },
          {
            id: "mm-l2-3",
            title: "Remboursements et erreurs de montant",
            minutes: 14,
            order: 3,
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
            body: `## Colonnes utiles

Date | Heure | Client | Opérateur | Montant | Réf SMS | Remarque

Totalisez le soir et comparez au solde affiché.`,
          },
          {
            id: "mm-l3-2",
            title: "Trouver un écart rapidement",
            minutes: 14,
            order: 2,
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

  const courseWhatsapp: Course = {
    id: newId("crs"),
    academyId,
    slug: "vente-whatsapp-artisans",
    title: "Vente WhatsApp pour artisans",
    tagline: "Catalogue, devis et fidélisation sur le canal le plus utilisé",
    description:
      "Transformez WhatsApp en vitrine pro : profil, catalogue photos, devis clairs, relances et paiements MoMo. Trois modules progressifs avec quiz.",
    priceCdf: 750,
    currency: "CDF",
    status: "published",
    coverIcon: "store",
    createdAt: now,
    updatedAt: now,
    modules: [
      {
        id: "wa-m1",
        title: "Profil pro",
        summary: "Photo, bio, horaires, catalogue de base.",
        order: 1,
        lessons: [
          {
            id: "wa-l1-1",
            title: "Configurer un profil qui vend",
            minutes: 12,
            order: 1,
            body: `## Profil

- Photo nette de vos produits (pas de selfie flou).
- Bio : métier + quartier + horaires.
- Statut : « Devis sous 2 h · Paiement MoMo ».`,
          },
          {
            id: "wa-l1-2",
            title: "Créer un mini-catalogue photo",
            minutes: 15,
            order: 2,
            body: `## Catalogue

3 à 8 photos max au début. Même fond, bonne lumière. Prix ou « à partir de » sous chaque image.`,
          },
          {
            id: "wa-l1-3",
            title: "Messages d'accueil enregistrés",
            minutes: 10,
            order: 3,
            body: `## Réponses rapides

Préparez : salutation, liste de produits, délais, zones de livraison.`,
          },
        ],
        quiz: [
          {
            id: "wa-q1a",
            prompt: "Que mettre en priorité sur la photo de profil ?",
            choices: [
              "Une photo de vacances",
              "Une image nette de votre offre",
              "Un meme",
              "Rien",
            ],
            correctIndex: 1,
            explanation: "Le client doit comprendre ce que vous vendez en 1 seconde.",
          },
          {
            id: "wa-q1b",
            prompt: "Combien de photos pour démarrer un catalogue ?",
            choices: ["Aucune", "3 à 8 photos nettes", "200 photos", "Uniquement des vidéos"],
            correctIndex: 1,
            explanation: "Peu mais net : le client compare vite.",
          },
        ],
      },
      {
        id: "wa-m2",
        title: "Devis et commande",
        summary: "Qualifier le besoin, chiffrer, confirmer.",
        order: 2,
        lessons: [
          {
            id: "wa-l2-1",
            title: "Questions pour qualifier le client",
            minutes: 14,
            order: 1,
            body: `## Qualifier

Budget approximatif, délai, taille / quantité, lieu de livraison. Une question à la fois.`,
          },
          {
            id: "wa-l2-2",
            title: "Modèle de devis WhatsApp",
            minutes: 16,
            order: 2,
            body: `## Devis type

Article | Qté | Prix | Total  
Délai : …  
Acompte : …  
Valable jusqu'au : …

Envoyez en texte clair, pas seulement en image floue.`,
          },
          {
            id: "wa-l2-3",
            title: "Confirmer paiement MoMo + production",
            minutes: 12,
            order: 3,
            body: `## Après paiement

1. Confirmer réception du MoMo.
2. Donner un délai réaliste.
3. Envoyer une photo « en cours » si le délai dépasse 48 h.`,
          },
        ],
        quiz: [
          {
            id: "wa-q2a",
            prompt: "Pourquoi un devis écrit est utile ?",
            choices: [
              "Pour remplir le téléphone",
              "Pour éviter malentendus sur prix et délai",
              "Parce que WhatsApp l'impose",
              "Pour bloquer le client",
            ],
            correctIndex: 1,
            explanation: "Le devis aligne client et artisan avant production.",
          },
          {
            id: "wa-q2b",
            prompt: "Quand démarrer la production ?",
            choices: [
              "Dès le premier « ok » oral",
              "Après accord clair et acompte / paiement selon vos règles",
              "Jamais",
              "Après 10 messages",
            ],
            correctIndex: 1,
            explanation: "Protégez votre temps et vos stocks.",
          },
        ],
      },
      {
        id: "wa-m3",
        title: "Fidélisation",
        summary: "Relances, avis, petites campagnes Status.",
        order: 3,
        lessons: [
          {
            id: "wa-l3-1",
            title: "Relancer sans harceler",
            minutes: 11,
            order: 1,
            body: `## Relance

J+1 après devis, puis J+4 max. Message court, utile, avec une option de sortie (« dites STOP »).`,
          },
          {
            id: "wa-l3-2",
            title: "Demander un avis et une photo client",
            minutes: 10,
            order: 2,
            body: `## Preuve sociale

Après livraison : « Une photo vous va ? » Republiez (avec accord) en Status.`,
          },
          {
            id: "wa-l3-3",
            title: "Status hebdo qui convertit",
            minutes: 12,
            order: 3,
            body: `## Status

1 nouveauté + 1 témoignage + 1 promo limitée. Pas 30 stories chaotiques.`,
          },
        ],
        quiz: [
          {
            id: "wa-q3a",
            prompt: "Combien de relances après un devis en général ?",
            choices: [
              "Une vingtaine par jour",
              "1 à 2 messages utiles, espacés",
              "Aucune jamais",
              "Un appel à 5 h du matin",
            ],
            correctIndex: 1,
            explanation: "La relance respecte le client tout en restant visible.",
          },
        ],
      },
    ],
  };

  return {
    seedVersion: SEED_VERSION,
    users: [teacher, learner],
    academies: [academy],
    courses: [courseWeb, courseMomo, courseWhatsapp],
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
