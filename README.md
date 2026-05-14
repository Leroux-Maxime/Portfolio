# Portfolio - Maxime Leroux

<div align="center">

<p>
  <strong>Développeur web en formation (L2 Informatique)</strong><br/>
  Portfolio personnel et applications front-end de démonstration.
</p>

<p>
  <img src="https://img.shields.io/badge/HTML-5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS-3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</p>

</div>

---

## Vue d'ensemble

Ce dépôt regroupe deux interfaces front-end distinctes:

1. le portfolio principal, qui présente mon profil, mes compétences, mon parcours et mes contacts;
2. HoraireTracker, une application de suivi des horaires de travail.

Chaque projet reste indépendant, mais partage une structure simple et des fichiers explicites.

---

## Portfolio principal

Page d'accueil personnelle construite pour présenter mon profil et mes projets.

### Sections présentes

- Hero avec présentation rapide, photo et appels à l'action
- À propos avec mon objectif et ma trajectoire d'études
- Projet avec mise en avant de Silence Stellaire
- Compétences avec langages, outils et qualités
- Expérience avec ma chronologie professionnelle
- Formation avec mes diplômes et mon cursus
- Contact avec email et GitHub

### Stack technique

- HTML5
- CSS3 avec animations, gradients et responsive design
- JavaScript pour les animations au scroll, le menu mobile et le fond animé

### Fichiers associés

- [index.html](index.html)
- [CSS/portfolio.css](CSS/portfolio.css)
- [JS/portfolio.js](JS/portfolio.js)

## HoraireTracker

Application web de suivi des horaires de travail avec vues semaine, journal, récapitulatif mensuel et graphiques.

### Fonctionnalités

- Vue semaine avec navigation
- Vue journal filtrable
- Vue récapitulatif mensuel
- Vue graphiques
- Export CSV
- Données persistantes via localStorage
- Mode mobile optimisé avec navigation basse
- Synchronisation cloud optionnelle via Supabase

### Fichiers associés

- [horaires.html](horaires.html)
- [CSS/horaire-tracker.css](CSS/horaire-tracker.css)
- [JS/horaire-tracker-data.js](JS/horaire-tracker-data.js)
- [JS/horaire-tracker-ui.js](JS/horaire-tracker-ui.js)
- [JS/horaire-tracker-app.js](JS/horaire-tracker-app.js)

### Usage local

Ouvrez [horaires.html](horaires.html) dans le navigateur pour lancer l'application.

### Synchronisation cloud

La synchronisation est optionnelle et reste désactivée tant qu'elle n'est pas configurée dans l'interface.

Pour l'activer, il faut renseigner:

- l'URL de votre projet Supabase
- la clé anon du projet
- un code de synchronisation partagé entre vos appareils
- le nom de la table distante

Ensuite, collez le contenu de [supabase-schema.sql](supabase-schema.sql) dans l'éditeur SQL de Supabase une seule fois.

La table créée contient les colonnes `uid`, `sync_token`, `id`, `date`, `type`, `arrive`, `depart`, `pause`, `contrat`, `note` et `updated_at`.

---

## Structure du dépôt

```text
Portfolio/
├── horaires.html
├── index.html
├── README.md
├── CSS/
│   ├── portfolio.css
│   └── horaire-tracker.css
├── JS/
│   ├── portfolio.js
│   ├── horaire-tracker-data.js
│   ├── horaire-tracker-ui.js
│   ├── horaire-tracker-app.js
│   ├── horaire-tracker-firebase-config.js
│   └── horaire-tracker-auth.js
└── Images/
```

---

## Configuration Firebase (HoraireTracker)

HoraireTracker supporte la synchronisation cloud via **Firebase + Firestore**. Cela vous permet de synchroniser vos horaires entre tous vos appareils.

### Étapes de configuration

#### 1. Créer un projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com/)
2. Cliquez sur **Créer un projet**
3. Nommez-le `horaires-tracker` (ou nom de votre choix)
4. Acceptez les conditions et continuez

#### 2. Activer Firestore

