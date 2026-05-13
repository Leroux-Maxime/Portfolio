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
│   └── horaire-tracker-app.js
└── Images/
```

---

## Contact

- Email: <a href="mailto:maximeleroux99@gmail.com">maximeleroux99@gmail.com</a>
- GitHub: <a href="https://github.com/OniZurKa" target="_blank">OniZurKa</a>

---

<div align="center">

Conçu et développé par <strong>Maxime Leroux</strong>

</div>
