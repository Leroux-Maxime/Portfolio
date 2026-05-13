# HoraireTracker ⏱️

Application web de suivi des horaires de travail — vérifiez votre fiche de paie chaque mois, sans jamais vous faire avoir.

100 % front-end, aucun serveur requis. Fonctionne directement dans le navigateur.

![Version](https://img.shields.io/badge/version-1.0-blue) ![Licence](https://img.shields.io/badge/licence-MIT-green)

---

## ✨ Fonctionnalités

- **Vue Semaine** — grille des 7 jours avec navigation avant/arrière, badge de type, couleur rouge/verte selon le delta
- **Vue Journal** — liste chronologique filtrée par mois et type, avec le delta de chaque journée
- **Vue Récap mois** — tableau complet de toutes les journées : arrivée, départ, pause, heures réelles, heures contrat, delta
- **Vue Graphiques** — heures par semaine vs contrat, répartition par type, courbe du delta cumulé
- **4 types de journées** : Normal · Heure sup. · Absence · Partiel
- **Balance mensuelle** : heures réelles vs heures contractuelles, visible d'un coup d'œil
- **Export CSV** : toutes vos données prêtes à comparer avec votre bulletin de salaire
- **Mode sombre** automatique (suit les préférences système)
- **Données persistantes** via `localStorage` — aucun compte requis
- **Responsive** — utilisable sur mobile et tablette

---

## 🚀 Déploiement sur GitHub Pages

La méthode la plus simple pour accéder à l'app depuis n'importe quel appareil.

### 1. Créer un dépôt GitHub

1. Connectez-vous sur [github.com](https://github.com)
2. Cliquez **New repository**
3. Nommez-le `horaires-tracker` (ou autre chose)
4. Laissez-le **Public** (requis pour GitHub Pages gratuit)
5. Cliquez **Create repository**

### 2. Uploader les fichiers

**Option A — Interface web (le plus simple) :**

1. Dans votre dépôt vide, cliquez **uploading an existing file**
2. Glissez-déposez tous les fichiers en **respectant l'arborescence** ci-dessous
3. Committez avec le message `Initial commit`

**Option B — Git en ligne de commande :**

```bash
git clone https://github.com/VOTRE_NOM/horaires-tracker.git
# Copiez les fichiers du projet dans le dossier cloné
cd horaires-tracker
git add .
git commit -m "Initial commit — HoraireTracker"
git push origin main
```

### 3. Activer GitHub Pages

1. Dans votre dépôt → onglet **Settings**
2. Menu gauche → section **Pages**
3. Source : **Deploy from a branch**
4. Branch : `main` / `/ (root)`
5. Cliquez **Save**
6. Après environ 1 minute, l'app est accessible à :

```
https://VOTRE_NOM.github.io/horaires-tracker/
```

> 💡 Ajoutez cette URL en favori sur votre téléphone, ou utilisez "Ajouter à l'écran d'accueil" pour une expérience app native.

---

## 📁 Structure du projet

```
horaires-tracker/
├── index.html          # Page principale (structure HTML)
├── css/
│   └── style.css       # Tous les styles (light + dark mode)
├── js/
│   ├── data.js         # Constantes, Store (localStorage), helpers
│   ├── ui.js           # Fonctions de rendu HTML pour chaque vue
│   └── app.js          # Contrôleur principal — navigation & modal
└── README.md
```

---

## 🔧 Utilisation locale

Ouvrez simplement `index.html` dans votre navigateur. Aucune dépendance à installer.

> ⚠️ Certains navigateurs bloquent les scripts dans les fichiers locaux. Si l'app ne se charge pas, utilisez un serveur local :
>
> ```bash
> # Python 3
> python -m http.server 8080
> # Node.js
> npx serve .
> ```
>
> Puis ouvrez `http://localhost:8080`

---

## 💾 Données

Toutes vos journées sont stockées dans le `localStorage` de votre navigateur. Elles persistent entre les sessions mais sont **liées à l'appareil et au navigateur utilisé**.

Pour récupérer vos données sur un autre appareil, utilisez le bouton **Export CSV** dans la barre latérale.

---

## 🛠️ Personnalisation

### Modifier les heures contractuelles par défaut
Dans `js/data.js`, changez la valeur `7` dans les fonctions qui utilisent `e.contrat || 7` par votre nombre d'heures quotidiennes.

### Modifier le délai d'alerte visuelle
Dans `js/ui.js`, la couleur rouge apparaît quand `h < contrat`. Vous pouvez ajouter une tolérance en changeant la condition.

### Ajouter un type de journée
Dans `js/data.js`, ajoutez une entrée dans `TYPE_COLORS` et `TYPE_HEX`. Dans `index.html`, ajoutez l'option dans les balises `<select id="fType">` et `<select id="filterType">`.

### Changer les couleurs
Dans `css/style.css`, modifiez les variables CSS dans `:root`.

---

## 📄 Licence

MIT — libre d'utilisation, modification et distribution.