1. Dans la console Firebase, allez sur **Firestore Database**
2. Cliquez sur **Créer une base de données**
3. Sélectionnez **Mode production**
4. Choisissez une région proche de vous (par ex. `europe-west1`)

#### 3. Activer l'authentification Google

1. Allez sur **Authentication** → **Sign-in method**
2. Cliquez sur **Google**
3. Activez-le et cliquez sur **Enregistrer**

#### 4. Récupérer votre config Firebase

1. Allez sur **⚙️ Paramètres du projet** (roue dentée en haut à gauche)
2. Onglet **Général** → faites défiler jusqu'à **Vos applications**
3. Cliquez sur **</> Web** pour créer une app web
4. Copiez la config `firebaseConfig`
5. Remplacez la config dans `JS/horaire-tracker-firebase-config.js`

#### 5. Configurer les règles Firestore

1. Dans Firestore, allez sur **Règles**
2. Remplacez par:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chacun peut accéder à ses propres données
    match /horaires/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    match /settings/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

3. Cliquez sur **Publier**

### Utilisation

- Cliquez sur **Se connecter** en haut à droite
- Authentifiez-vous avec Google
- Vos données se synchronisent automatiquement
- Accédez à HoraireTracker depuis n'importe quel appareil avec le même compte Google

---

## Debug: erreur `auth/unauthorized-domain`

Si vous voyez l'erreur "Firebase: This domain is not authorized for OAuth operations (auth/unauthorized-domain)", ajoutez ces domaines dans la console Firebase → Authentication → Authorized domains :

- `localhost`
- `127.0.0.1`
- `localhost:8000` (optionnel, `localhost` suffit pour tous les ports)
- `OniZurKa.github.io` (remplacez par votre nom d'utilisateur GitHub)
- Votre domaine personnalisé si applicable (ex. `monsite.com`)

Pour tester localement facilement, utilisez le script fourni :

```bash
./scripts/serve-local.sh 8000
# ouvre automatiquement http://localhost:8000/horaires.html
```

Après avoir ajouté les domaines, rechargez la page et réessayez la connexion Google.

### Déploiement automatique sur GitHub Pages

Un workflow GitHub Actions a été ajouté pour déployer automatiquement le contenu du dépôt sur la branche `gh-pages` lorsque vous poussez sur la branche `main`.

Pour activer :

1. Poussez vos changements sur `main` :

```bash
git add .
git commit -m "Add GitHub Pages deploy workflow"
git push origin main
```

2. Attendez la fin de l'exécution GitHub Actions (Actions → Deploy to GitHub Pages).
3. Dans les paramètres du dépôt (Settings → Pages), choisissez la source `gh-pages` branch si nécessaire — GitHub peut aussi activer automatiquement la page.

Si vous voulez que je prépare et pousse le commit pour vous, donnez-moi le nom du dépôt GitHub (ex. `OniZurKa/Portfolio`) et je créerai le commit localement ici pour que vous le poussiez, ou je vous fournis la commande complète à exécuter.

## Déployer les règles Firestore

Un fichier `firestore.rules` est fourni à la racine du dépôt. Pour appliquer ces règles sur votre projet Firebase, utilisez le script helper :

```bash
npm install -g firebase-tools    # si nécessaire
firebase login
./scripts/deploy-firestore-rules.sh <your-firebase-project-id>
# ex: ./scripts/deploy-firestore-rules.sh horaires-f3862
```

Cela déploiera les règles contenues dans `firestore.rules`. Vérifiez ensuite la console Firebase → Firestore → Rules.

Si vous préférez éditer manuellement dans la console Firebase (Firestore → Rules), copiez le contenu de `firestore.rules`. Un bloc commenté dans ce fichier propose aussi une option permissive pour debug rapide (ne pas laisser en production).

## Contact

- Email: <a href="mailto:maximeleroux99@gmail.com">maximeleroux99@gmail.com</a>
- GitHub: <a href="https://github.com/OniZurKa" target="_blank">OniZurKa</a>

---

<div align="center">

Conçu et développé par <strong>Maxime Leroux</strong>

</div>
