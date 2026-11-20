# Yekola sur Pi Next

Date limite de soumission : 5 janvier 2027, 23 h 59 PT.

## Économie

- L’enseignant paie l’abonnement Yekola : Free 0 π, Base 1 π, Pro 1,5 π, Max 2 π. 100 % revient à Yekola.
- L’apprenant paie le cours (un livre se publie comme un cours). 1 π = 1 000 FC.
- Yekola retient la commission du plan (20 % / 10 % / 5 % / 0 %). Le net crédite le solde Pi de l’enseignant.
- Après paiement, le pack hors ligne s’ouvre.

## Côté Pioneer (à faire par l’équipe)

1. Compte Pi + Pi Browser (le site minepi.com ne s’ouvre pas depuis le Mac).
2. Inscrire **chaque** membre dans la Developer Web Console, onglet Hackathon.
3. Créer l’app **Yekola**, URL `https://yekola.mcbuleli.com`.
4. Mettre la clé **Sandbox** dans `web/.env` : `API_KEY_YEKOLA`, wallet, `NEXT_PUBLIC_PI_SANDBOX=1`. Ne pas committer.
5. Sandbox : [yekola-u9r1](https://sandbox.minepi.com/mobile-app-ui/app/yekola-u9r1) avec `npm run dev` actif.
6. **Connexion** : uniquement **Continuer avec Pi** (pas de comptes email dans le Sandbox).
7. **Test paiement** : catalogue → cours → **Payer … π** → app Pi Testnet.
8. **Étape suivante** : déployer sur `https://yekola.mcbuleli.com`, renseigner `frontend_url` dans [Pi Developers](https://developers.minepi.com/devconsole/my-apps/6aff5974b28a33a0faf0d9d3), ajouter `PI_VALIDATION_KEY` dans `web/.env`, vérifier le domaine, puis test Pi Browser.
9. Inscription hackathon + 3 cours en anglais + vidéo ≤ 3 min.
8. Préparer 3 cours en anglais et la vidéo ≤ 3 min.

Vérif config : `http://localhost:3015/api/pi/payments` → `configured` et `wallet` à `true`.
