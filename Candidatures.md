# JobTracker 🎯

Application web de suivi de candidatures professionnelles — 100 % front-end, aucun serveur requis.

![Screenshot](https://img.shields.io/badge/version-1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

- **Vue Liste** — cartes dépliables avec historique, notes et chips d'info
- **Vue Kanban** — colonnes par statut pour visualiser votre pipeline
- **Vue Statistiques** — graphiques de répartition et d'activité mensuelle + insights clés
- **7 statuts** : Envoyé → Relancé → Entretien → Test technique → Offre reçue → Refus / Abandonné
- **Alerte relance** — point rouge sur les candidatures sans réponse depuis 14+ jours
- **Filtres** — par statut, tri par date / A→Z / statut, recherche textuelle
- **Export CSV** — téléchargement de toutes vos données
- **Mode sombre** automatique (suit les préférences système)
- **Données persistantes** via `localStorage` (aucun compte requis)
- **Responsive** — utilisable sur mobile

## 🚀 Déploiement sur GitHub Pages (recommandé)

C'est la méthode la plus simple pour accéder à l'app depuis n'importe où.

### 1. Créer un dépôt GitHub

1. Connectez-vous sur [github.com](https://github.com)
2. Cliquez sur **New repository**
3. Nommez-le `job-tracker` (ou ce que vous voulez)
4. Laissez-le **Public** (requis pour GitHub Pages gratuit)
5. Cliquez **Create repository**

### 2. Uploader les fichiers

**Option A — Interface web (le plus simple) :**
1. Dans votre dépôt vide, cliquez **uploading an existing file**
2. Glissez-déposez tous les fichiers **en respectant l'arborescence** (voir ci-dessous)
3. Committez

**Option B — Git en ligne de commande :**
```bash
git clone https://github.com/VOTRE_NOM/job-tracker.git
# Copiez les fichiers du projet dans le dossier cloné
cd job-tracker
git add .
git commit -m "Initial commit — JobTracker"
git push origin main
```

### 3. Activer GitHub Pages

1. Dans votre dépôt → onglet **Settings**
2. Section **Pages** (menu gauche)
3. Source : **Deploy from a branch**
4. Branch : `main` / `/ (root)`
5. Cliquez **Save**
6. Après ~1 minute, votre app est accessible à :
   ```
   https://VOTRE_NOM.github.io/job-tracker/
   ```

> 💡 Ajoutez cette URL en favori ou sur l'écran d'accueil de votre téléphone !

## 📁 Structure du projet

```
job-tracker/
├── index.html          # Page principale
├── css/
│   └── style.css       # Tous les styles
├── js/
│   ├── data.js         # Données, Store (localStorage), helpers
│   ├── ui.js           # Fonctions de rendu HTML
│   └── app.js          # Contrôleur principal
└── README.md
```

## 🔧 Utilisation locale

Ouvrez simplement `index.html` dans votre navigateur. Aucun serveur, aucune dépendance à installer.

> ⚠️ Sur certains navigateurs, ouvrir un fichier HTML local peut bloquer le chargement des scripts. Si c'est le cas, utilisez un serveur local :
> ```bash
> # Python 3
> python -m http.server 8080
> # Node.js (npx)
> npx serve .
> ```
> Puis ouvrez `http://localhost:8080`

## 💾 Données

Toutes vos candidatures sont stockées dans le `localStorage` de votre navigateur. Elles persistent entre les sessions mais sont **liées à l'appareil et au navigateur utilisé**.

Pour synchroniser entre appareils, utilisez l'**export CSV** (bouton dans la barre latérale) et réimportez manuellement si besoin.

## 🛠️ Personnalisation

### Modifier les statuts
Dans `js/data.js`, éditez le tableau `STATUTS` et l'objet `STATUS_COLORS`.

### Modifier les couleurs
Dans `css/style.css`, éditez les variables CSS dans `:root`.

### Changer le délai de relance
Dans `js/data.js`, modifiez la constante dans `needsRelance()` (actuellement 14 jours).

## 📄 Licence

MIT — libre d'utilisation, modification et distribution.